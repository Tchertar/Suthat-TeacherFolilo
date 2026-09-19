/**
 * Google Workspace Service (Drive + Sheets) using Firebase Auth OAuth Provider
 * Provides seamless persistence directly to user's Google Drive and Google Sheets.
 */
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User, 
  signOut 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Configure Google Auth Provider with Drive & Sheets scopes
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/drive.file');
googleProvider.addScope('https://www.googleapis.com/auth/spreadsheets');
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Cache the access token in memory (mandated: do not store in persistent storage)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

/**
 * Ensures Google Identity Services (GSI) SDK is loaded in the window
 */
export async function ensureGSILoaded(timeoutMs = 6000): Promise<void> {
  if (typeof window === 'undefined') return;
  if ((window as any).google?.accounts?.oauth2) return;

  return new Promise((resolve) => {
    const checkInterval = setInterval(() => {
      if ((window as any).google?.accounts?.oauth2) {
        clearInterval(checkInterval);
        resolve();
      }
    }, 100);

    // Timeout safety
    setTimeout(() => {
      clearInterval(checkInterval);
      resolve();
    }, timeoutMs);
  });
}

/**
 * Sign in using Google Identity Services (GSI) Token Client.
 * GSI uses standard client-side OAuth 2.0 and bypasses Firebase Auth's
 * "auth/unauthorized-domain" whitelist restrictions on ephemeral container domains.
 */
export const signInWithGSI = async (): Promise<{ user: any; accessToken: string }> => {
  await ensureGSILoaded();

  const google = (window as any).google;
  if (!google?.accounts?.oauth2) {
    throw new Error('Google Identity Services SDK ยังไม่โหลดเสร็จสมบูรณ์ โปรดเปิดแอปในหน้าต่างใหม่หรือลองใหม่อีกครั้ง');
  }

  const clientId = firebaseConfig.oAuthClientId;
  if (!clientId) {
    throw new Error('ไม่พบ OAuth Client ID ใน firebase-applet-config.json');
  }

  return new Promise((resolve, reject) => {
    try {
      const client = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
        callback: async (response: any) => {
          if (response.error) {
            console.error('Google OAuth token error:', response);
            if (response.error === 'popup_closed_by_user') {
              return reject(new Error('การลงชื่อเข้าใช้ถูกยกเลิก (หน้าต่าง Pop-up ถูกปิด)'));
            }
            if (response.error === 'access_denied') {
              return reject(new Error('ผู้ใช้ปฏิเสธการให้สิทธิ์การเข้าถึง Google Drive & Sheets'));
            }
            return reject(new Error(`Google OAuth error: ${response.error_description || response.error}`));
          }

          if (!response.access_token) {
            return reject(new Error('ไม่ได้รับ Access Token จาก Google'));
          }

          cachedAccessToken = response.access_token;

          // Retrieve user profile information using the access token
          let userInfo: any = null;
          try {
            const uRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${response.access_token}` }
            });
            if (uRes.ok) {
              userInfo = await uRes.json();
            }
          } catch (e) {
            console.warn('Could not fetch user profile:', e);
          }

          resolve({
            user: userInfo || { email: 'user@google.com', displayName: 'Google User' },
            accessToken: response.access_token
          });
        },
        error_callback: (err: any) => {
          console.error('GSI client error:', err);
          reject(new Error(err?.message || 'เกิดข้อผิดพลาดในการเปิดหน้าต่างลงชื่อเข้าใช้ Google'));
        }
      });

      client.requestAccessToken({ prompt: 'select_account' });
    } catch (err: any) {
      reject(err);
    }
  });
};

/**
 * Initialize auth listener to monitor sign-in state
 */
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Perform Google Sign-in with Drive & Sheets scopes.
 * Tries Google Identity Services first to prevent auth/unauthorized-domain errors,
 * falling back gracefully to Firebase Auth popup.
 */
export const googleSignIn = async (): Promise<{ user: any; accessToken: string }> => {
  try {
    isSigningIn = true;

    // Strategy 1: Google Identity Services (GSI) Token Client
    // This connects directly to Google OAuth2 and avoids Firebase Authorized Domain whitelist blocking
    if ((window as any).google?.accounts?.oauth2) {
      try {
        return await signInWithGSI();
      } catch (gsiErr: any) {
        console.warn('GSI login failed, trying Firebase popup fallback:', gsiErr);
        // If user cancelled, don't fallback to another popup
        if (gsiErr?.message?.includes('ยกเลิก') || gsiErr?.message?.includes('popup_closed')) {
          throw gsiErr;
        }
      }
    }

    // Strategy 2: Firebase Auth signInWithPopup
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (!credential?.accessToken) {
        throw new Error('ไม่สามารถดึง Access Token จาก Google ได้');
      }

      cachedAccessToken = credential.accessToken;
      return { user: result.user, accessToken: cachedAccessToken };
    } catch (fbErr: any) {
      console.error('Firebase Auth error:', fbErr);

      // If Firebase blocked the domain, try GSI one more time after ensuring SDK loaded
      if (fbErr?.code === 'auth/unauthorized-domain' || fbErr?.message?.includes('unauthorized-domain')) {
        try {
          return await signInWithGSI();
        } catch (retryGsiErr: any) {
          const currentDomain = typeof window !== 'undefined' ? window.location.hostname : '';
          throw new Error(
            `โดเมน "${currentDomain}" ยังไม่ได้รับอนุญาตใน Firebase Authorized Domains (auth/unauthorized-domain) กรุณาเปิดแอปในแท็บใหม่ หรือเพิ่มโดเมนใน Firebase Console`
          );
        }
      }

      if (fbErr?.code === 'auth/popup-blocked') {
        throw new Error('เบราว์เซอร์บล็อกหน้าต่าง Pop-up กรุณาอนุญาต Pop-up หรือเปิดในแท็บใหม่แล้วลองอีกครั้ง');
      }

      if (fbErr?.code === 'auth/popup-closed-by-user') {
        throw new Error('การลงชื่อเข้าใช้ถูกยกเลิก (หน้าต่าง Pop-up ถูกปิด)');
      }

      throw fbErr;
    }
  } catch (error: any) {
    console.error('Google Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Request Access Token (uses cached token or opens sign-in popup)
 */
export async function requestGoogleAccessToken(promptUser = true): Promise<string> {
  if (cachedAccessToken) {
    return cachedAccessToken;
  }

  // If user prompt is permitted, trigger Google popup
  if (promptUser) {
    const res = await googleSignIn();
    return res.accessToken;
  }

  throw new Error('ยังไม่ได้เข้าสู่ระบบ Google หรือ Token หมดอายุ');
}

export function setManualAccessToken(token: string) {
  cachedAccessToken = token.trim();
}

export function getStoredToken(): string | null {
  return cachedAccessToken;
}

export async function clearStoredToken() {
  cachedAccessToken = null;
  try {
    await signOut(auth);
  } catch (e) {
    // ignore
  }
}

// ---------------- Google Drive API Helpers ---------------- //

/**
 * Create or find folder in user's Drive
 */
export async function getOrCreateDriveFolder(
  folderName: string, 
  parentFolderId?: string, 
  accessToken?: string
): Promise<{ id: string; name: string }> {
  const token = accessToken || cachedAccessToken;
  if (!token) throw new Error('ไม่พบ Google Access Token โปรดเข้าสู่ระบบใหม่');

  // Search for existing folder
  const query = parentFolderId
    ? `'${parentFolderId}' in parents and name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`
    : `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;

  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)&spaces=drive`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  if (!searchRes.ok) {
    const err = await searchRes.text();
    throw new Error(`ค้นหา Folder ไม่สำเร็จ (${searchRes.status}): ${err}`);
  }

  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0];
  }

  // Create folder
  const meta: any = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder'
  };
  if (parentFolderId) {
    meta.parents = [parentFolderId];
  }

  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(meta)
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`สร้าง Drive Folder ไม่สำเร็จ: ${err}`);
  }

  return await createRes.json();
}

/**
 * Upload file to Google Drive using multipart upload
 */
export async function uploadFileToDrive(
  file: File, 
  folderId?: string, 
  accessToken?: string
): Promise<{ id: string; name: string; webViewLink?: string; size: number }> {
  const token = accessToken || cachedAccessToken;
  if (!token) throw new Error('ไม่พบ Google Access Token');

  const metadata: any = {
    name: file.name,
    mimeType: file.type || 'application/octet-stream',
  };
  if (folderId) {
    metadata.parents = [folderId];
  }

  const boundary = '-------314159265358979323846';
  const closeDelim = `\r\n--${boundary}--`;

  const reader = new FileReader();
  const fileArrayBuffer = await new Promise<ArrayBuffer>((res, rej) => {
    reader.onload = () => res(reader.result as ArrayBuffer);
    reader.onerror = rej;
    reader.readAsArrayBuffer(file);
  });

  const multipartBody = new Blob([
    `--${boundary}\r\n`,
    'Content-Type: application/json; charset=UTF-8\r\n\r\n',
    JSON.stringify(metadata),
    `\r\n--${boundary}\r\n`,
    `Content-Type: ${file.type || 'application/octet-stream'}\r\n\r\n`,
    fileArrayBuffer,
    closeDelim
  ]);

  const uploadRes = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,size',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body: multipartBody
    }
  );

  if (!uploadRes.ok) {
    const errText = await uploadRes.text();
    throw new Error(`Upload ไปยัง Google Drive ล้มเหลว: ${errText}`);
  }

  return await uploadRes.json();
}

// ---------------- Google Sheets API Helpers ---------------- //

/**
 * Create master spreadsheet with all required schema sheets
 */
export async function createMasterSpreadsheet(
  title: string = 'MyPA_Portfolio_DB', 
  folderId?: string, 
  accessToken?: string
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  const token = accessToken || cachedAccessToken;
  if (!token) throw new Error('ไม่พบ Google Access Token');

  const sheetsToCreate = [
    'SETTINGS',
    'PROFILE',
    'EVALUATION_CYCLES',
    'CRITERIA',
    'PA_PLANS',
    'PA_CHALLENGE',
    'EVIDENCE',
    'EVIDENCE_FILES',
    'EVIDENCE_CRITERIA_MAP',
    'AI_ANALYSIS',
    'GENERATED_TEXTS',
    'PROGRESS',
    'SUGGESTIONS',
    'REPORTS',
    'AUDIT_LOG'
  ];

  const body = {
    properties: { title },
    sheets: sheetsToCreate.map(name => ({
      properties: { title: name }
    }))
  };

  const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`สร้าง Google Spreadsheet ไม่สำเร็จ: ${err}`);
  }

  const sheetData = await res.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl = sheetData.spreadsheetUrl;

  // Move file into the dedicated folder if provided
  if (folderId && spreadsheetId) {
    try {
      await fetch(`https://www.googleapis.com/drive/v3/files/${spreadsheetId}?addParents=${folderId}&fields=id,parents`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) {
      console.warn('Could not move sheet to parent folder:', e);
    }
  }

  // Populate Headers for Key Sheets
  await initializeSpreadsheetHeaders(spreadsheetId, token);

  return { spreadsheetId, spreadsheetUrl };
}

/**
 * Initialize Header rows in newly created spreadsheet
 */
async function initializeSpreadsheetHeaders(spreadsheetId: string, token: string) {
  const headersData = [
    {
      range: 'EVIDENCE!A1:V1',
      values: [[
        'evidence_id', 'title', 'activity_type', 'start_date', 'end_date',
        'description', 'role', 'subject', 'grade_level', 'target_group',
        'participant_count', 'process', 'output', 'outcome', 'quantitative_result',
        'qualitative_result', 'problem', 'solution', 'lesson_learned', 'tags',
        'fiscal_year', 'created_at'
      ]]
    },
    {
      range: 'EVIDENCE_FILES!A1:I1',
      values: [[
        'file_id', 'evidence_id', 'drive_file_id', 'drive_url', 'file_name',
        'mime_type', 'file_size', 'file_category', 'uploaded_at'
      ]]
    },
    {
      range: 'EVIDENCE_CRITERIA_MAP!A1:H1',
      values: [[
        'mapping_id', 'evidence_id', 'criterion_id', 'relation_type',
        'ai_confidence', 'ai_reason', 'user_confirmed', 'confirmed_at'
      ]]
    },
    {
      range: 'AUDIT_LOG!A1:E1',
      values: [[
        'log_id', 'timestamp', 'action', 'entity_id', 'details'
      ]]
    }
  ];

  for (const item of headersData) {
    try {
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(item.range)}?valueInputOption=RAW`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ values: item.values })
      });
    } catch (err) {
      console.warn('Header init error for range:', item.range, err);
    }
  }
}

/**
 * Append Evidence row to Google Sheets
 */
export async function appendEvidenceToSheet(spreadsheetId: string, evidence: any, accessToken?: string) {
  const token = accessToken || cachedAccessToken;
  if (!token || !spreadsheetId) return;

  const row = [
    evidence.evidence_id,
    evidence.title || '',
    evidence.activity_type || '',
    evidence.start_date || '',
    evidence.end_date || '',
    evidence.description || '',
    evidence.role || '',
    evidence.subject || '',
    evidence.grade_level || '',
    evidence.target_group || '',
    evidence.participant_count || '',
    evidence.process || '',
    evidence.output || '',
    evidence.outcome || '',
    evidence.quantitative_result || '',
    evidence.qualitative_result || '',
    evidence.problem || '',
    evidence.solution || '',
    evidence.lesson_learned || '',
    (evidence.tags || []).join(', '),
    evidence.fiscal_year || '2570',
    evidence.created_at || new Date().toISOString()
  ];

  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/EVIDENCE!A:V:append?valueInputOption=USER_ENTERED`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ values: [row] })
  });
}

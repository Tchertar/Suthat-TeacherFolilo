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
 * Perform Google Sign-in with Drive & Sheets scopes
 */
export const googleSignIn = async (): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('ไม่สามารถดึง Access Token จาก Google ได้');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
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

export function getStoredToken(): string | null {
  return cachedAccessToken;
}

export async function clearStoredToken() {
  cachedAccessToken = null;
  await signOut(auth);
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

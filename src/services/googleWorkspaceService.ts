/**
 * Google Workspace Service (Drive + Sheets) using client-side OAuth
 * Provides seamless persistence directly to user's Google Drive and Google Sheets.
 */

declare global {
  interface Window {
    google?: any;
  }
}

const SCOPES = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets';

// Token state cache
let currentAccessToken: string | null = null;
let tokenExpiresAt: number = 0;

export interface TokenResponse {
  access_token: string;
  expires_in: number;
}

export function getStoredToken(): string | null {
  if (currentAccessToken && Date.now() < tokenExpiresAt) {
    return currentAccessToken;
  }
  const localTok = localStorage.getItem('mypa_google_token');
  const exp = localStorage.getItem('mypa_google_token_exp');
  if (localTok && exp && Date.now() < parseInt(exp, 10)) {
    currentAccessToken = localTok;
    tokenExpiresAt = parseInt(exp, 10);
    return currentAccessToken;
  }
  return null;
}

export function setStoredToken(token: string, expiresInSeconds: number) {
  currentAccessToken = token;
  tokenExpiresAt = Date.now() + (expiresInSeconds - 60) * 1000;
  localStorage.setItem('mypa_google_token', token);
  localStorage.setItem('mypa_google_token_exp', tokenExpiresAt.toString());
}

export function clearStoredToken() {
  currentAccessToken = null;
  tokenExpiresAt = 0;
  localStorage.removeItem('mypa_google_token');
  localStorage.removeItem('mypa_google_token_exp');
}

/**
 * Request Access Token using Google Identity Services (GSI)
 */
export async function requestGoogleAccessToken(promptUser = true): Promise<string> {
  const existing = getStoredToken();
  if (existing) return existing;

  return new Promise((resolve, reject) => {
    if (!window.google?.accounts?.oauth2) {
      reject(new Error('Google Identity Services library is not loaded. โปรดตรวจสอบการเชื่อมต่ออินเทอร์เน็ต'));
      return;
    }

    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: '762500168772-000000000000.apps.googleusercontent.com', // Configured via project
        scope: SCOPES,
        callback: (response: any) => {
          if (response.error) {
            reject(new Error(response.error_description || response.error));
            return;
          }
          setStoredToken(response.access_token, response.expires_in || 3599);
          resolve(response.access_token);
        },
      });

      client.requestAccessToken({ prompt: promptUser ? '' : 'none' });
    } catch (err: any) {
      reject(err);
    }
  });
}

// ---------------- Google Drive API Helpers ---------------- //

/**
 * Create or find root folder "My_PA_Portfolio" in user's Drive
 */
export async function getOrCreateDriveFolder(folderName: string, parentFolderId?: string, accessToken?: string): Promise<{ id: string; name: string }> {
  const token = accessToken || getStoredToken();
  if (!token) throw new Error('ไม่พบ Google Access Token');

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
    throw new Error(`ค้นหา Folder ไม่สำเร็จ: ${searchRes.statusText}`);
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
    throw new Error(`สร้าง Drive Folder ไม่สำเร็จ: ${createRes.statusText}`);
  }

  return await createRes.json();
}

/**
 * Upload file to Google Drive using multipart upload
 */
export async function uploadFileToDrive(file: File, folderId?: string, accessToken?: string): Promise<{ id: string; name: string; webViewLink?: string; size: number }> {
  const token = accessToken || getStoredToken();
  if (!token) throw new Error('ไม่พบ Google Access Token');

  const metadata: any = {
    name: file.name,
    mimeType: file.type || 'application/octet-stream',
  };
  if (folderId) {
    metadata.parents = [folderId];
  }

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelim = `\r\n--${boundary}--`;

  const reader = new FileReader();
  const fileArrayBuffer = await new Promise<ArrayBuffer>((res, rej) => {
    reader.onload = () => res(reader.result as ArrayBuffer);
    reader.onerror = rej;
    reader.readAsArrayBuffer(file);
  });

  const metadataBlob = new Blob([
    delimiter,
    'Content-Type: application/json; charset=UTF-8\r\n\r\n',
    JSON.stringify(metadata),
    delimiter,
    `Content-Type: ${file.type || 'application/octet-stream'}\r\n`,
    'Content-Transfer-Encoding: base64\r\n\r\n'
  ]);

  // Convert buffer to base64
  let binary = '';
  const bytes = new Uint8Array(fileArrayBuffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64Data = btoa(binary);

  const multipartBody = new Blob([
    delimiter,
    'Content-Type: application/json; charset=UTF-8\r\n\r\n',
    JSON.stringify(metadata),
    delimiter,
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
export async function createMasterSpreadsheet(title: string = 'MyPA_Portfolio_DB', folderId?: string, accessToken?: string): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  const token = accessToken || getStoredToken();
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
  const token = accessToken || getStoredToken();
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

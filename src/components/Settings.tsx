import React, { useState } from 'react';
import { SystemSettings, UserProfile, Criterion } from '../types';
import { 
  requestGoogleAccessToken, 
  getOrCreateDriveFolder, 
  createMasterSpreadsheet,
  clearStoredToken,
  signInWithGSI,
  setManualAccessToken
} from '../services/googleWorkspaceService';
import { 
  Settings as SettingsIcon, 
  CheckCircle2, 
  AlertTriangle, 
  FolderSync, 
  Database, 
  Sparkles, 
  User, 
  ExternalLink,
  Loader2,
  Trash2,
  DownloadCloud,
  ChevronRight,
  ShieldCheck,
  Copy,
  Check,
  Key,
  Globe
} from 'lucide-react';

interface SettingsProps {
  settings: SystemSettings;
  profile: UserProfile;
  criteria: Criterion[];
  onUpdateSettings: (newSettings: SystemSettings) => void;
  onUpdateProfile: (newProfile: UserProfile) => void;
  onClearSampleData: () => void;
  evidenceCount: number;
  onNavigateToProfile?: () => void;
}

export const Settings: React.FC<SettingsProps> = ({
  settings,
  profile,
  criteria,
  onUpdateSettings,
  onUpdateProfile,
  onClearSampleData,
  evidenceCount,
  onNavigateToProfile
}) => {
  const [profileForm, setProfileForm] = useState<UserProfile>(profile);
  const [settingsForm, setSettingsForm] = useState<SystemSettings>(settings);
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);
  const [googleStatusMsg, setGoogleStatusMsg] = useState('');
  const [googleErrorDetails, setGoogleErrorDetails] = useState<{ isUnauthorizedDomain?: boolean; msg?: string } | null>(null);
  const [showManualToken, setShowManualToken] = useState(false);
  const [manualTokenInput, setManualTokenInput] = useState('');
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';

  const copyDomainToClipboard = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(currentHostname);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2500);
    }
  };

  // Profile Save
  const handleSaveProfile = () => {
    onUpdateProfile(profileForm);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  // Helper to complete Workspace setup once token is obtained
  const completeWorkspaceSetup = async (token: string) => {
    setGoogleStatusMsg('กำลังสร้าง/ตรวจสอบโฟลเดอร์หลัก "My_PA_Portfolio" ใน Google Drive...');

    // 1. Root Drive Folder
    const rootFolder = await getOrCreateDriveFolder('My_PA_Portfolio', undefined, token);

    // 2. Year subfolder
    setGoogleStatusMsg(`กำลังสร้างโฟลเดอร์ปีงบประมาณ "${profileForm.fiscalYear}" ใน Google Drive...`);
    const yearFolder = await getOrCreateDriveFolder(profileForm.fiscalYear, rootFolder.id, token);

    // 3. Master Spreadsheet DB
    setGoogleStatusMsg('กำลังเตรียมสร้าง Master Spreadsheet "MyPA_Portfolio_DB" พร้อมตารางโครงสร้าง...');
    const sheet = await createMasterSpreadsheet(`MyPA_Portfolio_DB_${profileForm.fiscalYear}`, yearFolder.id, token);

    const updated = {
      ...settingsForm,
      isGoogleConnected: true,
      driveFolderId: yearFolder.id,
      driveFolderName: `My_PA_Portfolio/${profileForm.fiscalYear}`,
      spreadsheetId: sheet.spreadsheetId,
      spreadsheetUrl: sheet.spreadsheetUrl
    };

    setSettingsForm(updated);
    onUpdateSettings(updated);
    setGoogleErrorDetails(null);
    setGoogleStatusMsg('เชื่อมต่อ Google Drive และสร้าง Google Sheets Database สำเร็จเรียบร้อย!');
  };

  // Connect Google Workspace (Create Drive Folder & Spreadsheet Database)
  const handleConnectGoogle = async () => {
    setIsConnectingGoogle(true);
    setGoogleErrorDetails(null);
    setGoogleStatusMsg('กำลังขอสิทธิ์การเข้าถึง Google Workspace (Drive & Sheets)...');

    try {
      const token = await requestGoogleAccessToken(true);
      await completeWorkspaceSetup(token);
    } catch (err: any) {
      console.error('Connection error:', err);
      const msg = err.message || 'ไม่สามารถเชื่อมต่อได้';
      const isUnauth = msg.includes('unauthorized-domain') || msg.includes('Authorized Domains');
      setGoogleErrorDetails({
        isUnauthorizedDomain: isUnauth,
        msg
      });
      setGoogleStatusMsg(`เกิดข้อผิดพลาด: ${msg}`);
    } finally {
      setIsConnectingGoogle(false);
    }
  };

  // Connect directly with GSI
  const handleConnectGSI = async () => {
    setIsConnectingGoogle(true);
    setGoogleErrorDetails(null);
    setGoogleStatusMsg('กำลังเปิดหน้าต่างลงชื่อเข้าใช้ Google Identity Services...');

    try {
      const res = await signInWithGSI();
      await completeWorkspaceSetup(res.accessToken);
    } catch (err: any) {
      console.error('GSI Connection error:', err);
      const msg = err.message || 'ไม่สามารถเชื่อมต่อได้';
      setGoogleErrorDetails({
        isUnauthorizedDomain: msg.includes('unauthorized-domain'),
        msg
      });
      setGoogleStatusMsg(`เกิดข้อผิดพลาด: ${msg}`);
    } finally {
      setIsConnectingGoogle(false);
    }
  };

  // Connect using manual token
  const handleConnectManualToken = async () => {
    if (!manualTokenInput.trim()) return;
    setIsConnectingGoogle(true);
    setGoogleErrorDetails(null);
    setGoogleStatusMsg('กำลังตรวจสอบ Access Token...');

    try {
      setManualAccessToken(manualTokenInput.trim());
      await completeWorkspaceSetup(manualTokenInput.trim());
      setShowManualToken(false);
      setManualTokenInput('');
    } catch (err: any) {
      console.error('Manual Token error:', err);
      setGoogleErrorDetails({ msg: err.message });
      setGoogleStatusMsg(`เกิดข้อผิดพลาดในการใช้ Token: ${err.message}`);
    } finally {
      setIsConnectingGoogle(false);
    }
  };

  const handleDisconnect = () => {
    clearStoredToken();
    const updated = {
      ...settingsForm,
      isGoogleConnected: false,
      driveFolderId: undefined,
      spreadsheetId: undefined
    };
    setSettingsForm(updated);
    onUpdateSettings(updated);
    setGoogleStatusMsg('ยกเลิกการเชื่อมต่อเรียบร้อยแล้ว');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-xs">
        <h1 className="text-xl font-bold text-purple-950 tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-purple-700" />
          การตั้งค่าระบบ (Settings &amp; Connections)
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          จัดการการเชื่อมต่อ Google Workspace (Drive/Sheets), ข้อมูลโปรไฟล์ผู้รับการประเมิน และการจัดการฐานข้อมูล
        </p>
      </div>

      {savedNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          บันทึกการตั้งค่าเรียบร้อยแล้ว
        </div>
      )}

      {/* Full Profile Access Banner */}
      <div className="bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950 rounded-2xl p-6 border border-purple-800 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-400/20 border border-amber-300/40 text-amber-300 flex items-center justify-center shrink-0">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>โปรไฟล์ครูและประวัติการรับราชการฉบับเต็ม</span>
              <span className="px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
                แนะนำ
              </span>
            </h2>
            <p className="text-xs text-purple-200 mt-1 max-w-xl">
              บันทึกประวัติการศึกษา ใบอนุญาตประกอบวิชาชีพ เครื่องราชอิสริยาภรณ์ วันบรรจุ และภาระงานสอน
            </p>
          </div>
        </div>
        {onNavigateToProfile && (
          <button
            onClick={onNavigateToProfile}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            เปิดหน้าแก้ไขโปรไฟล์ฉบับเต็ม
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Google Workspace Setup Section */}
      <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-purple-100 pb-3">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-purple-700" />
            <div>
              <h2 className="text-base font-bold text-purple-950">
                Google Workspace Storage Adapter
              </h2>
              <p className="text-xs text-slate-500">
                Google Drive = โฟลเดอร์ไฟล์หลักฐาน, Google Sheets = ฐานข้อมูลตารางผลงาน
              </p>
            </div>
          </div>

          {settingsForm.isGoogleConnected ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              เชื่อมต่อเรียบร้อยแล้ว
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-900 text-xs font-bold rounded-full border border-amber-300">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              พร้อมเชื่อมต่อ
            </span>
          )}
        </div>

        {googleStatusMsg && (
          <div className={`p-4 rounded-xl text-xs flex items-start gap-3 ${
            googleErrorDetails ? 'bg-rose-50/80 border border-rose-200 text-rose-900' : 'bg-purple-50/50 border border-purple-100 text-purple-950'
          }`}>
            <FolderSync className={`w-4 h-4 mt-0.5 shrink-0 ${googleErrorDetails ? 'text-rose-600' : 'text-purple-700'}`} />
            <div className="flex-1 space-y-2">
              <p className="font-medium leading-relaxed">{googleStatusMsg}</p>

              {/* Specific Guidance for auth/unauthorized-domain */}
              {googleErrorDetails?.isUnauthorizedDomain && (
                <div className="mt-3 p-3.5 bg-white/90 rounded-xl border border-rose-200/80 space-y-3 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                    <Globe className="w-4 h-4 text-purple-600" />
                    <span>คำแนะนำในการแก้ไขปัญหาโดเมนเชื่อมต่อ (Domain Authorization)</span>
                  </div>
                  <p className="text-slate-600 text-2xs leading-relaxed">
                    ข้อผิดพลาด <span className="font-mono text-rose-600 font-bold">auth/unauthorized-domain</span> เกิดจากระบบรักษาความปลอดภัยของ Firebase ที่ยังไม่ได้ลงทะเบียนชื่อโดเมนปัจจุบัน (<span className="font-mono font-bold text-slate-800">{currentHostname}</span>) ใน Authorized Domains
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {/* Direct GSI Button */}
                    <button
                      onClick={handleConnectGSI}
                      disabled={isConnectingGoogle}
                      className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-semibold rounded-lg shadow-2xs text-2xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      เชื่อมต่อตรงด้วย Google Identity Services (แนะนำ)
                    </button>

                    {/* Open in New Window Button */}
                    <button
                      onClick={() => window.open(window.location.href, '_blank')}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-2xs transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      เปิดแอปในหน้าต่างใหม่
                    </button>

                    {/* Copy Domain Button */}
                    <button
                      onClick={copyDomainToClipboard}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-2xs transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      {copiedDomain ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedDomain ? 'คัดลอกชื่อโดเมนแล้ว' : 'คัดลอกชื่อโดเมน'}</span>
                    </button>

                    {/* Toggle Manual Token */}
                    <button
                      onClick={() => setShowManualToken(!showManualToken)}
                      className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium rounded-lg text-2xs transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Key className="w-3.5 h-3.5" />
                      <span>{showManualToken ? 'ซ่อนช่องระบุ Token' : 'ระบุ Access Token โดยตรง'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Manual Access Token Input Option */}
        {showManualToken && !settingsForm.isGoogleConnected && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <Key className="w-4 h-4 text-purple-700" />
              <span>ระบุ Google OAuth Access Token ด้วยตนเอง (Developer / Advanced Option)</span>
            </div>
            <p className="text-slate-500 text-2xs">
              หากมี OAuth Access Token ที่สร้างจาก Google OAuth Playground หรือบัญชีองค์กร สามารถนำมาวางที่นี่เพื่อเริ่มต้นสร้างฐานข้อมูล Drive &amp; Sheets ได้ทันที
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="วาง Access Token ที่ขึ้นต้นด้วย ya29...."
                value={manualTokenInput}
                onChange={(e) => setManualTokenInput(e.target.value)}
                className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono text-2xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-600"
              />
              <button
                onClick={handleConnectManualToken}
                disabled={isConnectingGoogle || !manualTokenInput.trim()}
                className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-50 shrink-0"
              >
                {isConnectingGoogle ? 'กำลังเชื่อมต่อ...' : 'ยืนยันและเชื่อมต่อ'}
              </button>
            </div>
          </div>
        )}

        {settingsForm.isGoogleConnected ? (
          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-emerald-900">Google Drive Folder ID:</span>
                <span className="font-mono text-emerald-700">{settingsForm.driveFolderId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-emerald-900">Google Spreadsheet Database ID:</span>
                <span className="font-mono text-emerald-700">{settingsForm.spreadsheetId}</span>
              </div>
              {settingsForm.spreadsheetUrl && (
                <div className="pt-1">
                  <a
                    href={settingsForm.spreadsheetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-purple-800 font-bold hover:underline inline-flex items-center gap-1"
                  >
                    เปิดดู Spreadsheet ใน Google Sheets <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={handleDisconnect}
                className="px-3.5 py-1.5 border border-slate-300 text-slate-600 hover:text-rose-600 text-xs font-semibold rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                ตัดการเชื่อมต่อ
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              เมื่อกดปุ่มด้านล่าง ระบบจะขออนุญาตผ่าน Google OAuth ของบัญชีของคุณ เพื่อสร้างโฟลเดอร์จัดเก็บหลักฐานบน Google Drive และสร้าง Spreadsheet ฐานข้อมูลโดยอัตโนมัติ
            </p>
            <button
              onClick={handleConnectGoogle}
              disabled={isConnectingGoogle}
              className="px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center gap-3 cursor-pointer disabled:opacity-50"
            >
              {isConnectingGoogle ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-purple-700" />
                  <span>กำลังเชื่อมต่อ Google Workspace...</span>
                </>
              ) : (
                <>
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4.5 h-4.5">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  </svg>
                  <span className="font-bold text-slate-800">ลงชื่อเข้าใช้ด้วย Google เพื่อเชื่อมต่อ Drive &amp; Sheets</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Sample Data Management */}
      <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-xs space-y-3">
        <h2 className="text-base font-bold text-purple-950 border-b border-purple-100 pb-2 flex items-center gap-2">
          <Trash2 className="w-4.5 h-4.5 text-rose-500" />
          การจัดการข้อมูลในระบบ
        </h2>
        <p className="text-xs text-slate-500">
          ปัจจุบันในระบบมีผลงานทั้งหมด {evidenceCount} รายการ (ข้อมูลจำลองตัวอย่างได้ถูกลบออกเรียบร้อยแล้วเพื่อให้ระบบสะอาดพร้อมบันทึกงานจริง)
        </p>
        {evidenceCount > 0 && (
          <div className="pt-1">
            <button
              onClick={onClearSampleData}
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
            >
              ลบผลงานทั้งหมดเพื่อเริ่มต้นใหม่
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

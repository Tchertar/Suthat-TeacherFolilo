import React, { useState } from 'react';
import { SystemSettings, UserProfile, Criterion } from '../types';
import { 
  requestGoogleAccessToken, 
  getOrCreateDriveFolder, 
  createMasterSpreadsheet,
  clearStoredToken
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
  ShieldCheck
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
  const [savedNotice, setSavedNotice] = useState(false);

  // Profile Save
  const handleSaveProfile = () => {
    onUpdateProfile(profileForm);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  // Connect Google Workspace (Create Drive Folder & Spreadsheet Database)
  const handleConnectGoogle = async () => {
    setIsConnectingGoogle(true);
    setGoogleStatusMsg('กำลังขอสิทธิ์การเข้าถึง Google Workspace (Drive & Sheets)...');

    try {
      const token = await requestGoogleAccessToken(true);
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
      setGoogleStatusMsg('เชื่อมต่อ Google Drive และสร้าง Google Sheets Database สำเร็จเรียบร้อย!');
    } catch (err: any) {
      console.error(err);
      setGoogleStatusMsg(`เกิดข้อผิดพลาด: ${err.message || 'ไม่สามารถเชื่อมต่อได้'}`);
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
          <div className="p-3.5 rounded-xl bg-purple-50/50 border border-purple-100 text-xs text-purple-950 flex items-center gap-2">
            <FolderSync className="w-4 h-4 text-purple-700 shrink-0" />
            <span>{googleStatusMsg}</span>
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
              className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              {isConnectingGoogle ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  กำลังเชื่อมต่อ Google Workspace...
                </>
              ) : (
                <>
                  <FolderSync className="w-4 h-4 text-slate-950" />
                  เชื่อมต่อ Google Drive &amp; Google Sheets ตอนนี้
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

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
  DownloadCloud
} from 'lucide-react';

interface SettingsProps {
  settings: SystemSettings;
  profile: UserProfile;
  criteria: Criterion[];
  onUpdateSettings: (newSettings: SystemSettings) => void;
  onUpdateProfile: (newProfile: UserProfile) => void;
  onClearSampleData: () => void;
  evidenceCount: number;
}

export const Settings: React.FC<SettingsProps> = ({
  settings,
  profile,
  criteria,
  onUpdateSettings,
  onUpdateProfile,
  onClearSampleData,
  evidenceCount
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
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-amber-600" />
          การตั้งค่าระบบ (Settings & Connections)
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          จัดการการเชื่อมต่อ Google Workspace (Drive/Sheets), ข้อมูลโปรไฟล์ผู้รับการประเมิน และโมเดล AI
        </p>
      </div>

      {savedNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          บันทึกการตั้งค่าเรียบร้อยแล้ว
        </div>
      )}

      {/* Google Workspace Setup Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-amber-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Google Workspace Storage Adapter
              </h2>
              <p className="text-xs text-slate-500">
                Google Drive = ไฟล์หลักฐานทั้งหมด, Google Sheets = ฐานข้อมูล (Database) หลัก
              </p>
            </div>
          </div>

          {settingsForm.isGoogleConnected ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              เชื่อมต่อเรียบร้อยแล้ว
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-800 text-xs font-bold rounded-full border border-amber-200">
              <AlertTriangle className="w-3.5 h-3.5" />
              พร้อมเชื่อมต่อ
            </span>
          )}
        </div>

        {googleStatusMsg && (
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center gap-2">
            <FolderSync className="w-4 h-4 text-amber-600 shrink-0" />
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
                    className="text-amber-700 font-bold hover:underline inline-flex items-center gap-1"
                  >
                    เปิดดู Spreadsheet ใน Google Sheets <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={handleDisconnect}
                className="px-3.5 py-1.5 border border-slate-300 text-slate-600 hover:text-rose-600 text-xs font-semibold rounded-lg hover:bg-slate-50"
              >
                ตัดการเชื่อมต่อ
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              เมื่อกดปุ่มด้านล่าง ระบบจะขออนุญาตผ่าน Google OAuth ของบัญชีของคุณ เพื่อสร้างโฟลเดอร์จัดเก็บหลักฐานบน Google Drive และสร้าง Spreadsheet ฐานข้อมูลโดยอัตโนมัติ โดยไม่มีค่าใช้จ่ายเพิ่มเติม
            </p>
            <button
              onClick={handleConnectGoogle}
              disabled={isConnectingGoogle}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              {isConnectingGoogle ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  กำลังเชื่อมต่อ Google Workspace...
                </>
              ) : (
                <>
                  <FolderSync className="w-4 h-4" />
                  เชื่อมต่อ Google Drive & Google Sheets ตอนนี้
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Profile Settings */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <User className="w-4.5 h-4.5 text-amber-600" />
          ข้อมูลส่วนตัวและบริบทผู้รับการประเมิน (Personal Context สำหรับ AI)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อ-สกุล</label>
            <input
              type="text"
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">วิทยฐานะ</label>
            <select
              value={profileForm.academicStanding}
              onChange={(e) => setProfileForm({ ...profileForm, academicStanding: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
            >
              <option value="ครู (ไม่มีวิทยฐานะ)">ครู (ไม่มีวิทยฐานะ)</option>
              <option value="ชำนาญการ">ชำนาญการ (ริเริ่ม พัฒนา)</option>
              <option value="ชำนาญการพิเศษ">ชำนาญการพิเศษ (คิดค้น ปรับเปลี่ยน)</option>
              <option value="เชี่ยวชาญ">เชี่ยวชาญ (สร้างสรรค์ ปรับเปลี่ยน)</option>
              <option value="เชี่ยวชาญพิเศษ">เชี่ยวชาญพิเศษ (ประดิษฐ์ คิดค้น)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">สถานศึกษา</label>
            <input
              type="text"
              value={profileForm.school}
              onChange={(e) => setProfileForm({ ...profileForm, school: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">สังกัด</label>
            <input
              type="text"
              value={profileForm.affiliation}
              onChange={(e) => setProfileForm({ ...profileForm, affiliation: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSaveProfile}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
          >
            บันทึกข้อมูลโปรไฟล์
          </button>
        </div>
      </div>

      {/* Sample Data Management */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
          <Trash2 className="w-4.5 h-4.5 text-rose-500" />
          การจัดการข้อมูลตัวอย่าง (Sample Data)
        </h2>
        <p className="text-xs text-slate-500">
          ปัจจุบันในระบบมีผลงานทั้งหมด {evidenceCount} รายการ คุณสามารถล้างข้อมูลตัวอย่างเริ่มต้นออกได้เมื่อพร้อมบันทึกงานจริง
        </p>
        <div className="pt-1">
          <button
            onClick={onClearSampleData}
            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-semibold text-xs rounded-xl transition-colors"
          >
            ลบข้อมูลตัวอย่างทั้งหมด
          </button>
        </div>
      </div>
    </div>
  );
};

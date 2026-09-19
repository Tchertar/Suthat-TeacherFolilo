import React, { useState, useEffect } from 'react';
import { 
  EvidenceItem, 
  Criterion, 
  UserProfile, 
  PAPlan, 
  SystemSettings 
} from './types';
import { 
  DEFAULT_PROFILE, 
  DEFAULT_PA_CRITERIA, 
  DEFAULT_PA_PLAN 
} from './constants';
import { INITIAL_SAMPLE_EVIDENCE } from './sampleData';
import { Sidebar, NavTab } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { TeacherProfile } from './components/TeacherProfile';
import { AddEvidenceModal } from './components/AddEvidence';
import { Portfolio } from './components/Portfolio';
import { PA1Manager } from './components/PA1Manager';
import { AIInbox } from './components/AIInbox';
import { Reports } from './components/Reports';
import { CriteriaExplorer } from './components/CriteriaExplorer';
import { SalaryEvaluation } from './components/SalaryEvaluation';
import { Settings } from './components/Settings';
import { EvidenceDetailModal } from './components/EvidenceDetailModal';
import { Menu, Sparkles, FolderSync, ShieldCheck, User } from 'lucide-react';

export default function App() {
  // Navigation State
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // App Data State with Local Storage persistence
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('mypa_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure education, licenses, decorations exist
        return {
          ...DEFAULT_PROFILE,
          ...parsed,
          education: parsed.education || DEFAULT_PROFILE.education,
          licenses: parsed.licenses || DEFAULT_PROFILE.licenses,
          decorations: parsed.decorations || DEFAULT_PROFILE.decorations,
        };
      } catch (e) {
        return DEFAULT_PROFILE;
      }
    }
    return DEFAULT_PROFILE;
  });

  const [paPlan, setPAPlan] = useState<PAPlan>(() => {
    const saved = localStorage.getItem('mypa_plan');
    return saved ? JSON.parse(saved) : DEFAULT_PA_PLAN;
  });

  const [criteria, setCriteria] = useState<Criterion[]>(() => {
    const saved = localStorage.getItem('mypa_criteria');
    return saved ? JSON.parse(saved) : DEFAULT_PA_CRITERIA;
  });

  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>(() => {
    const saved = localStorage.getItem('mypa_evidence_list');
    return saved ? JSON.parse(saved) : INITIAL_SAMPLE_EVIDENCE;
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('mypa_settings');
    return saved ? JSON.parse(saved) : {
      appName: 'My PA Portfolio',
      userEmail: 'suthut.b@gmail.com',
      fiscalYear: '2570',
      currentCycle: 'ROUND_1',
      geminiModel: 'gemini-2.5-flash',
      isGoogleConnected: false,
      privacyMaskStudentNames: true
    };
  });

  // Selected details / drill-downs
  const [selectedEvidenceForDetail, setSelectedEvidenceForDetail] = useState<EvidenceItem | null>(null);
  const [selectedCriterionId, setSelectedCriterionId] = useState<string>('');

  // Persist states
  useEffect(() => {
    localStorage.setItem('mypa_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('mypa_plan', JSON.stringify(paPlan));
  }, [paPlan]);

  useEffect(() => {
    localStorage.setItem('mypa_criteria', JSON.stringify(criteria));
  }, [criteria]);

  useEffect(() => {
    localStorage.setItem('mypa_evidence_list', JSON.stringify(evidenceList));
  }, [evidenceList]);

  useEffect(() => {
    localStorage.setItem('mypa_settings', JSON.stringify(settings));
  }, [settings]);

  // Handlers
  const handleSaveNewEvidence = (newEvidence: EvidenceItem) => {
    setEvidenceList(prev => [newEvidence, ...prev]);
  };

  const handleDeleteEvidence = (evidenceId: string) => {
    setEvidenceList(prev => prev.filter(e => e.evidence_id !== evidenceId));
  };

  const handleClearSampleData = () => {
    if (confirm('คุณต้องการลบข้อมูลผลงานทั้งหมดใช่หรือไม่?')) {
      setEvidenceList([]);
    }
  };

  const handleConfirmAIMapping = (evidenceId: string, mappingId: string, confirmedCriterionId: string) => {
    setEvidenceList(prev => prev.map(ev => {
      if (ev.evidence_id === evidenceId) {
        return {
          ...ev,
          criteria_mappings: ev.criteria_mappings.map(m => {
            if (m.mapping_id === mappingId) {
              return { ...m, user_confirmed: true, confirmed_at: new Date().toISOString() };
            }
            return m;
          })
        };
      }
      return ev;
    }));
  };

  const handleBatchConfirmAll = () => {
    setEvidenceList(prev => prev.map(ev => ({
      ...ev,
      criteria_mappings: ev.criteria_mappings.map(m => ({
        ...m,
        user_confirmed: true,
        confirmed_at: new Date().toISOString()
      }))
    })));
  };

  // Count unconfirmed AI items
  const unconfirmedAICount = evidenceList.reduce((acc, ev) => {
    return acc + (ev.criteria_mappings?.filter(m => !m.user_confirmed).length || 0);
  }, 0);

  return (
    <div className="min-h-screen bg-[#faf7fd] text-slate-900 font-sans flex antialiased selection:bg-purple-500/20 selection:text-purple-900">
      {/* Sidebar navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          setSelectedCriterionId('');
        }}
        unconfirmedAICount={unconfirmedAICount}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        fiscalYear={settings.fiscalYear}
        isGoogleConnected={settings.isGoogleConnected}
        profile={profile}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-68 flex flex-col min-w-0">
        {/* Top Navbar with White, Purple, Gold Tech Palette */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-purple-100 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-purple-900 hover:bg-purple-50"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-sm font-bold text-purple-950 tracking-tight flex items-center gap-2">
              <span className="text-purple-950 font-bold">{settings.appName}</span>
              <span className="text-purple-300">•</span>
              <span className="text-xs text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded-full font-bold border border-amber-300">
                ปีงบประมาณ {settings.fiscalYear}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {settings.isGoogleConnected ? (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Drive &amp; Sheets ซิงค์แล้ว
              </span>
            ) : (
              <button
                onClick={() => setCurrentTab('settings')}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-xs font-semibold rounded-full transition-colors cursor-pointer"
              >
                <FolderSync className="w-3.5 h-3.5 text-purple-700" />
                เชื่อมต่อ Google Drive
              </button>
            )}

            <button
              onClick={() => setCurrentTab('add-evidence')}
              className="px-3.5 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              + บันทึกผลงาน
            </button>

            {/* Quick Profile Icon Pill */}
            <button
              onClick={() => setCurrentTab('profile')}
              className={`flex items-center gap-2 p-1.5 pr-2.5 rounded-xl border transition-all cursor-pointer ${
                currentTab === 'profile' 
                  ? 'bg-purple-100 border-purple-400 text-purple-950 ring-2 ring-purple-300' 
                  : 'bg-white border-purple-100 hover:border-purple-300 text-slate-700 hover:bg-purple-50/50'
              }`}
              title="ดูและแก้ไขโปรไฟล์ครู"
            >
              <div className="w-6 h-6 rounded-lg overflow-hidden border border-amber-400/80 bg-purple-900 shrink-0 flex items-center justify-center text-amber-300 text-[10px] font-bold">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span>{profile.name ? profile.name.slice(0, 2) : 'ครู'}</span>
                )}
              </div>
              <span className="text-xs font-bold truncate hidden md:inline">
                {profile.name ? profile.name.split(' ')[0] : 'โปรไฟล์'}
              </span>
            </button>
          </div>
        </header>

        {/* Page Content Router */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <Dashboard
              profile={profile}
              paPlan={paPlan}
              criteria={criteria}
              evidenceList={evidenceList}
              onNavigateTab={(tab) => setCurrentTab(tab as NavTab)}
              onSelectCriterion={(critId) => {
                setSelectedCriterionId(critId);
                setCurrentTab('criteria');
              }}
              fiscalYear={settings.fiscalYear}
            />
          )}

          {currentTab === 'profile' && (
            <TeacherProfile
              profile={profile}
              fiscalYear={settings.fiscalYear}
              onUpdateProfile={setProfile}
            />
          )}

          {currentTab === 'add-evidence' && (
            <AddEvidenceModal
              profile={profile}
              activeCriteria={criteria}
              fiscalYear={settings.fiscalYear}
              spreadsheetId={settings.spreadsheetId}
              driveFolderId={settings.driveFolderId}
              onSaveEvidence={handleSaveNewEvidence}
              onNavigateToPortfolio={() => setCurrentTab('portfolio')}
            />
          )}

          {currentTab === 'portfolio' && (
            <Portfolio
              evidenceList={evidenceList}
              criteria={criteria}
              fiscalYear={settings.fiscalYear}
              onSelectEvidence={setSelectedEvidenceForDetail}
              onDeleteEvidence={handleDeleteEvidence}
              onNavigateAdd={() => setCurrentTab('add-evidence')}
            />
          )}

          {currentTab === 'pa1' && (
            <PA1Manager
              paPlan={paPlan}
              profile={profile}
              onUpdatePAPlan={setPAPlan}
            />
          )}

          {currentTab === 'challenge' && (
            <PA1Manager
              paPlan={paPlan}
              profile={profile}
              onUpdatePAPlan={setPAPlan}
            />
          )}

          {currentTab === 'salary' && (
            <SalaryEvaluation
              profile={profile}
              criteria={criteria}
              evidenceList={evidenceList}
              fiscalYear={settings.fiscalYear}
            />
          )}

          {currentTab === 'criteria' && (
            <CriteriaExplorer
              criteria={criteria}
              evidenceList={evidenceList}
              selectedCriterionId={selectedCriterionId}
              onSelectCriterion={setSelectedCriterionId}
              onNavigateAddWithCriterion={(critId) => {
                setCurrentTab('add-evidence');
              }}
            />
          )}

          {currentTab === 'ai-inbox' && (
            <AIInbox
              evidenceList={evidenceList}
              criteria={criteria}
              onConfirmMapping={handleConfirmAIMapping}
              onBatchConfirmAll={handleBatchConfirmAll}
            />
          )}

          {currentTab === 'reports' && (
            <Reports
              profile={profile}
              paPlan={paPlan}
              criteria={criteria}
              evidenceList={evidenceList}
              fiscalYear={settings.fiscalYear}
            />
          )}

          {currentTab === 'development' && (
            <div className="bg-white rounded-2xl p-8 border border-purple-100 shadow-xs space-y-4">
              <h2 className="text-lg font-bold text-purple-950">
                พัฒนาการการปฏิบัติงานและเปรียบเทียบข้ามรอบปี
              </h2>
              <p className="text-xs text-slate-500">
                เปรียบเทียบการสะสมผลงาน ความครอบคลุมของตัวชี้วัด และพัฒนาการของประเด็นท้าทาย
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 bg-purple-50/40 rounded-xl border border-purple-100">
                  <span className="text-xs font-semibold text-purple-700">ปีงบประมาณ {settings.fiscalYear}</span>
                  <div className="text-xl font-bold text-purple-950 mt-1">{evidenceList.length} ผลงาน</div>
                  <div className="text-xs text-amber-700 mt-0.5 font-medium">ครอบคลุม 15 ตัวชี้วัด</div>
                </div>
                <div className="p-4 bg-purple-50/40 rounded-xl border border-purple-100">
                  <span className="text-xs font-semibold text-purple-700">การพัฒนาสื่อ &amp; นวัตกรรม</span>
                  <div className="text-xl font-bold text-purple-950 mt-1">
                    {evidenceList.filter(e => e.activity_type === 'สื่อการเรียนรู้' || e.activity_type === 'นวัตกรรม').length} รายการ
                  </div>
                  <div className="text-xs text-purple-600 mt-0.5">Active Learning</div>
                </div>
                <div className="p-4 bg-purple-50/40 rounded-xl border border-purple-100">
                  <span className="text-xs font-semibold text-purple-700">การพัฒนาวิชาชีพ (PLC/อบรม)</span>
                  <div className="text-xl font-bold text-purple-950 mt-1">
                    {evidenceList.filter(e => e.activity_type === 'PLC' || e.activity_type === 'อบรม').length} รายการ
                  </div>
                  <div className="text-xs text-purple-600 mt-0.5">ต่อเนื่องตลอดปี</div>
                </div>
              </div>
            </div>
          )}

          {currentTab === 'settings' && (
            <Settings
              settings={settings}
              profile={profile}
              criteria={criteria}
              onUpdateSettings={setSettings}
              onUpdateProfile={setProfile}
              onClearSampleData={handleClearSampleData}
              evidenceCount={evidenceList.length}
              onNavigateToProfile={() => setCurrentTab('profile')}
            />
          )}
        </main>
      </div>

      {/* Evidence Detail Modal */}
      {selectedEvidenceForDetail && (
        <EvidenceDetailModal
          evidence={selectedEvidenceForDetail}
          criteria={criteria}
          onClose={() => setSelectedEvidenceForDetail(null)}
          onDelete={handleDeleteEvidence}
        />
      )}
    </div>
  );
}

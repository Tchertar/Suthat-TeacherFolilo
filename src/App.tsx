import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
import { Menu, Sparkles, FolderSync, ShieldCheck, User, Plus } from 'lucide-react';

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

  // Persist states safely
  useEffect(() => {
    try {
      localStorage.setItem('mypa_profile', JSON.stringify(profile));
    } catch (e) {
      console.warn('Failed to save profile to localStorage:', e);
    }
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem('mypa_plan', JSON.stringify(paPlan));
    } catch (e) {
      console.warn('Failed to save paPlan to localStorage:', e);
    }
  }, [paPlan]);

  useEffect(() => {
    try {
      localStorage.setItem('mypa_criteria', JSON.stringify(criteria));
    } catch (e) {
      console.warn('Failed to save criteria to localStorage:', e);
    }
  }, [criteria]);

  useEffect(() => {
    try {
      localStorage.setItem('mypa_evidence_list', JSON.stringify(evidenceList));
    } catch (e) {
      console.warn('Failed to save evidenceList to localStorage:', e);
    }
  }, [evidenceList]);

  useEffect(() => {
    try {
      localStorage.setItem('mypa_settings', JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings to localStorage:', e);
    }
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
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] font-sans flex antialiased selection:bg-[#0071e3]/15 selection:text-[#0071e3]">
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
        {/* Top Navbar with Apple Frosted Glass Aesthetic */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-black/[0.08] px-4 sm:px-8 py-3 flex items-center justify-between transition-all">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-[#1d1d1f] hover:bg-black/[0.04] transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-sm font-semibold text-[#1d1d1f] tracking-tight flex items-center gap-2">
              <span className="text-[#1d1d1f] font-semibold tracking-tight">{settings.appName}</span>
              <span className="text-black/20">•</span>
              <span className="text-[11px] text-[#515154] bg-black/[0.04] px-2.5 py-0.5 rounded-full font-medium">
                ปีงบประมาณ {settings.fiscalYear}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {settings.isGoogleConnected ? (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-black/[0.03] text-[#34c759] text-xs font-medium rounded-full border border-black/[0.05]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34c759] animate-pulse"></span>
                <span className="text-[#1d1d1f] text-[11px]">Drive &amp; Sheets ซิงค์แล้ว</span>
              </span>
            ) : (
              <button
                onClick={() => setCurrentTab('settings')}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/[0.03] hover:bg-black/[0.06] text-[#515154] hover:text-[#1d1d1f] text-xs font-medium rounded-full transition-colors cursor-pointer"
              >
                <FolderSync className="w-3.5 h-3.5 text-[#0071e3]" />
                <span className="text-[11px]">เชื่อมต่อ Google Drive</span>
              </button>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 450, damping: 25 }}
              onClick={() => setCurrentTab('add-evidence')}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-[#0071e3] hover:bg-[#0077ed] text-white font-medium text-xs rounded-full shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>บันทึกผลงาน</span>
            </motion.button>

            {/* Quick Profile Icon Pill */}
            <button
              onClick={() => setCurrentTab('profile')}
              className={`flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full border transition-all cursor-pointer ${
                currentTab === 'profile' 
                  ? 'bg-black/[0.07] border-black/15 text-[#1d1d1f]' 
                  : 'bg-transparent border-transparent hover:bg-black/[0.04] text-[#515154]'
              }`}
              title="ดูและแก้ไขโปรไฟล์ครู"
            >
              <div className="w-6 h-6 rounded-full overflow-hidden border border-black/[0.08] bg-[#e5e5ea] shrink-0 flex items-center justify-center text-[#1d1d1f] text-[10px] font-semibold">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span>{profile.name ? profile.name.slice(0, 2) : 'ครู'}</span>
                )}
              </div>
              <span className="text-xs font-medium truncate hidden md:inline tracking-tight">
                {profile.name ? profile.name.split(' ')[0] : 'โปรไฟล์'}
              </span>
            </button>
          </div>
        </header>

        {/* Page Content Router with Apple Fluid Page Transition */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -6, filter: 'blur(2px)' }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
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
                <div className="bg-white rounded-3xl p-8 border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-6">
                  <div className="space-y-1">
                    <h2 className="text-xl font-semibold text-[#1d1d1f] tracking-tight">
                      พัฒนาการการปฏิบัติงานและเปรียบเทียบข้ามรอบปี
                    </h2>
                    <p className="text-xs text-[#86868b]">
                      เปรียบเทียบการสะสมผลงาน ความครอบคลุมของตัวชี้วัด และพัฒนาการของประเด็นท้าทาย
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div className="p-5 bg-[#fbfbfd] rounded-2xl border border-black/[0.06]">
                      <span className="text-xs font-medium text-[#86868b]">ปีงบประมาณ {settings.fiscalYear}</span>
                      <div className="text-2xl font-bold text-[#1d1d1f] mt-1">{evidenceList.length} ผลงาน</div>
                      <div className="text-xs text-[#34c759] mt-1 font-medium">ครอบคลุม 15 ตัวชี้วัด</div>
                    </div>
                    <div className="p-5 bg-[#fbfbfd] rounded-2xl border border-black/[0.06]">
                      <span className="text-xs font-medium text-[#86868b]">การพัฒนาสื่อ &amp; นวัตกรรม</span>
                      <div className="text-2xl font-bold text-[#1d1d1f] mt-1">
                        {evidenceList.filter(e => e.activity_type === 'สื่อการเรียนรู้' || e.activity_type === 'นวัตกรรม').length} รายการ
                      </div>
                      <div className="text-xs text-[#0071e3] mt-1 font-medium">Active Learning</div>
                    </div>
                    <div className="p-5 bg-[#fbfbfd] rounded-2xl border border-black/[0.06]">
                      <span className="text-xs font-medium text-[#86868b]">การพัฒนาวิชาชีพ (PLC/อบรม)</span>
                      <div className="text-2xl font-bold text-[#1d1d1f] mt-1">
                        {evidenceList.filter(e => e.activity_type === 'PLC' || e.activity_type === 'อบรม').length} รายการ
                      </div>
                      <div className="text-xs text-[#515154] mt-1 font-medium">ต่อเนื่องตลอดปี</div>
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
            </motion.div>
          </AnimatePresence>
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

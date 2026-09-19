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
import { AddEvidenceModal } from './components/AddEvidence';
import { Portfolio } from './components/Portfolio';
import { PA1Manager } from './components/PA1Manager';
import { AIInbox } from './components/AIInbox';
import { Reports } from './components/Reports';
import { CriteriaExplorer } from './components/CriteriaExplorer';
import { SalaryEvaluation } from './components/SalaryEvaluation';
import { Settings } from './components/Settings';
import { EvidenceDetailModal } from './components/EvidenceDetailModal';
import { Menu, Sparkles, FolderSync, ShieldCheck } from 'lucide-react';

export default function App() {
  // Navigation State
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // App Data State with Local Storage persistence
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('mypa_profile');
    return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
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
    if (confirm('คุณต้องการลบข้อมูลตัวอย่างทั้งหมดใช่หรือไม่? (การกระทำนี้จะล้างรายการผลงานทดสอบ)')) {
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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex antialiased selection:bg-amber-500/20 selection:text-amber-900">
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
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-68 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <span>{settings.appName}</span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-semibold border border-amber-200">
                ปีงบประมาณ {settings.fiscalYear}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {settings.isGoogleConnected ? (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Drive &amp; Sheets ซิงค์แล้ว
              </span>
            ) : (
              <button
                onClick={() => setCurrentTab('settings')}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold rounded-full transition-colors cursor-pointer"
              >
                <FolderSync className="w-3.5 h-3.5 text-amber-600" />
                เชื่อมต่อ Google Drive
              </button>
            )}

            <button
              onClick={() => setCurrentTab('add-evidence')}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              + เพิ่มผลงาน
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
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-lg font-bold text-slate-900">
                พัฒนาการการปฏิบัติงานและเปรียบเทียบข้ามรอบปี
              </h2>
              <p className="text-xs text-slate-500">
                เปรียบเทียบการสะสมผลงาน ความครอบคลุมของตัวชี้วัด และพัฒนาการของประเด็นท้าทาย
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-xs font-semibold text-slate-500">ปีงบประมาณ {settings.fiscalYear}</span>
                  <div className="text-xl font-bold text-slate-900 mt-1">{evidenceList.length} ผลงาน</div>
                  <div className="text-xs text-emerald-600 mt-0.5">ครอบคลุม 15 ตัวชี้วัด</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-xs font-semibold text-slate-500">การพัฒนาสื่อ &amp; นวัตกรรม</span>
                  <div className="text-xl font-bold text-slate-900 mt-1">
                    {evidenceList.filter(e => e.activity_type === 'สื่อการเรียนรู้' || e.activity_type === 'นวัตกรรม').length} รายการ
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">Active Learning</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-xs font-semibold text-slate-500">การพัฒนาวิชาชีพ (PLC/อบรม)</span>
                  <div className="text-xl font-bold text-slate-900 mt-1">
                    {evidenceList.filter(e => e.activity_type === 'PLC' || e.activity_type === 'อบรม').length} รายการ
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">ต่อเนื่องตลอดปี</div>
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

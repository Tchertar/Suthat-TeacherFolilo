import React from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  FolderOpen, 
  FileText, 
  Target, 
  CircleDollarSign, 
  ListChecks, 
  Sparkles, 
  FileSpreadsheet, 
  TrendingUp, 
  Settings,
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';

export type NavTab = 
  | 'dashboard'
  | 'add-evidence'
  | 'portfolio'
  | 'pa1'
  | 'challenge'
  | 'salary'
  | 'criteria'
  | 'ai-inbox'
  | 'reports'
  | 'development'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  unconfirmedAICount: number;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  fiscalYear: string;
  isGoogleConnected: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  unconfirmedAICount,
  isMobileOpen,
  setIsMobileOpen,
  fiscalYear,
  isGoogleConnected
}) => {
  const navItems = [
    { id: 'dashboard' as NavTab, label: 'แดชบอร์ดความพร้อม', icon: LayoutDashboard },
    { id: 'add-evidence' as NavTab, label: '+ เพิ่มผลงาน/หลักฐาน', icon: PlusCircle, highlight: true },
    { id: 'portfolio' as NavTab, label: 'คลังผลงานทั้งหมด', icon: FolderOpen },
    { id: 'pa1' as NavTab, label: 'ข้อตกลงพัฒนางาน (PA1)', icon: FileText },
    { id: 'challenge' as NavTab, label: 'ประเด็นท้าทาย', icon: Target },
    { id: 'salary' as NavTab, label: 'ประเมินเลื่อนเงินเดือน', icon: CircleDollarSign },
    { id: 'criteria' as NavTab, label: 'ตัวชี้วัด & หลักเกณฑ์', icon: ListChecks },
    { 
      id: 'ai-inbox' as NavTab, 
      label: 'AI Inbox (รอยืนยัน)', 
      icon: Sparkles,
      badge: unconfirmedAICount > 0 ? unconfirmedAICount : undefined 
    },
    { id: 'reports' as NavTab, label: 'รายงานสรุปผลงาน', icon: FileSpreadsheet },
    { id: 'development' as NavTab, label: 'พัฒนาการรอบปี', icon: TrendingUp },
    { id: 'settings' as NavTab, label: 'ตั้งค่าระบบ', icon: Settings },
  ];

  const handleNavClick = (tab: NavTab) => {
    onSelectTab(tab);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed top-0 left-0 bottom-0 w-68 bg-slate-900 text-slate-100 flex flex-col z-50 transition-transform duration-200 ease-in-out border-r border-slate-800 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* App Logo & Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-slate-100 text-base leading-tight tracking-tight">
                My PA Portfolio
              </div>
              <div className="text-xs text-amber-400/90 font-medium mt-0.5">
                ปีงบประมาณ {fiscalYear}
              </div>
            </div>
          </div>
          <button 
            id="close-mobile-menu-btn"
            className="lg:hidden text-slate-400 hover:text-white p-1"
            onClick={() => setIsMobileOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sync Status Badge */}
        <div className="px-4 py-2.5 bg-slate-950/40 border-b border-slate-800/60 flex items-center justify-between text-xs">
          <span className="text-slate-400">Google Workspace:</span>
          {isGoogleConnected ? (
            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              เชื่อมต่อแล้ว
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-amber-400/90 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              พร้อมเชื่อมต่อ
            </span>
          )}
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            const isHighlight = item.highlight;

            return (
              <button
                id={`nav-tab-${item.id}`}
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left group relative ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20'
                    : isHighlight
                    ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400 group-hover:text-slate-200'}`} />
                <span className="truncate flex-1">{item.label}</span>
                {item.badge !== undefined && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-500 text-white shrink-0 shadow-xs">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Profile Summary */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center font-bold text-amber-300 text-sm shrink-0">
              สบ
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-slate-200 truncate">
                ครูสุทัศน์ บัวขาว
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                ชำนาญการพิเศษ • ม.ปลาย
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

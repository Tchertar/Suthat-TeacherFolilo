import React from 'react';
import { 
  LayoutDashboard, 
  User,
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
  X,
  Award
} from 'lucide-react';
import { UserProfile } from '../types';

export type NavTab = 
  | 'dashboard'
  | 'profile'
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
  profile: UserProfile;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  unconfirmedAICount,
  isMobileOpen,
  setIsMobileOpen,
  fiscalYear,
  isGoogleConnected,
  profile
}) => {
  const navItems = [
    { id: 'dashboard' as NavTab, label: 'แดชบอร์ดความพร้อม', icon: LayoutDashboard },
    { id: 'profile' as NavTab, label: 'ข้อมูลส่วนตัว / โปรไฟล์ครู', icon: User },
    { id: 'add-evidence' as NavTab, label: '+ เพิ่มผลงาน/หลักฐาน', icon: PlusCircle, isAddAction: true },
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
          className="fixed inset-0 bg-purple-950/70 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed top-0 left-0 bottom-0 w-68 bg-[#18092E] text-slate-100 flex flex-col z-50 transition-transform duration-200 ease-in-out border-r border-purple-900/60 shadow-2xl ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* App Logo & Header with White, Purple, Gold Tech Styling */}
        <div className="p-5 border-b border-purple-900/60 flex items-center justify-between bg-[#140726]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 shadow-md shadow-amber-500/20 flex items-center justify-center text-slate-950">
              <div className="w-full h-full rounded-[10px] bg-[#18092E] flex items-center justify-center text-amber-400">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="font-bold text-white text-base leading-tight tracking-tight flex items-center gap-1.5">
                <span>My PA Portfolio</span>
              </div>
              <div className="text-xs text-amber-400 font-semibold mt-0.5 flex items-center gap-1">
                <span>ปีงบประมาณ {fiscalYear}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              </div>
            </div>
          </div>
          <button 
            id="close-mobile-menu-btn"
            className="lg:hidden text-purple-300 hover:text-white p-1"
            onClick={() => setIsMobileOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sync Status Badge */}
        <div className="px-4 py-2.5 bg-[#120522] border-b border-purple-900/40 flex items-center justify-between text-xs">
          <span className="text-purple-300/80">Google Workspace:</span>
          {isGoogleConnected ? (
            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              เชื่อมต่อแล้ว
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-amber-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              พร้อมเชื่อมต่อ
            </span>
          )}
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-3 py-3.5 space-y-1.5 custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            const isAddAction = item.isAddAction;

            return (
              <button
                id={`nav-tab-${item.id}`}
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left group relative cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 text-white font-semibold shadow-md shadow-purple-950/40 border border-purple-400/30'
                    : isAddAction
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20 hover:from-amber-300 hover:to-amber-400'
                    : 'text-purple-200/80 hover:bg-purple-900/40 hover:text-white'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 shrink-0 ${
                  isActive 
                    ? 'text-amber-300' 
                    : isAddAction
                    ? 'text-slate-950'
                    : 'text-purple-400 group-hover:text-purple-200'
                }`} />
                <span className="truncate flex-1">{item.label}</span>
                {item.badge !== undefined && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-500 text-slate-950 shrink-0 shadow-xs">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Profile Summary - Clicking opens Profile Tab */}
        <div 
          onClick={() => handleNavClick('profile')}
          className="p-3.5 border-t border-purple-900/60 bg-[#140726] hover:bg-[#1a0a33] transition-colors cursor-pointer group"
          title="คลิกเพื่อดูและแก้ไขข้อมูลส่วนตัว"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-amber-400/70 bg-purple-950 flex items-center justify-center font-bold text-amber-300 text-sm shrink-0 shadow-xs">
                {profile.avatarUrl ? (
                  <img 
                    src={profile.avatarUrl} 
                    alt={profile.name} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span>{profile.name ? profile.name.slice(0, 2) : 'ครู'}</span>
                )}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#18092E]"></span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                {profile.name || `${profile.prefix || ''}${profile.firstName} ${profile.lastName}`}
              </div>
              <div className="text-[11px] text-purple-300 truncate">
                {profile.position} ({profile.currentRank || 'คศ.1'})
              </div>
              <div className="text-[10px] text-amber-400/90 truncate font-medium">
                คลิกเพื่อแก้ไขโปรไฟล์ ✎
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

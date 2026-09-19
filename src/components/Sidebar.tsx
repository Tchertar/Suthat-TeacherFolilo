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
  X,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'motion/react';
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
    { id: 'add-evidence' as NavTab, label: 'เพิ่มผลงานและหลักฐาน', icon: PlusCircle, isAddAction: true },
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
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed top-0 left-0 bottom-0 w-68 bg-[#ffffff] text-[#1d1d1f] flex flex-col z-50 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] border-r border-black/[0.08] shadow-[0_0_20px_rgba(0,0,0,0.02)] ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* App Logo & Header in Apple Clean Style */}
        <div className="p-5 border-b border-black/[0.06] flex items-center justify-between bg-[#ffffff]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1d1d1f] text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-semibold text-[#1d1d1f] text-[15px] leading-tight tracking-tight">
                My PA Portfolio
              </div>
              <div className="text-[11px] text-[#86868b] font-medium mt-0.5 flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full bg-black/[0.04] text-[#515154]">ปี {fiscalYear}</span>
              </div>
            </div>
          </div>
          <button 
            id="close-mobile-menu-btn"
            className="lg:hidden text-[#86868b] hover:text-[#1d1d1f] p-1.5 rounded-lg hover:bg-black/[0.04] transition-colors"
            onClick={() => setIsMobileOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sync Status Badge */}
        <div className="px-4 py-2 bg-[#fbfbfd] border-b border-black/[0.05] flex items-center justify-between text-xs">
          <span className="text-[#86868b] font-normal">Google Workspace:</span>
          {isGoogleConnected ? (
            <span className="inline-flex items-center gap-1.5 text-[#34c759] font-medium text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34c759]"></span>
              เชื่อมต่อแล้ว
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-[#ff9500] font-medium text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff9500]"></span>
              พร้อมเชื่อมต่อ
            </span>
          )}
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1 custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            const isAddAction = item.isAddAction;

            return (
              <motion.button
                id={`nav-tab-${item.id}`}
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.985 }}
                transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] transition-colors text-left relative cursor-pointer ${
                  isActive
                    ? 'bg-[#0071e3] text-white font-semibold shadow-xs'
                    : isAddAction
                    ? 'bg-[#0071e3]/10 text-[#0071e3] font-semibold hover:bg-[#0071e3]/15'
                    : 'text-[#515154] hover:bg-black/[0.04] hover:text-[#1d1d1f] font-normal'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive 
                    ? 'text-white' 
                    : isAddAction
                    ? 'text-[#0071e3]'
                    : 'text-[#86868b]'
                }`} />
                <span className="truncate flex-1 tracking-tight">{item.label}</span>
                {item.badge !== undefined && (
                  <span className={`px-2 py-0.5 text-[11px] font-bold rounded-full shrink-0 ${
                    isActive ? 'bg-white text-[#0071e3]' : 'bg-[#ff3b30] text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Bottom Profile Summary - Apple ID card style */}
        <div 
          onClick={() => handleNavClick('profile')}
          className="p-3.5 border-t border-black/[0.06] bg-[#fbfbfd] hover:bg-black/[0.02] transition-colors cursor-pointer group"
          title="คลิกเพื่อดูและแก้ไขข้อมูลส่วนตัว"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-full overflow-hidden border border-black/[0.08] bg-[#e5e5ea] flex items-center justify-center font-semibold text-[#1d1d1f] text-xs shrink-0 shadow-2xs">
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
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#34c759] border-2 border-white"></span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-[#1d1d1f] group-hover:text-[#0071e3] transition-colors truncate">
                {profile.name || `${profile.prefix || ''}${profile.firstName} ${profile.lastName}`}
              </div>
              <div className="text-[11px] text-[#86868b] truncate">
                {profile.position} ({profile.currentRank || 'คศ.1'})
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#86868b] group-hover:text-[#0071e3] group-hover:translate-x-0.5 transition-all shrink-0" />
          </div>
        </div>
      </aside>
    </>
  );
};


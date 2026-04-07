import React from 'react';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  MessageSquare, 
  FileText, 
  Settings, 
  Plus, 
  HelpCircle, 
  LogOut,
  Shield
} from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: { name: string; role: string };
  onLogout: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, user, onLogout }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'audit', label: 'Start Audit', icon: ShieldCheck },
    { id: 'chat', label: 'Audit Chat', icon: MessageSquare },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full flex flex-col py-8 px-4 bg-surface-container-low dark:bg-slate-900 w-64 border-r-0 z-50">
      <div className="mb-10 px-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg primary-gradient flex items-center justify-center text-white">
            <Shield size={18} fill="currentColor" />
          </div>
          <h1 className="text-xl font-bold text-primary dark:text-primary-container font-headline">Sovereign Audit</h1>
        </div>
        <p className="text-[10px] text-on-surface-variant font-headline uppercase tracking-widest font-semibold">Infrastructure Intelligence</p>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-headline tracking-tight font-semibold",
              activeTab === item.id 
                ? "text-primary dark:text-primary-container bg-surface-container-lowest shadow-sm border-r-4 border-primary" 
                : "text-on-surface-variant hover:bg-surface-container dark:hover:bg-slate-800"
            )}
          >
            <item.icon size={20} className={activeTab === item.id ? "fill-primary/10" : ""} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto space-y-2 pt-4 border-t border-outline-variant/30">
        <button 
          onClick={() => setActiveTab('audit')}
          className="w-full primary-gradient text-white py-3 px-4 rounded-lg font-headline font-bold text-sm mb-4 transition-all active:scale-95 shadow-lg shadow-primary/20"
        >
          New Scan
        </button>
        
        <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-on-surface-variant font-medium hover:bg-surface-container transition-colors text-sm">
          <HelpCircle size={18} />
          <span>Support</span>
        </button>
        
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-on-surface-variant font-medium hover:bg-surface-container transition-colors text-sm"
        >
          <LogOut size={18} />
          <span>Log Out</span>
        </button>
      </div>

      <div className="mt-4 px-4">
        <div className="flex items-center gap-3 p-3 bg-surface-container rounded-xl">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-container-high">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDRwITEeXkgMumDZnDOcfKpvv-liRIowzxY8zm-6zzuWKLuLRRCgTzQqhNQqqTGhDcgJBrjgojCt17IQZOmNBMU08k49ugUoC0WKM9MfRiFMQdl_j1N2Im6DrPGaYIPVes5ddPqN2UV5-c0dSf4cLbXsaCbXznH45-2v-D_dAn5L9IaqqF90IlTBSMHmUy4UyOVuVmIf-uKkTFM3HmDzdpyVP9czwkP6ChXEfuwbjtYZWYpNlkNDrt9a7Clu_4LQJ2P_wtXEdLBig" 
              alt="User" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold truncate">{user.name}</p>
            <p className="text-[10px] text-on-surface-variant truncate">{user.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

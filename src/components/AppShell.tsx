import React, { useState } from 'react';
import { 
  BarChart3, 
  FileText, 
  Plus, 
  Settings, 
  Shield, 
  MessageSquare,
  Users,
  LayoutDashboard,
  Mic,
  ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';

interface AppShellProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function AppShell({ children, activeTab, setActiveTab }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Matters', icon: LayoutDashboard },
    { id: 'analysis', label: 'Analysis', icon: BarChart3 },
    { id: 'voice', label: 'Voice Assistant', icon: Mic },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#0B0C0E] text-slate-200 font-sans selection:bg-indigo-500/30">
      {/* Sidebar */}
      <aside className={cn(
        "bg-[#111316] border-r border-white/5 flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center font-bold text-white shrink-0 shadow-lg shadow-indigo-900/20">
            PF
          </div>
          {!collapsed && (
            <span className="font-bold tracking-tight text-lg">PatentFlow <span className="text-indigo-400 italic text-sm">OA</span></span>
          )}
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium",
                  active 
                    ? "bg-white/5 text-indigo-400 border border-white/10 shadow-sm" 
                    : "text-slate-500 hover:bg-white/5 hover:text-slate-200"
                )}
              >
                <Icon size={18} />
                {!collapsed && <span>{item.label}</span>}
                {!collapsed && active && <div className="ml-auto w-1 h-3 bg-indigo-400 rounded-full" />}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/5">
            <div className="w-8 h-8 rounded-full bg-indigo-900 border border-indigo-400/30 flex items-center justify-center text-xs font-bold text-indigo-300">
              JS
            </div>
            {!collapsed && (
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-semibold truncate text-slate-200">James Sinon</p>
                <p className="text-[10px] text-slate-500 truncate font-medium uppercase tracking-tighter">Senior Partner</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {children}
      </main>
    </div>
  );
}

import React from 'react';
import { Shield, Brain, Cpu, Database, Volume2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { ProviderStatus } from '../types';

interface TopNavProps {
  title: string;
  subtitle?: string;
  providerStatus: ProviderStatus;
}

export function TopNav({ title, subtitle, providerStatus }: TopNavProps) {
  return (
    <header className="h-14 border-b border-white/10 bg-[#15171A] flex items-center justify-between px-6 shrink-0 relative z-10">
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <h1 className="text-sm font-bold tracking-tight text-white leading-tight">{title}</h1>
          {subtitle && <p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Status Badges */}
        <div className="flex items-center gap-2">
           <Badge label="Kimi" status={providerStatus.kimi} />
           <Badge label="OPS" status={providerStatus.epoOps} />
           <Badge label="Voice" status={providerStatus.voice} />
        </div>

        <div className="w-px h-6 bg-white/10 mx-1"></div>

        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
           <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.5)]"></div>
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Privacy: Local-First</span>
        </div>

        <div className="flex items-center gap-2 ml-2">
          <span className="text-[11px] font-medium text-slate-400">Atty. Sinon</span>
          <div className="w-8 h-8 rounded-full bg-indigo-900 border border-indigo-400/30 flex items-center justify-center text-[10px] font-bold text-indigo-300">
            JS
          </div>
        </div>
      </div>
    </header>
  );
}

function Badge({ label, status }: { label: string, status: string }) {
  const isEnabled = status === 'configured';
  const isMock = status === 'mock';

  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
      <div className={cn(
        "w-1.5 h-1.5 rounded-full",
        isEnabled ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : 
        isMock ? "bg-amber-500" : "bg-slate-700"
      )}></div>
      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">{label}: {status}</span>
    </div>
  );
}

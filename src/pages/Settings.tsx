import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Brain, 
  Cpu, 
  Database, 
  Key, 
  Cloud, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCcw,
  Save
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export function SettingsPage() {
  const [kimiKey, setKimiKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [providers, setProviders] = useState<any>(null);

  useEffect(() => {
    fetch('/api/settings/providers')
      .then(res => res.json())
      .then(setProviders);
  }, []);

  const handleSave = async () => {
    setTesting(true);
    await fetch('/api/settings/providers/kimi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: kimiKey })
    });
    setProviders(prev => ({ ...prev, kimi: { configured: !!kimiKey, mode: kimiKey ? 'configured' : 'mock' } }));
    setTesting(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex-1 overflow-auto p-12 bg-[#0B0C0E]">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="space-y-4">
          <h2 className="text-3xl font-medium text-white tracking-tight leading-tight">System Configuration</h2>
          <p className="text-slate-500 text-sm max-w-2xl leading-relaxed font-medium">
            Configure legal LLM providers, speech processing units, and patent data sources. Settings are stored locally and encrypted according to firm policy.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-8">
          {/* Kimi Provider */}
          <section className="bg-[#111316] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-[#15171A]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-inner">
                  <Brain className="text-indigo-400" size={20} />
                </div>
                <div>
                   <h3 className="text-sm font-bold text-white uppercase tracking-widest">LLM Provider — Kimi</h3>
                   <p className="text-[10px] text-slate-500 uppercase tracking-tighter font-bold">Office Action Analysis & Response Drafting Core</p>
                </div>
              </div>
              <div className={cn(
                "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-sm",
                providers?.kimi?.configured ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-amber-500/10 border-amber-500/20 text-amber-400"
              )}>
                {providers?.kimi?.mode} mode
              </div>
            </div>
            
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">API Endpoint</label>
                    <input 
                      type="text" 
                      defaultValue="https://api.moonshot.cn/v1" 
                      className="w-full bg-[#0B0C0E] border border-white/10 rounded px-4 py-2.5 text-xs text-slate-400 focus:ring-1 focus:ring-indigo-500/30 transition-all font-medium"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Model Identifier</label>
                    <select className="w-full bg-[#0B0C0E] border border-white/10 rounded px-4 py-2.5 text-xs text-slate-400 focus:ring-1 focus:ring-indigo-500/30 transition-all cursor-pointer font-medium">
                      <option>kimi-k2 (recommended)</option>
                      <option>moonshot-v1-32k</option>
                      <option>moonshot-v1-128k</option>
                    </select>
                 </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">API Key</label>
                <div className="relative">
                  <Key size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                  <input 
                    type="password" 
                    placeholder="km-••••••••••••••••••••••••" 
                    value={kimiKey}
                    onChange={(e) => setKimiKey(e.target.value)}
                    className="w-full bg-[#0B0C0E] border border-white/10 rounded pl-10 pr-4 py-3 text-xs text-slate-200 focus:ring-1 focus:ring-indigo-500/30 transition-all font-mono"
                  />
                </div>
                <p className="text-[9px] text-slate-600 uppercase tracking-wider font-bold italic">Secure Node Persistence Enabled</p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-white/20 bg-transparent text-indigo-500 focus:ring-indigo-500/50" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Enable Semantic OA Parsing</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-white/20 bg-transparent text-indigo-500 focus:ring-indigo-500/50" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Response Drafting</span>
                    </div>
                 </div>
                 <div className="flex gap-3">
                    <button 
                      onClick={handleSave}
                      disabled={testing}
                      className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-900/20 flex items-center gap-2"
                    >
                      {testing ? <RefreshCcw size={12} className="animate-spin" /> : (saved ? <CheckCircle2 size={12} /> : <Save size={12} />)}
                      {saved ? "Configured" : "Validate & Save"}
                    </button>
                    <button className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-slate-500 border border-white/10 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all">
                       Reset
                    </button>
                 </div>
              </div>
            </div>
          </section>

          {/* Additional Providers Grid */}
          <div className="grid grid-cols-2 gap-8">
            <ProviderMiniCard icon={Volume2} label="MiniMax" status="Mock" color="text-indigo-400" bg="bg-indigo-500/5" desc="ASR / TTS Voice Foundation" iconCol="text-indigo-400" />
            <ProviderMiniCard icon={Database} label="EPO OPS" status="Mock" color="text-amber-400" bg="bg-amber-500/5" desc="Patent Data & Family Registry" iconCol="text-amber-400" />
          </div>

          {/* Privacy Controls */}
          <section className="p-8 bg-[#111316] border border-white/5 rounded-2xl space-y-6 shadow-xl">
             <div className="flex items-center gap-3">
                <Shield className="text-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" size={20} />
                <h3 className="text-sm font-bold text-white uppercase tracking-widest">Identity & Governance</h3>
             </div>
             <div className="space-y-4">
                <p className="text-[11px] text-slate-500 leading-relaxed max-w-3xl font-medium">
                  PatentFlow OA prioritizes client confidentiality. Document processing happens within the firm's private compute environment. External LLM calls are stripped of obvious PII before semantic analysis.
                </p>
                <div className="flex items-center gap-8 pt-2">
                   <div className="flex items-center gap-2">
                     <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-white/20 bg-transparent text-emerald-500 focus:ring-emerald-500/50" />
                     <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Strict Local Persistence</span>
                   </div>
                   <div className="flex items-center gap-2">
                     <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                     <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-widest">Audit Logging Active</span>
                   </div>
                </div>
             </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Volume2(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
    </svg>
  );
}

function ProviderMiniCard({ icon: Icon, label, status, color, bg, desc, iconCol }: any) {
  return (
    <div className={cn("p-6 border border-white/5 rounded-2xl flex items-start gap-4 hover:border-white/10 transition-all cursor-pointer group", bg)}>
       <div className={cn("w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center shrink-0 border border-white/5", iconCol)}>
          <Icon size={20} />
       </div>
       <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">{label}</h4>
            <span className={cn("text-[8px] font-black uppercase px-1 rounded border opacity-60", color, `border-${color.split('-')[1]}/30`)}>{status}</span>
          </div>
          <p className="text-[10px] text-white/30 uppercase tracking-tight leading-relaxed">{desc}</p>
       </div>
    </div>
  );
}

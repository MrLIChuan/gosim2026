import React, { useState, useEffect } from 'react';
import { AppShell } from './components/AppShell';
import { TopNav } from './components/TopNav';
import { Matter, AnalysisState, ProviderStatus } from './types';
import { MatterDetail } from './pages/MatterDetail';
import { SettingsPage } from './pages/Settings';
import { 
  Search, 
  Filter, 
  Plus, 
  Calendar, 
  ArrowRight,
  Clock,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [matters, setMatters] = useState<Matter[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatterId, setSelectedMatterId] = useState<string | null>(null);
  const [providerStatus, setProviderStatus] = useState<ProviderStatus>({
    kimi: 'mock',
    minimax: 'mock',
    epoOps: 'mock',
    voice: 'mock'
  });

  useEffect(() => {
    // Fetch matters
    fetch('/api/matters')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch matters');
        return res.json();
      })
      .then(data => {
        setMatters(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });

    // Fetch provider settings
    fetch('/api/settings/providers')
      .then(res => res.json())
      .then(data => {
        setProviderStatus({
          kimi: data.kimi.mode,
          minimax: data.minimax.mode,
          epoOps: data.epoOps.mode,
          voice: 'mock'
        });
      })
      .catch(console.error);
  }, []);

  const renderContent = () => {
    if (selectedMatterId) {
      const matter = matters.find(m => m.id === selectedMatterId);
      if (!matter) return null;
      return <MatterDetail matter={matter} onBack={() => setSelectedMatterId(null)} />;
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="flex-1 overflow-auto p-8">
            <div className="max-w-6xl mx-auto space-y-12">
              {/* Hero Section */}
              <section className="space-y-4">
                <h2 className="text-4xl font-light tracking-tight text-white leading-tight">
                  Process Office Actions with <br />
                  <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">traceable AI assistance</span>
                </h2>
                <p className="text-slate-500 max-w-2xl text-sm leading-relaxed">
                  Upload an EPO Office Action, claims, specification, and prior art. PatentFlow OA extracts objections, checks multilingual claim precision, maps prior-art disclosures, and prepares attorney-reviewable response drafts.
                </p>
                <div className="flex gap-4 pt-4">
                  <button className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-900/20">
                    <Plus size={18} />
                    New Matter
                  </button>
                  <button className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded-md text-sm font-bold transition-all">
                    Import Registry
                  </button>
                </div>
              </section>

              {/* Matters List */}
              <section className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-600">Active Matters</h3>
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500 cursor-pointer hover:text-slate-300">
                      Sort by Date <ChevronDown size={14} />
                    </div>
                  </div>
                  <div className="relative group">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
                    <input 
                      type="text" 
                      placeholder="Search application number, applicant..." 
                      className="bg-white/5 border border-white/10 rounded-full pl-9 pr-4 py-1.5 text-xs w-64 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-medium text-slate-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {loading ? (
                    <div className="col-span-full py-12 text-center text-white/20 uppercase tracking-widest text-xs">Loading workflow...</div>
                  ) : (
                    matters.map(m => (
                      <div key={m.id}>
                        <MatterCard 
                          matter={m} 
                          onClick={() => setSelectedMatterId(m.id)} 
                        />
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          </div>
        );
      case 'settings':
        return <SettingsPage />;
      case 'voice':
        if (matters.length === 0) return (
          <div className="flex-1 flex items-center justify-center p-8 bg-black/20">
             <div className="text-center space-y-2">
                <p className="text-white/20 uppercase tracking-widest text-xs font-bold">Waiting for registry...</p>
             </div>
          </div>
        );
        return (
          <div className="flex-1 overflow-hidden">
             <MatterDetail matter={matters[0]} onBack={() => setActiveTab('dashboard')} />
          </div>
        );
      default:
        return (
          <div className="flex-1 flex items-center justify-center p-8 bg-black/20">
             <div className="text-center space-y-2">
                <p className="text-white/20 uppercase tracking-widest text-xs font-bold">Module under construction</p>
                <p className="text-white/40 text-sm">Please select a matter from the dashboard to begin analysis.</p>
             </div>
          </div>
        );
    }
  };

  return (
    <AppShell activeTab={activeTab} setActiveTab={setActiveTab}>
      <TopNav title={selectedMatterId ? "Matter Detail" : "Workspace Dashboard"} subtitle="Office Action Response Workbench" providerStatus={providerStatus} />
      {renderContent()}
    </AppShell>
  );
}

function MatterCard({ matter, onClick }: { matter: Matter, onClick: () => void }) {
  return (
    <motion.div 
      whileHover={{ y: -4, borderColor: 'rgba(99, 102, 241, 0.4)' }}
      className="bg-[#111316] border border-white/5 rounded-xl p-6 cursor-pointer transition-all group relative overflow-hidden"
      onClick={onClick}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-500/20 transition-all" />
      
      <div className="space-y-4 relative z-10">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h4 className="text-lg font-bold text-slate-200 group-hover:text-indigo-400 transition-colors leading-tight">{matter.title}</h4>
            <p className="text-xs font-mono text-slate-500 tracking-wider uppercase">{matter.applicationNumber}</p>
          </div>
          <div className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
            {matter.jurisdiction}
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <div className="w-1 h-1 bg-white/20 rounded-full" />
            <span className="font-medium text-slate-500 uppercase tracking-tighter">Applicant:</span>
            <span className="text-slate-300 font-medium">{matter.applicant}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <div className="w-1 h-1 bg-white/20 rounded-full" />
            <span className="font-medium text-slate-500 uppercase tracking-tighter">Technology:</span>
            <span className="text-slate-300 font-medium">{matter.technologyArea}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div className="flex items-center gap-2 text-rose-400/80">
            <Clock size={12} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Deadline: {matter.deadline}</span>
          </div>
          <div className="flex items-center gap-1.5 text-indigo-400/80 group-hover:gap-2 transition-all">
            <span className="text-[10px] font-bold uppercase tracking-wider">Open Case</span>
            <ArrowRight size={12} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

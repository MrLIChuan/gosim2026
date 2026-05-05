import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  Shield, 
  Play, 
  CheckCircle2, 
  AlertCircle,
  FileSearch,
  BookOpen,
  MessageSquare,
  History,
  Download,
  Terminal,
  ChevronRight,
  Loader2,
  ArrowRight,
  Mic
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Matter, Document, AnalysisState, TaskStatus } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface MatterDetailProps {
  matter: Matter;
  onBack: () => void;
}

export function MatterDetail({ matter, onBack }: MatterDetailProps) {
  const [activeTab, setActiveTab] = useState('oa_summary');
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState('');
  const [completed, setCompleted] = useState(false);

  const tabs = [
    { id: 'oa_summary', label: 'OA Summary', icon: FileSearch },
    { id: 'translation', label: 'Translation Check', icon: Shield },
    { id: 'claim_chart', label: 'Claim Chart', icon: BookOpen },
    { id: 'draft', label: 'Response Draft', icon: FileText },
    { id: 'voice', label: 'Voice Assistant', icon: MessageSquare },
  ];

  const handleRunAnalysis = async () => {
    setAnalyzing(true);
    setCompleted(false);
    setProgress(0);
    setStatusMsg('Initializing pipeline...');

    try {
      const res = await fetch(`/api/matters/${matter.id}/analyze`, { method: 'POST' });
      const { taskId } = await res.json();

      // Polling
      const poll = setInterval(async () => {
        const tRes = await fetch(`/api/tasks/${taskId}`);
        const task: TaskStatus = await tRes.json();
        
        setProgress(task.percent);
        setStatusMsg(task.step);

        if (task.state === AnalysisState.SUCCESS) {
          clearInterval(poll);
          setAnalyzing(false);
          setCompleted(true);
        }
      }, 1000);
    } catch (e) {
      setAnalyzing(false);
      setStatusMsg('Analysis failed');
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#0B0C0E]">
      {/* Sub-header */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#111316] border-b border-white/5 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-1.5 hover:bg-white/5 rounded-md transition-colors text-slate-500 hover:text-slate-200">
            <ArrowLeft size={16} />
          </button>
          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-400/10 px-2 py-0.5 rounded">{matter.jurisdiction} Case</span>
              <h2 className="text-xl font-medium tracking-tight text-white">{matter.title}</h2>
            </div>
            <div className="flex gap-4 text-[11px] text-slate-500 font-medium">
              <span>App No: <span className="text-slate-300 font-mono">{matter.applicationNumber}</span></span>
              <span>Applicant: <span className="text-slate-300">{matter.applicant}</span></span>
              <span>Deadline: <span className="text-rose-400 font-bold">{new Date(matter.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span></span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            disabled={analyzing}
            onClick={handleRunAnalysis}
            className={cn(
              "px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded flex items-center gap-2 transition-all shadow-lg shadow-indigo-900/20",
              analyzing && "opacity-50 cursor-not-allowed"
            )}
          >
            {analyzing ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
            {analyzing ? "Analyzing..." : "Run Analysis Pipeline"}
          </button>
          <button className="px-4 py-2 bg-white/5 border border-white/10 text-white text-xs font-semibold rounded flex items-center gap-2 hover:bg-white/10 transition-colors">
            <Download size={14} />
            Export Draft
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Navigation & Docs */}
        <aside className="w-64 bg-[#111316] border-r border-white/5 flex flex-col p-4 shrink-0 overflow-y-auto">
          <nav className="flex flex-col gap-1 mb-8">
            <div className="text-[10px] uppercase tracking-widest text-slate-600 mb-2 font-bold">Matter Tabs</div>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 text-sm transition-all rounded",
                  activeTab === tab.id 
                    ? "bg-white/5 text-indigo-400 border-r-2 border-indigo-400 font-semibold shadow-[2px_0_0_0_inset_white/5]" 
                    : "text-slate-500 hover:bg-white/5 hover:text-slate-300"
                )}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </nav>
          
          <div className="flex flex-col gap-1">
            <div className="text-[10px] uppercase tracking-widest text-slate-600 mb-2 font-bold">Case Documents</div>
            <DocItem label="Office Action" size="12 pages" status="LOADED" />
            <DocItem label="Current Claims" size="Source • CN" status="LOADED" />
            <DocItem label="Specification" size="Verified" status="LOADED" />
            <DocItem label="Prior Art D1" size="Cited" status="LOADED" />
            <DocItem label="Prior Art D2" size="Pending" status="MISSING" />
            <DocItem label="CN Claim Text" size="Required" status="MISSING" />
          </div>
        </aside>

        {/* Center: Main Content */}
        <main className="flex-1 bg-[#0B0C0E] p-6 flex flex-col overflow-hidden relative">
          <AnimatePresence mode="wait">
            {analyzing ? (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center space-y-6 z-20 bg-[#0B0C0E]/80 backdrop-blur-sm"
              >
                <div className="w-64 space-y-4">
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                     <motion.div 
                       className="h-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.5)]"
                       animate={{ width: `${progress}%` }}
                     />
                  </div>
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                        <Terminal size={14} className="text-indigo-400" />
                        <span>{statusMsg}</span>
                     </div>
                     <span className="text-xs font-bold text-indigo-400">{progress}%</span>
                  </div>
                </div>
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] animate-pulse">Running semantic pipeline v0.1.0</p>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <div className="flex-1 overflow-auto bg-[#0B0C0E]">
             <TabContent tabId={activeTab} matter={matter} completed={completed} />
          </div>
        </main>

        {/* Right Sidebar: Context / Help (if needed) */}
        {activeTab !== 'voice' && (
          <aside className="w-80 bg-[#111316] border-l border-white/5 flex flex-col shrink-0">
             <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#15171A]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-300">Analysis Logs</span>
                </div>
                <div className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 text-[10px] border border-indigo-400/20 rounded font-bold">Traceable AI</div>
             </div>
             <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                <div className="space-y-1.5 p-3 bg-white/5 rounded border border-white/10">
                   <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Pipeline Event</div>
                   <div className="text-[11px] text-slate-300 font-medium leading-relaxed">Extracted 4 independent points of lack of inventive step over D1+D2 combination.</div>
                   <div className="text-[10px] text-slate-600 font-mono">0.2s ago</div>
                </div>
                <div className="space-y-1.5 p-3 bg-white/5 rounded border border-white/10">
                   <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Claim Check</div>
                   <div className="text-[11px] text-slate-300 font-medium leading-relaxed">Validated "consisting of" risk in Claim 1. Recommended remedial language generated.</div>
                   <div className="text-[10px] text-slate-600 font-mono">2s ago</div>
                </div>
             </div>
          </aside>
        )}
      </div>
    </div>
  );
}

function DocItem({ label, size, status }: { label: string, size: string, status: 'LOADED' | 'MISSING' | 'ERROR' }) {
  const isLoaded = status === 'LOADED';
  return (
    <div className={cn(
      "p-3 rounded border transition-all cursor-pointer group mb-2",
      isLoaded 
        ? "bg-white/5 border-white/10 hover:border-white/20 shadow-sm" 
        : "bg-white/[0.02] border-white/5 border-dashed"
    )}>
      <div className="flex items-center justify-between mb-1">
        <div className={cn("text-[11px] font-bold truncate", isLoaded ? "text-slate-200" : "text-slate-500")}>
          {label}.pdf
        </div>
        {isLoaded && <CheckCircle2 size={12} className="text-emerald-500" />}
      </div>
      <div className={cn(
        "text-[10px] font-medium tracking-tight",
        isLoaded ? "text-slate-500" : "text-slate-600"
      )}>
        {size}
      </div>
    </div>
  );
}

function TabContent({ tabId, matter, completed }: { tabId: string, matter: Matter, completed: boolean }) {
  if (!completed && tabId !== 'oa_summary' && tabId !== 'voice') {
     return (
       <div className="h-full flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-full border-2 border-white/5 border-dashed flex items-center justify-center text-white/10">
             <Play size={24} />
          </div>
          <div className="text-center">
            <p className="text-white/20 uppercase tracking-widest text-[10px] font-bold">Pipeline data required</p>
            <p className="text-white/40 text-[11px] max-w-xs">Run the Analysis Pipeline to generate structured legal data for this section.</p>
          </div>
       </div>
     );
  }

  switch(tabId) {
    case 'oa_summary':
      return <OASummaryTab matter={matter} />;
    case 'translation':
      return <TranslationTab />;
    case 'claim_chart':
      return <ClaimChartTab />;
    case 'draft':
      return <DraftTab />;
    case 'voice':
      return <VoiceTab />;
    default:
      return <div className="text-white/20 font-mono text-xs italic">Section Data Stream: [EMULATED]</div>;
  }
}

// Sub-tab Components (simplified for now, would be separate files in real app)
function OASummaryTab({ matter }: { matter: Matter }) {
  return (
    <div className="space-y-8 max-w-5xl">
       <div className="grid grid-cols-4 gap-6">
          <StatBox label="Rejected Claims" value="1-8" color="text-rose-500" bg="bg-rose-500/10" />
          <StatBox label="Cited Documents" value="D1, D2" color="text-indigo-400" bg="bg-indigo-400/10" />
          <StatBox label="Art. References" value="56, 84" color="text-purple-400" bg="bg-purple-400/10" />
          <StatBox label="Draft Readiness" value="92%" color="text-emerald-400" bg="bg-emerald-400/10" />
       </div>

       <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Analysis Findings</h4>
            <span className="text-[10px] text-indigo-400 font-bold uppercase">Trace ID: OA-X992</span>
          </div>
          <div className="space-y-4">
             <ObjectionCard article="56 EPC" claims="1-8" doc="D1, D2" severity="CRITICAL" text="Lack of inventive step. Examiner combines dynamic offset offset from D1 with timing indication from D2." />
             <ObjectionCard article="84 EPC" claims="1, 5" severity="MEDIUM" text="Clarity issue. Term 'dynamic scheduling offset' is unclear regarding calculation basis." />
          </div>
       </div>
    </div>
  );
}

function StatBox({ label, value, color, bg }: any) {
  return (
    <div className={cn("border border-white/5 p-5 rounded-2xl space-y-1 backdrop-blur-sm", bg)}>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
      <p className={cn("text-3xl font-bold tracking-tight", color)}>{value}</p>
    </div>
  );
}

function ObjectionCard({ article, claims, doc, severity, text }: any) {
  return (
    <div className="bg-[#15171A] border border-white/10 rounded-xl p-5 flex gap-5 hover:border-white/20 transition-all">
       <div className={cn(
         "w-1 h-auto rounded-full shrink-0",
         severity === 'CRITICAL' ? "bg-rose-500" : "bg-amber-500"
       )} />
       <div className="space-y-3 flex-1">
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-white uppercase tracking-widest px-2 py-0.5 bg-white/5 rounded border border-white/10">Art. {article}</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Claims: {claims}</span>
            {doc && <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded">Cited: {doc}</span>}
          </div>
          <p className="text-[13px] text-slate-300 leading-relaxed font-medium">{text}</p>
          <div className="flex items-center justify-end">
             <button className="text-[10px] font-bold text-indigo-400 uppercase flex items-center gap-1.5 hover:gap-2.5 transition-all">
                Review Examiner Reasoning <ArrowRight size={12} />
             </button>
          </div>
       </div>
    </div>
  );
}

function TranslationTab() {
  const rows = [
    { feature: 'CL.1.1', source: '包括 / 包含', target: 'consisting of', risk: 'CRITICAL', type: 'Scope Narrowing', issue: 'Dangerous narrowing', recommendation: 'Change to "comprising"' },
    { feature: 'CL.1.2', source: '响应于', target: 'based on', risk: 'WARNING', type: 'Causal Shift', issue: 'Trigger dependency shift', recommendation: 'Use "in response to"' },
    { feature: 'CL.1.3', source: '基于', target: 'according to', risk: 'WARNING', type: 'Term Variance', issue: 'Inconsistent term', recommendation: 'Prefer "based on"' },
  ];
  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-white tracking-tight">Translation Precision Check</h3>
            <p className="text-sm text-slate-500">Comparing Source (CN) vs Target (EN) for legal scope shifts.</p>
          </div>
          <div className="flex gap-4">
            <div className="flex flex-col items-end">
               <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Risk Coverage</span>
               <span className="text-sm font-bold text-emerald-400">94% Analyzed</span>
            </div>
            <div className="flex flex-col items-end">
               <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Critical Risks</span>
               <span className="text-sm font-bold text-rose-500 uppercase">1 Flagged</span>
            </div>
          </div>
       </div>

       <div className="bg-[#15171A] border border-white/10 rounded-lg overflow-hidden flex flex-col shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#1C1F24] text-[11px] uppercase tracking-wider text-slate-500 border-b border-white/10">
              <tr>
                <th className="px-4 py-3 font-semibold">Feature ID</th>
                <th className="px-4 py-3 font-semibold w-1/4">Source (CN)</th>
                <th className="px-4 py-3 font-semibold w-1/4">Target (EN)</th>
                <th className="px-4 py-3 font-semibold">Risk Level</th>
                <th className="px-4 py-3 font-semibold">Issue Type</th>
                <th className="px-4 py-3 font-semibold">Recommendation</th>
              </tr>
            </thead>
            <tbody className="text-[13px] divide-y divide-white/5">
              {rows.map(row => (
                <tr key={row.feature} className={cn(
                  "hover:bg-white/[0.02] transition-colors",
                  row.risk === 'CRITICAL' ? "bg-rose-900/10" : ""
                )}>
                  <td className="px-4 py-4 font-mono text-indigo-400">{row.feature}</td>
                  <td className="px-4 py-4 text-slate-200 font-medium">
                    {row.source}
                  </td>
                  <td className="px-4 py-4">
                    <span className={cn(
                      "font-bold underline decoration-dotted underline-offset-4",
                      row.risk === 'CRITICAL' ? "text-rose-400 decoration-rose-400/50" : "text-amber-400 decoration-amber-400/50"
                    )}>{row.target}</span>
                  </td>
                  <td className="px-4 py-4">
                     <span className={cn(
                       "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border",
                       row.risk === 'CRITICAL' ? "bg-rose-500/20 text-rose-500 border-rose-500/30" : "bg-amber-500/20 text-amber-500 border-amber-500/30"
                     )}>{row.risk}</span>
                  </td>
                  <td className="px-4 py-4 text-slate-400">{row.type}</td>
                  <td className={cn(
                    "px-4 py-4 font-medium",
                    row.risk === 'CRITICAL' ? "text-emerald-400" : "text-slate-300"
                  )}>{row.recommendation}</td>
                </tr>
              ))}
            </tbody>
          </table>
       </div>
    </div>
  );
}

function ClaimChartTab() {
  return (
     <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-white tracking-tight">Claim Feature Chart (vs. D1/D2)</h3>
          <p className="text-sm text-slate-500">Mapping feature disclosures across prior art references.</p>
        </div>
        <div className="bg-[#15171A] border border-white/10 rounded-lg overflow-hidden flex flex-col shadow-xl">
           <table className="w-full text-left border-collapse">
              <thead className="bg-[#1C1F24] text-[11px] uppercase tracking-wider text-slate-500 border-b border-white/10">
                <tr>
                   <th className="px-4 py-3 text-white/30 truncate font-semibold">Feature ID</th>
                   <th className="px-4 py-3 text-white/30 w-1/3 font-semibold">Claim Limitation</th>
                   <th className="px-4 py-3 text-white/30 w-1/3 font-semibold">D1 Disclosure</th>
                   <th className="px-4 py-3 text-white/30 font-semibold">Assessment</th>
                </tr>
              </thead>
              <tbody className="text-[13px] divide-y divide-white/5">
                 <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-4 font-mono text-indigo-400">1.1</td>
                    <td className="px-4 py-4 text-slate-200 font-medium">A method for wireless communication...</td>
                    <td className="px-4 py-4 text-slate-400 leading-relaxed font-serif italic text-xs">Para [0052]: "Methods and systems for LTE/5G network operations..."</td>
                    <td className="px-4 py-4"><span className="text-indigo-400 font-bold uppercase text-[10px] bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">Disclosed</span></td>
                 </tr>
                 <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-4 font-mono text-indigo-400">1.2</td>
                    <td className="px-4 py-4 text-slate-200 font-medium">determining a scheduling offset K0 based on DCI...</td>
                    <td className="px-4 py-4 text-slate-400 leading-relaxed font-serif italic text-xs">Para [0065]: "Fixed timing offsets are signaled in the MIB..."</td>
                    <td className="px-4 py-4"><span className="text-purple-400 font-bold uppercase text-[10px] bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">Partial</span></td>
                 </tr>
              </tbody>
           </table>
        </div>
     </div>
  );
}

function DraftTab() {
  return (
    <div className="h-full flex flex-col space-y-6 max-w-4xl mx-auto">
       <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h3 className="text-lg font-medium text-white tracking-tight">Attorney-Reviewable Response Draft</h3>
            <p className="text-sm text-slate-500 uppercase tracking-widest text-[10px] font-bold">Updated: 2 mins ago</p>
          </div>
          <div className="flex gap-2">
             <button className="px-4 py-1.5 bg-white/5 text-slate-300 text-[10px] font-bold uppercase tracking-widest rounded border border-white/10 hover:bg-white/10 transition-all">Copy</button>
             <button className="px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-widest rounded shadow-lg shadow-indigo-900/20 hover:bg-indigo-500 transition-all flex items-center gap-2"><Download size={14} /> Download DOCX</button>
          </div>
       </div>
       <div className="flex-1 bg-[#15171A] border border-white/10 p-12 overflow-auto font-serif text-slate-300 leading-relaxed shadow-2xl rounded-lg">
          <div className="space-y-8 text-sm">
             <div className="font-bold space-y-2 uppercase tracking-wide text-white border-b border-white/10 pb-4">
                <p>RESPONSES TO COMMUNICATION DATED 15 MAY 2026</p>
                <div className="flex flex-col gap-1 font-mono text-[11px] text-indigo-400 font-normal">
                  <p>Application No.: EP24182456.7</p>
                  <p>Applicant: SinoTel Communications Ltd.</p>
                </div>
             </div>
             
             <p className="indent-8 font-medium">The Applicant respectfully submits the following amendments and arguments in response to the Office Action dated 15 May 2026.</p>
             
             <div className="space-y-4">
                <h5 className="font-bold border-b border-indigo-500/30 pb-1 text-white uppercase tracking-widest text-xs">1. Amendments</h5>
                <p className="indent-8">Claim 1 is amended to clarify that the scheduling offset K0 is <span className="text-indigo-400 font-bold italic">"dynamically indicated"</span> within the DCI payload.</p>
             </div>

             <div className="space-y-4">
                <h5 className="font-bold border-b border-indigo-500/30 pb-1 text-white uppercase tracking-widest text-xs">2. Inventive Step (Art. 56 EPC)</h5>
                <p className="indent-8 leading-loose">The Examiner alleges that claim 1 lacks an inventive step over D1 in view of D2. However, the Applicant respectfully submits that D1 fails to appreciate the relationship between K0 and the specific HARQ-ACK feedback timing...</p>
             </div>
             
             <p className="pt-12 text-center text-slate-600 uppercase tracking-[0.3em] font-sans text-[10px] font-black underline decoration-dotted decoration-slate-800">[Attorney signature required]</p>
          </div>
       </div>
    </div>
  );
}

function VoiceTab() {
  const [active, setActive] = useState(false);
  return (
    <div className="h-full flex flex-col items-center justify-center space-y-12 bg-gradient-to-t from-indigo-900/10 to-transparent">
       <div className="relative">
          <motion.div 
            animate={active ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
            className={cn(
             "w-28 h-28 rounded-full border-4 border-white/10 flex items-center justify-center transition-all bg-[#15171A] shadow-2xl",
             active ? "scale-110 border-indigo-500/50 bg-indigo-500/10 shadow-[0_0_80px_rgba(99,102,241,0.4)]" : "border-white/5"
          )}>
             <Mic size={36} className={active ? "text-indigo-400" : "text-slate-500"} />
          </motion.div>
          <AnimatePresence>
            {active && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                className="absolute -top-14 left-1/2 -translate-x-1/2 px-5 py-2 bg-indigo-600 text-white text-[11px] font-bold uppercase tracking-widest rounded-full whitespace-nowrap shadow-xl"
              >
                WebRTC Session Active
              </motion.div>
            )}
          </AnimatePresence>
       </div>

       <div className="text-center space-y-4">
          <h4 className="text-xl font-medium text-white tracking-tight leading-relaxed">Secure Voice Consultation</h4>
          <p className="text-slate-500 text-[11px] max-w-sm mx-auto leading-relaxed uppercase tracking-widest font-bold">Discuss objections or draft logic using firm-encrypted neural models.</p>
       </div>

       <div className="flex flex-col items-center gap-6">
          <div className="flex gap-3">
             <button 
               onClick={() => setActive(!active)}
               className={cn(
                 "px-10 py-3.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all shadow-xl",
                 active ? "bg-rose-600 hover:bg-rose-500 text-white" : "bg-indigo-600 hover:bg-indigo-500 text-white"
               )}
             >
               {active ? "DISCONNECT" : "INITIALIZE SESSION"}
             </button>
             {!active && (
                <button className="w-12 h-12 flex items-center justify-center bg-white/5 border border-white/10 rounded-full text-slate-400 hover:text-white transition-all">
                  <Shield size={20} />
                </button>
             )}
          </div>
          {!active && (
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] animate-pulse">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
              <span>End-to-End Encryption Ready</span>
            </div>
          )}
       </div>
       
       {active && (
         <div className="w-full max-w-xl flex flex-col gap-4">
            <div className="h-12 w-full bg-slate-900 rounded-full flex items-center px-6 gap-3 border border-white/10 shadow-inner">
               <div className="w-1 h-3 bg-indigo-400/50 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
               <div className="w-1 h-6 bg-indigo-400/80 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
               <div className="w-1 h-4 bg-indigo-400/40 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
               <div className="w-1 h-8 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
               <div className="w-1 h-5 bg-indigo-400/60 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
               <div className="w-1 h-7 bg-indigo-400/90 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
               <span className="ml-auto text-[11px] font-mono text-indigo-400/80">00:14 / Secure Node 01</span>
            </div>
            
            <div className="w-full bg-[#15171A] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl">
               <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Real-time Transcript</p>
                  <span className="text-[10px] text-slate-600 font-mono">Trace v0.1</span>
               </div>
               <div className="space-y-4 max-h-48 overflow-auto pr-2 custom-scrollbar">
                  <div className="flex flex-col gap-1">
                     <span className="text-[9px] text-slate-600 font-bold uppercase shrink-0">You</span>
                     <p className="text-[12px] text-slate-300 italic px-3 py-2 bg-white/5 rounded border border-white/5">"Are there any dangerous translation issues in the first claim?"</p>
                  </div>
                  <div className="flex flex-col gap-1">
                     <span className="text-[9px] text-indigo-400 font-bold uppercase shrink-0">Assistant (Kimi)</span>
                     <div className="px-3 py-2 bg-indigo-900/20 border border-indigo-600/30 rounded text-[12px] text-slate-200 leading-relaxed shadow-inner">
                        Yes. In <span className="text-indigo-300 font-bold">Claim 1.1</span>, the term "包括" is translated as <span className="text-rose-400 font-black">"consisting of"</span>. 
                        <br/><br/>
                        In EPC practice, this narrows the scope significantly compared to "comprising". I recommend updating this.
                     </div>
                  </div>
               </div>
            </div>
         </div>
       )}
    </div>
  );
}

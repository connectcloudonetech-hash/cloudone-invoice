
import React, { useState } from 'react';
import { 
  Cloud, 
  Download, 
  Database, 
  ShieldAlert, 
  FileSpreadsheet, 
  Archive, 
  AlertTriangle, 
  CheckCircle2,
  RefreshCcw,
  FileText,
  Receipt,
  CloudLightning,
  ExternalLink
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

const Backup: React.FC = () => {
  const { customers, quotations, invoices, isLoading: isDataLoading } = useData();
  const { user } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);

  const isAdmin = user?.role === UserRole.ADMIN;

  const downloadCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => headers.map(header => JSON.stringify(row[header], (key, value) => value === null ? '' : value)).join(','))
    ];
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadSystemJSON = () => {
    const state = { customers, quotations, invoices };
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `CloudOne_Enterprise_Archive_${new Date().toISOString().split('T')[0]}.json`);
    a.click();
  };

  const handleSync = () => {
    setIsSyncing(true);
    // In cloud mode, this just triggers a refresh from the server
    setTimeout(() => {
      setIsSyncing(false);
      window.location.reload();
    }, 1500);
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-8">
          <ShieldAlert size={48} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight uppercase">Access Restricted</h2>
        <p className="text-slate-400 font-medium max-w-md leading-relaxed">System security parameters restrict cloud infrastructure management to Master Administrators only.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Enterprise Cloud Control</h1>
          <p className="text-slate-400 font-medium mt-1">Global database state and archival utilities.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-brand-secondary bg-brand-secondary/5 px-4 py-2 rounded-full border border-brand-secondary/10">
             <CloudLightning size={16} className="animate-pulse" />
             <span className="text-[10px] font-black tracking-widest uppercase">Cloud Node Synchronized</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center text-center group hover:border-brand-primary/20 transition-all">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Database size={32} />
          </div>
          <h3 className="text-sm font-black text-slate-900 mb-1 uppercase tracking-tight">Client Data</h3>
          <p className="text-[10px] font-bold text-slate-400 mb-8 uppercase tracking-widest">{customers.length} Records</p>
          <button 
            onClick={() => downloadCSV(customers, 'CloudOne_Customers')}
            className="w-full flex items-center justify-center gap-3 py-4 bg-brand-surface hover:bg-slate-100 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border border-slate-100 shadow-sm"
          >
            <FileSpreadsheet size={18} className="text-emerald-500" />
            CSV Export
          </button>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center text-center group hover:border-brand-primary/20 transition-all">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <FileText size={32} />
          </div>
          <h3 className="text-sm font-black text-slate-900 mb-1 uppercase tracking-tight">Proposals</h3>
          <p className="text-[10px] font-bold text-slate-400 mb-8 uppercase tracking-widest">{quotations.length} Records</p>
          <button 
            onClick={() => downloadCSV(quotations, 'CloudOne_Quotations')}
            className="w-full flex items-center justify-center gap-3 py-4 bg-brand-surface hover:bg-slate-100 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border border-slate-100 shadow-sm"
          >
            <FileSpreadsheet size={18} className="text-emerald-500" />
            CSV Export
          </button>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center text-center group hover:border-brand-primary/20 transition-all">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Receipt size={32} />
          </div>
          <h3 className="text-sm font-black text-slate-900 mb-1 uppercase tracking-tight">Invoices</h3>
          <p className="text-[10px] font-bold text-slate-400 mb-8 uppercase tracking-widest">{invoices.length} Records</p>
          <button 
            onClick={() => downloadCSV(invoices, 'CloudOne_Invoices')}
            className="w-full flex items-center justify-center gap-3 py-4 bg-brand-surface hover:bg-slate-100 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border border-slate-100 shadow-sm"
          >
            <FileSpreadsheet size={18} className="text-emerald-500" />
            CSV Export
          </button>
        </div>

        <div className="bg-brand-primary p-8 rounded-[2.5rem] text-white flex flex-col items-center text-center shadow-2xl shadow-brand-primary/30 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12" />
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white/20 transition-all">
            <Archive size={32} />
          </div>
          <h3 className="text-sm font-black mb-1 uppercase tracking-tight">Master JSON</h3>
          <p className="text-[10px] font-bold text-white/50 mb-8 uppercase tracking-widest">Global Backup</p>
          <button 
            onClick={downloadSystemJSON}
            className="w-full flex items-center justify-center gap-3 py-4 bg-white text-brand-primary rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl hover:scale-[1.02] active:scale-95"
          >
            <Download size={18} />
            Download .JSON
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-gradient-to-br from-brand-primary to-brand-secondary p-12 rounded-[3.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl shadow-brand-primary/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -ml-32 -mt-32 blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full -mr-48 -mb-48 blur-3xl" />
          </div>
          
          <div className="space-y-4 relative z-10">
            <div className="flex items-center gap-4">
              <Cloud size={32} className="text-white" />
              <h3 className="text-2xl font-black tracking-tight uppercase">Manual Cloud Refresh</h3>
            </div>
            <p className="text-white/80 font-medium max-w-lg leading-relaxed">
              Force a global re-synchronization with the Supabase PostgreSQL cluster. Use this if you notice latency or inconsistencies across team terminals.
            </p>
          </div>
          
          <button 
            onClick={handleSync}
            disabled={isSyncing || isDataLoading}
            className="relative z-10 whitespace-nowrap px-10 py-5 bg-white text-brand-primary rounded-[1.5rem] font-black uppercase text-[11px] tracking-[0.3em] hover:bg-slate-50 transition-all shadow-2xl active:scale-95 disabled:opacity-50 flex items-center gap-3"
          >
            {isSyncing ? <RefreshCcw className="animate-spin" size={18} /> : <RefreshCcw size={18} />}
            {isSyncing ? "Refreshing..." : "Trigger Refresh"}
          </button>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-10 rounded-[3.5rem] flex flex-col justify-between group transition-all">
          <div className="space-y-6">
            <div className="flex items-center gap-4 text-slate-900">
              <AlertTriangle size={24} className="text-amber-500" />
              <h4 className="font-black text-xs tracking-[0.3em] uppercase">Cloud Integrity</h4>
            </div>
            <p className="text-slate-500 text-xs font-bold leading-relaxed">
              Your database is hosted on the enterprise cloud. Local storage is only used for caching and performance optimization. 
            </p>
          </div>

          <div className="mt-8">
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 flex items-center gap-3">
              <CheckCircle2 size={16} />
              <span className="text-[10px] font-black tracking-widest uppercase">Verified Connection</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 flex flex-col md:flex-row items-center gap-12">
        <div className="w-20 h-20 bg-brand-surface rounded-[2rem] flex items-center justify-center text-brand-primary flex-shrink-0">
          <Cloud size={40} />
        </div>
        <div className="flex-1 space-y-2">
          <h5 className="text-sm font-black text-slate-900 uppercase tracking-tight">Supabase Endpoint Status</h5>
          <p className="text-xs font-medium text-slate-400 leading-relaxed max-w-2xl">
            Targeting: <span className="text-brand-primary font-bold">cbjgutquxipwykfiteck.supabase.co</span>. 
            The system is operating in pure Cloud-Native mode. Local caching is enabled for offline resilience.
          </p>
        </div>
        <div className="flex flex-col items-center gap-2">
           <a 
            href="https://cbjgutquxipwykfiteck.supabase.co" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white rounded-full shadow-lg hover:scale-105 transition-all"
           >
             <ExternalLink size={16} />
             <span className="text-[10px] font-black tracking-widest uppercase">Visit Console</span>
           </a>
        </div>
      </div>
    </div>
  );
};

export default Backup;


import React, { useState } from 'react';
import { 
  Users, 
  FileText, 
  Receipt, 
  DollarSign, 
  Clock, 
  TrendingUp,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Globe,
  Plus,
  Download,
  Loader2
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/storage';
import { DocStatus, Invoice } from '../types';
import { useNavigate } from 'react-router-dom';
import { generateDocumentPDF } from '../utils/pdfGenerator';

const BentoCard = ({ title, value, icon: Icon, color, trend, fullWidth, large }: any) => (
  <div className={`
    glass-card p-8 rounded-[3rem] border border-white/50 flex flex-col justify-between transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 group relative overflow-hidden
    ${fullWidth ? 'md:col-span-2' : ''}
    ${large ? 'md:row-span-2 aspect-square md:aspect-auto' : ''}
  `}>
    <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-10 rounded-full -mr-16 -mt-16 transition-all group-hover:opacity-20 ${color}`} />
    
    <div className="flex justify-between items-start relative z-10">
      <div className={`p-4 rounded-[1.5rem] bg-white shadow-sm border border-slate-100 ${color.replace('bg-', 'text-')} group-hover:scale-110 transition-transform duration-500`}>
        <Icon size={28} />
      </div>
      {trend && (
        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black tracking-widest uppercase">
          <TrendingUp size={12} /> {trend}
        </span>
      )}
    </div>

    <div className="mt-8 relative z-10">
      <p className="text-[11px] font-black text-slate-400 tracking-[0.2em] uppercase mb-2">{title}</p>
      <h3 className={`font-black text-slate-900 tracking-tighter ${large ? 'text-5xl' : 'text-3xl'}`}>
        {value}
      </h3>
      <div className="mt-4 flex items-center justify-between text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-[10px] font-black uppercase tracking-widest">System Ledger Status</span>
        <ArrowUpRight size={18} />
      </div>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const { stats, invoices, customers, currency, convertValue } = useData();
  const { user } = useAuth();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleDownloadTrace = async (inv: Invoice) => {
    setDownloadingId(inv.id);
    try {
      // Functional Fix: Find the customer entity associated with this invoice to generate the trace
      const customer = customers.find(c => c.id === inv.customerId);
      if (customer) {
        await generateDocumentPDF('INVOICE', inv, customer);
      } else {
        console.warn('Trace generation interrupted: Associated customer entity not found in local cache.');
        alert('Trace Error: Customer identity mismatch. Please sync the Hub and retry.');
      }
    } catch (error) {
      console.error('Terminal Trace Export Failed:', error);
      alert('System Error: PDF Generation failed. Check console for logs.');
    } finally {
      setDownloadingId(null);
    }
  };

  const revenueData = [
    { month: 'Jan', revenue: convertValue(4500) },
    { month: 'Feb', revenue: convertValue(5200) },
    { month: 'Mar', revenue: convertValue(4800) },
    { month: 'Apr', revenue: convertValue(6100) },
    { month: 'May', revenue: convertValue(5500) },
    { month: 'Jun', revenue: convertValue(stats.totalRevenue || 4000) },
  ];

  const recentInvoices = [...invoices]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Welcome Hero */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-brand-gradient p-10 md:p-14 rounded-[4rem] text-white shadow-3xl shadow-brand-primary/20 relative overflow-hidden group">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[100%] bg-white/10 rounded-full blur-[120px] animate-pulse-soft" />
        <div className="absolute bottom-[-30%] left-[-10%] w-[40%] h-[80%] bg-brand-secondary/20 rounded-full blur-[100px] animate-float" />
        
        <div className="relative z-10 space-y-4 text-center md:text-left">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-xl rounded-full border border-white/20">
            <Zap size={16} className="text-brand-secondary fill-brand-secondary" />
            <span className="text-[10px] font-black tracking-[0.2em] uppercase">Cloud System Online</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">
            Welcome, <br />
            <span className="text-brand-secondary">{user?.name.split(' ')[0]}</span>
          </h1>
          <p className="text-white/70 font-medium max-w-sm text-sm md:text-base">Your enterprise cloud infrastructure is operating at peak efficiency.</p>
        </div>

        <div className="relative z-10 flex gap-4">
          <button 
            onClick={() => navigate('/quotations')}
            className="px-8 py-5 bg-white text-brand-primary rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl active:scale-95 transition-all flex items-center gap-3"
          >
            <Plus size={18} /> New Proposal
          </button>
          <button className="p-5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] hover:bg-white/20 transition-all active:scale-95">
             <Globe size={24} />
          </button>
        </div>
      </div>

      {/* Bento Grid Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <BentoCard 
          title="Revenue Terminal" 
          value={formatCurrency(convertValue(stats.totalRevenue), currency)} 
          icon={DollarSign} 
          color="bg-emerald-500"
          trend="+18.4%"
          large
        />
        <BentoCard 
          title="Stakeholders" 
          value={stats.totalCustomers} 
          icon={Users} 
          color="bg-brand-secondary"
          trend="+2 New"
        />
        <BentoCard 
          title="Accounts Receivable" 
          value={formatCurrency(convertValue(stats.pendingPayments), currency)} 
          icon={Clock} 
          color="bg-rose-500"
        />
        <BentoCard 
          title="Active Proposals" 
          value={stats.totalQuotations} 
          icon={FileText} 
          color="bg-indigo-500"
          fullWidth
        />
      </div>

      {/* Main Stats Area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <div className="xl:col-span-2 glass-card p-10 rounded-[4rem] border border-white/50">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Financial Velocity</h3>
              <p className="text-slate-400 text-[11px] font-black tracking-[0.3em] uppercase mt-1">Global Transaction Metrics</p>
            </div>
            <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
               <button className="px-5 py-2 rounded-xl bg-white shadow-sm text-[10px] font-black text-brand-primary tracking-widest uppercase">7 Days</button>
               <button className="px-5 py-2 rounded-xl text-[10px] font-black text-slate-400 tracking-widest uppercase hover:text-brand-primary transition-colors">30 Days</button>
            </div>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorBrand" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#25c1eb" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#25c1eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 11, fill: '#94a3b8', fontBold: 800, letterSpacing: '0.1em'}} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 11, fill: '#94a3b8', fontBold: 800}} 
                />
                <Tooltip 
                  cursor={{ stroke: '#25c1eb', strokeWidth: 2, strokeDasharray: '4 4' }}
                  contentStyle={{ 
                    borderRadius: '2rem', 
                    border: 'none', 
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', 
                    padding: '20px',
                    backgroundColor: 'white'
                  }}
                  itemStyle={{ fontBold: '900', color: '#2b5d8a', fontSize: '14px' }}
                  labelStyle={{ fontBold: '900', color: '#94a3b8', marginBottom: '8px', fontSize: '10px', textTransform: 'uppercase' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#25c1eb" 
                  strokeWidth={6}
                  fillOpacity={1} 
                  fill="url(#colorBrand)" 
                  animationDuration={2500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Ledger */}
        <div className="glass-card p-10 rounded-[4rem] border border-white/50 flex flex-col">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Ledger</h3>
              <p className="text-slate-400 text-[11px] font-black tracking-[0.3em] uppercase mt-1">Live Feed</p>
            </div>
            <button className="p-4 bg-slate-50 rounded-2xl text-brand-primary hover:bg-brand-primary hover:text-white transition-all">
              <ArrowUpRight size={20} />
            </button>
          </div>
          <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-2">
            {recentInvoices.length > 0 ? recentInvoices.map((inv) => (
              <div key={inv.id} className="group p-5 rounded-[2rem] bg-slate-50/50 border border-slate-100 hover:border-brand-primary/20 hover:bg-white transition-all duration-500">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 ${
                      inv.status === DocStatus.PAID ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                    }`}>
                      <Receipt size={22} />
                    </div>
                    <div>
                      <p className="font-black text-slate-900 text-sm tracking-tight">{inv.invoiceNumber}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(inv.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <p className="font-black text-brand-primary text-sm">{formatCurrency(convertValue(inv.total), currency)}</p>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-slate-100/50">
                   <span className={`text-[9px] font-black tracking-[0.2em] px-3 py-1.5 rounded-full uppercase ${
                      inv.status === DocStatus.PAID ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {inv.status}
                    </span>
                    <button 
                      disabled={downloadingId === inv.id}
                      onClick={() => handleDownloadTrace(inv)}
                      className="flex items-center gap-1.5 text-[9px] font-black text-brand-secondary tracking-widest uppercase group-hover:translate-x-1 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {downloadingId === inv.id ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                      Download Trace
                    </button>
                </div>
              </div>
            )) : (
              <div className="text-center py-20">
                <ShieldCheck size={48} className="mx-auto text-slate-100 mb-4" />
                <p className="text-[11px] font-black text-slate-300 tracking-widest uppercase">System Cache Empty</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

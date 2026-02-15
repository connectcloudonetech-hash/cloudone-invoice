
import React from 'react';
import { 
  Users, 
  FileText, 
  Receipt, 
  DollarSign, 
  Clock, 
  TrendingUp 
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
import { formatCurrency } from '../utils/storage';
import { DocStatus } from '../types';

const StatCard = ({ title, value, icon: Icon, colorClass, trend }: any) => (
  <div className="bg-white p-7 rounded-[2rem] shadow-sm border border-slate-100 flex items-start justify-between transition-hover hover:shadow-md hover:border-brand-secondary/20 group">
    <div>
      <p className="text-xs font-black text-slate-400 tracking-widest mb-2">{title}</p>
      <h3 className="text-3xl font-black text-slate-900">{value}</h3>
      {trend && (
        <p className="mt-3 flex items-center text-xs font-bold text-emerald-500">
          <TrendingUp size={16} className="mr-1.5" />
          {trend}
        </p>
      )}
    </div>
    <div className={`p-4 rounded-2xl ${colorClass} group-hover:scale-110 transition-transform duration-300`}>
      <Icon size={28} />
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const { stats, invoices, currency, convertValue } = useData();

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
    .slice(0, 5);

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Enterprise Analytics</h1>
          <p className="text-slate-400 font-medium mt-1">Real-time performance metrics for Cloud One.</p>
        </div>
        <div className="flex gap-2">
            <div className="h-2 w-2 rounded-full bg-brand-secondary animate-pulse" />
            <span className="text-[10px] font-black tracking-widest text-brand-secondary">Live Stream Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <StatCard 
          title="Clients" 
          value={stats.totalCustomers} 
          icon={Users} 
          colorClass="bg-brand-secondary/10 text-brand-secondary"
          trend="+12% Gain"
        />
        <StatCard 
          title="Quotes" 
          value={stats.totalQuotations} 
          icon={FileText} 
          colorClass="bg-indigo-50 text-indigo-600"
        />
        <StatCard 
          title="Invoices" 
          value={stats.totalInvoices} 
          icon={Receipt} 
          colorClass="bg-brand-primary/10 text-brand-primary"
        />
        <StatCard 
          title="Revenue" 
          value={formatCurrency(convertValue(stats.totalRevenue), currency)} 
          icon={DollarSign} 
          colorClass="bg-emerald-50 text-emerald-600"
          trend="Target Achieved"
        />
        <StatCard 
          title="Pending" 
          value={formatCurrency(convertValue(stats.pendingPayments), currency)} 
          icon={Clock} 
          colorClass="bg-rose-50 text-rose-600"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Revenue Stream</h3>
              <p className="text-slate-400 text-xs font-bold tracking-widest mt-1">{currency} • Monthly Aggregate</p>
            </div>
            <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-full bg-brand-secondary" />
               <span className="text-xs font-bold text-slate-500">Current Year</span>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorBrand" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#25c1eb" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#25c1eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 800}} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 800}} 
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value, currency), 'REVENUE']}
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', padding: '15px' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#25c1eb" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorBrand)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Ledger Feed</h3>
              <p className="text-slate-400 text-xs font-bold tracking-widest mt-1">Recent Transactions</p>
            </div>
            <button className="text-brand-secondary text-xs font-black tracking-widest hover:underline px-4 py-2 bg-brand-secondary/5 rounded-full">Explorer</button>
          </div>
          <div className="space-y-3 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
            {recentInvoices.length > 0 ? recentInvoices.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between p-4 rounded-2xl bg-brand-surface/50 border border-slate-50 hover:border-brand-secondary/30 transition-all duration-300 group">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                    inv.status === DocStatus.PAID ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                  }`}>
                    <Receipt size={22} />
                  </div>
                  <div>
                    <p className="font-black text-slate-900 text-sm">{inv.invoiceNumber}</p>
                    <p className="text-[10px] font-black text-slate-400 tracking-widest">{new Date(inv.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-brand-primary text-sm">{formatCurrency(convertValue(inv.total), currency)}</p>
                  <p className={`text-[9px] font-black tracking-widest px-2.5 py-1 rounded-full mt-1 inline-block ${
                    inv.status === DocStatus.PAID ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                  }`}>
                    {inv.status}
                  </p>
                </div>
              </div>
            )) : (
              <div className="text-center py-20 text-slate-300">
                <FileText size={48} className="mx-auto mb-4 opacity-10" />
                <p className="text-xs font-black tracking-widest">No activity logged</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

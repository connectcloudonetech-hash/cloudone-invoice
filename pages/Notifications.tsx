
import React from 'react';
import { 
  Bell, 
  Receipt, 
  ShieldCheck, 
  Zap, 
  Search,
  CheckCircle2,
  AlertCircle,
  Clock
} from 'lucide-react';

const NotificationItem = ({ type, title, message, time, unread }: any) => {
  const configs: any = {
    billing: { icon: Receipt, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    security: { icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    system: { icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
    error: { icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
  };
  const config = configs[type] || configs.system;
  const Icon = config.icon;

  return (
    <div className={`p-8 rounded-[3rem] bg-white border border-slate-100 transition-all hover:shadow-xl group relative ${unread ? 'ring-2 ring-brand-primary/10 bg-brand-primary/[0.02]' : ''}`}>
      {unread && <div className="absolute top-8 right-8 w-2.5 h-2.5 bg-brand-primary rounded-full ring-4 ring-brand-primary/5" />}
      
      <div className="flex gap-6">
        <div className={`p-5 rounded-2xl ${config.bg} ${config.color} group-hover:scale-110 transition-transform flex-shrink-0`}>
          <Icon size={24} strokeWidth={2.5} />
        </div>
        <div className="space-y-1 flex-1">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black text-slate-900 tracking-tight">{title}</h4>
            <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 tracking-widest uppercase">
              <Clock size={12} />
              {time}
            </div>
          </div>
          <p className="text-xs font-bold text-slate-400 leading-relaxed">{message}</p>
        </div>
      </div>
    </div>
  );
};

const Notifications: React.FC = () => {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="flex items-center justify-between px-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Terminal Alerts</h1>
          <p className="text-slate-400 text-[11px] font-black tracking-[0.3em] uppercase mt-1">Global System Logs</p>
        </div>
        <button className="px-6 py-3 bg-brand-primary/5 text-brand-primary rounded-2xl font-black text-[10px] tracking-widest uppercase hover:bg-brand-primary hover:text-white transition-all">
          Clear All
        </button>
      </div>

      <div className="space-y-6">
        <NotificationItem 
          type="billing" 
          title="Revenue Event Detected" 
          message="Invoice #INV-1024 for stakeholder 'Hashim' has been successfully processed through the global node."
          time="2M AGO"
          unread
        />
        <NotificationItem 
          type="security" 
          title="Terminal Verified" 
          message="New secure session initiated from verified stakeholder device (iPhone 15 Pro)."
          time="45M AGO"
          unread
        />
        <NotificationItem 
          type="system" 
          title="Core Update Applied" 
          message="System firmware updated to version 2.5. Bento Dashboard architecture is now active across all nodes."
          time="4H AGO"
        />
        <NotificationItem 
          type="error" 
          title="Gateway Latency" 
          message="Minor latency detected in the INR-AED exchange gateway. Retrying synchronization..."
          time="1D AGO"
        />
      </div>

      <div className="text-center py-10">
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-slate-100 rounded-full text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">
          <CheckCircle2 size={16} /> End of active system logs
        </div>
      </div>
    </div>
  );
};

export default Notifications;

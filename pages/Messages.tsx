
import React, { useState } from 'react';
import { 
  Send, 
  Plus, 
  MoreHorizontal, 
  CheckCheck,
  Search,
  Paperclip,
  Smile,
  Circle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MessageBubble = ({ sender, text, time, self }: any) => (
  <div className={`flex flex-col ${self ? 'items-end' : 'items-start'} space-y-2 group`}>
    {!self && <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">{sender}</span>}
    <div className={`
      max-w-[85%] p-6 rounded-[2.5rem] text-sm font-bold leading-relaxed shadow-sm transition-all group-hover:shadow-md
      ${self ? 'bg-brand-primary text-white rounded-tr-none' : 'bg-white text-slate-900 border border-slate-100 rounded-tl-none'}
    `}>
      {text}
    </div>
    <div className="flex items-center gap-1.5 px-4">
      <span className="text-[9px] font-black text-slate-300 uppercase">{time}</span>
      {self && <CheckCheck size={12} className="text-brand-secondary" />}
    </div>
  </div>
);

const Messages: React.FC = () => {
  const { user } = useAuth();
  const [msg, setMsg] = useState('');

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col animate-in fade-in duration-700">
      <div className="flex-1 flex flex-col space-y-10 overflow-y-auto custom-scrollbar px-4 pb-10">
        <div className="text-center py-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-primary/5 text-brand-primary rounded-full text-[10px] font-black tracking-widest uppercase">
             <Circle size={10} className="fill-brand-primary animate-pulse" /> Encrypted Terminal
          </div>
          <p className="text-xs font-bold text-slate-400">Secure stakeholder communication channel established.</p>
        </div>

        <MessageBubble 
          sender="Operations Lead" 
          text="Has the VAT reconciliation for the Q1 infrastructure project been finalized?" 
          time="09:12 AM" 
        />
        <MessageBubble 
          sender="You" 
          text="Affirmative. The ledger has been synchronized and the invoice is dispatched to the stakeholder's terminal." 
          time="09:14 AM" 
          self 
        />
        <MessageBubble 
          sender="Finance Node" 
          text="System detected a 1.2% variance in the INR conversion rate. Adjusting fiscal logic automatically." 
          time="09:20 AM" 
        />
        <MessageBubble 
          sender="Operations Lead" 
          text="Acknowledged. Proceed with the next asset enrollment." 
          time="09:22 AM" 
        />
      </div>

      {/* Input Bar */}
      <div className="p-8 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-[#f8fbfe] to-transparent pointer-events-none -top-20" />
        <div className="bg-white p-4 rounded-[3rem] border border-slate-100 shadow-2xl shadow-brand-primary/5 flex items-center gap-4 relative z-10">
          <button className="p-4 bg-slate-50 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/5 rounded-[1.75rem] transition-all active:scale-90">
            <Plus size={24} />
          </button>
          <input 
            type="text" 
            placeholder="Type encrypted message..."
            className="flex-1 bg-transparent border-none font-bold text-sm outline-none placeholder:text-slate-300"
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
          />
          <div className="flex gap-2">
            <button className="hidden sm:flex p-4 text-slate-300 hover:text-slate-500 transition-colors">
              <Smile size={24} />
            </button>
            <button className="p-5 bg-brand-primary text-white rounded-[1.75rem] shadow-xl shadow-brand-primary/30 active:scale-90 transition-all">
              <Send size={20} fill="currentColor" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;

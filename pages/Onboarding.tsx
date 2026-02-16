
import React, { useState } from 'react';
import { 
  Zap, 
  ShieldCheck, 
  Rocket, 
  ArrowRight, 
  Check, 
  ChevronRight,
  Globe,
  Database
} from 'lucide-react';
import { APP_LOGO } from '../constants';

const Onboarding: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Cloud Infrastructure",
      description: "Welcome to the next generation of business management. Your enterprise is now powered by global cloud nodes.",
      icon: <Globe size={64} className="text-brand-secondary animate-float" />,
      color: "bg-brand-primary"
    },
    {
      title: "Real-time Analytics",
      description: "Monitor every transaction, proposal, and stakeholder interaction with high-fidelity visual intelligence.",
      icon: <Zap size={64} className="text-amber-400 animate-pulse-soft" />,
      color: "bg-brand-secondary"
    },
    {
      title: "Secure Backups",
      description: "Automated database synchronization ensuring your enterprise state is persistent and accessible worldwide.",
      icon: <Database size={64} className="text-emerald-400" />,
      color: "bg-indigo-600"
    }
  ];

  const nextStep = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const current = steps[step];

  return (
    <div className="fixed inset-0 z-[200] bg-white flex flex-col overflow-hidden">
      {/* Background Accent */}
      <div className={`absolute top-0 left-0 w-full h-[60%] transition-colors duration-700 ${current.color} opacity-10 blur-[120px]`} />
      
      <div className="flex-1 flex flex-col items-center justify-center px-10 relative z-10 text-center space-y-12">
        <div className="mb-8">
           <img src={APP_LOGO} alt="Cloud One" className="h-16 mx-auto mb-4" />
           <p className="text-[10px] font-black text-slate-400 tracking-[0.4em] uppercase">Stakeholder Induction</p>
        </div>

        <div className="p-12 rounded-[4rem] bg-white shadow-2xl shadow-brand-primary/10 border border-slate-50 transition-all duration-700 transform scale-100 hover:scale-105">
           {current.icon}
        </div>

        <div className="space-y-4 max-w-sm">
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-none animate-in slide-in-from-bottom-4 duration-700">
            {current.title}
          </h2>
          <p className="text-slate-500 font-medium leading-relaxed animate-in slide-in-from-bottom-8 duration-700">
            {current.description}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-2">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-500 ${i === step ? 'w-12 bg-brand-primary' : 'w-3 bg-slate-200'}`} 
            />
          ))}
        </div>
      </div>

      <div className="p-10 relative z-10 flex flex-col gap-4">
        <button 
          onClick={nextStep}
          className="w-full py-6 bg-brand-primary text-white rounded-[2.5rem] font-black uppercase text-xs tracking-[0.3em] shadow-2xl shadow-brand-primary/30 flex items-center justify-center gap-3 active:scale-95 transition-all"
        >
          {step === steps.length - 1 ? 'Authorize Terminal' : 'Continue Integration'}
          <ChevronRight size={20} />
        </button>
        
        {step < steps.length - 1 && (
          <button 
            onClick={onComplete}
            className="w-full py-4 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-slate-600 transition-colors"
          >
            Skip Induction
          </button>
        )}
      </div>
    </div>
  );
};

export default Onboarding;

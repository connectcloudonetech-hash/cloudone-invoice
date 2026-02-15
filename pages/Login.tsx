
import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Loader2, UserPlus, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { APP_LOGO } from '../constants';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isRegistering) {
        const success = await signUp(email, password, name);
        if (success) {
          setIsRegistering(false);
          setError('Account created! Please check your email for a confirmation link (if enabled) then log in.');
        }
      } else {
        const success = await login(email, password);
        if (success) {
          navigate('/');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-surface flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-secondary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-primary/5 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <img 
            src={APP_LOGO} 
            alt="Cloud One Technologies" 
            className="h-24 mx-auto mb-4 drop-shadow-xl"
          />
          <p className="text-slate-400 font-bold tracking-[0.3em] uppercase text-[10px]">Cloud One Enterprise OS</p>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-brand-primary/5 border border-white">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-brand-primary uppercase tracking-tight">
              {isRegistering ? 'Agent Onboarding' : 'Terminal Access'}
            </h2>
            <p className="text-slate-400 text-sm mt-1 font-medium">
              {isRegistering ? 'Create a new stakeholder profile.' : 'Connect to the cloud infrastructure.'}
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className={`p-5 rounded-2xl border animate-in fade-in slide-in-from-top-2 duration-300 ${
                error.includes('Account created') 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                : 'bg-rose-50 text-rose-700 border-rose-100'
              }`}>
                <div className="flex gap-3">
                  <AlertCircle size={20} className="shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-[11px] font-black uppercase tracking-widest">System Notification</p>
                    <p className="text-xs font-bold leading-relaxed">{error}</p>
                    {error.includes('Invalid') && (
                      <p className="text-[10px] opacity-70 italic mt-2">
                        Note: If added via Supabase Dashboard, disable "Confirm Email" in Auth Settings.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {isRegistering && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 tracking-widest ml-1 uppercase">Stakeholder Name</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-primary transition-colors">
                    <UserPlus size={20} />
                  </div>
                  <input
                    required
                    type="text"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-transparent focus:border-brand-primary/20 rounded-2xl focus:ring-4 focus:ring-brand-primary/5 outline-none transition-all placeholder:text-slate-300 font-bold text-sm"
                    placeholder="Full Legal Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 tracking-widest ml-1 uppercase">Corporate Email Terminal</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-primary transition-colors">
                  <Mail size={20} />
                </div>
                <input
                  required
                  type="email"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-transparent focus:border-brand-primary/20 rounded-2xl focus:ring-4 focus:ring-brand-primary/5 outline-none transition-all placeholder:text-slate-300 font-bold text-sm shadow-inner"
                  placeholder="e.g. name@cloudone.tech"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 tracking-widest ml-1 uppercase">Security Token</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-primary transition-colors">
                  <Lock size={20} />
                </div>
                <input
                  required
                  type="password"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-transparent focus:border-brand-primary/20 rounded-2xl focus:ring-4 focus:ring-brand-primary/5 outline-none transition-all placeholder:text-slate-300 font-bold text-sm shadow-inner"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              disabled={isLoading}
              type="submit"
              className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-3 shadow-2xl shadow-brand-primary/20 transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-70 uppercase text-xs tracking-[0.2em]"
            >
              {isLoading ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <>
                  <span>{isRegistering ? 'Authorize Agent' : 'Connect Terminal'}</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button 
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
              }}
              className="text-[10px] font-black text-brand-secondary uppercase tracking-[0.2em] hover:text-brand-primary transition-colors flex items-center justify-center gap-2 mx-auto"
            >
              {isRegistering ? <LogIn size={16} /> : <UserPlus size={16} />}
              {isRegistering ? 'Switch to Terminal Login' : 'Register New Stakeholder'}
            </button>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-[10px] text-slate-300 font-black tracking-[0.4em]">CLOUD ONE INFRASTRUCTURE &copy; 2026</p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Global Node Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

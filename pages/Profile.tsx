
import React, { useState } from 'react';
import { 
  User as UserIcon, 
  Shield, 
  Settings, 
  Bell, 
  Moon, 
  Globe, 
  LogOut,
  Camera,
  ChevronRight,
  Fingerprint,
  Mail,
  Smartphone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProfileCard = ({ icon: Icon, label, value, color, onClick }: any) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center justify-between p-6 bg-white border border-slate-100 rounded-[2.5rem] hover:shadow-xl hover:border-brand-primary/20 transition-all active:scale-[0.98] group"
  >
    <div className="flex items-center gap-5">
      <div className={`p-4 rounded-2xl ${color} group-hover:scale-110 transition-transform`}>
        <Icon size={20} strokeWidth={2.5} />
      </div>
      <div className="text-left">
        <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-1">{label}</p>
        <p className="text-sm font-black text-slate-900">{value}</p>
      </div>
    </div>
    <ChevronRight size={18} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
  </button>
);

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);
  const [biometrics, setBiometrics] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="flex flex-col items-center text-center space-y-6 pt-10">
        <div className="relative">
          <div className="w-40 h-40 bg-brand-gradient rounded-6xl p-1 shadow-2xl shadow-brand-primary/30 flex items-center justify-center relative overflow-hidden group cursor-pointer">
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
              <Camera size={32} className="text-white" />
            </div>
            <div className="w-full h-full bg-white rounded-[3.25rem] flex items-center justify-center font-black text-5xl text-brand-primary">
              {user?.name.charAt(0)}
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 p-3 bg-emerald-500 text-white rounded-2xl border-4 border-white shadow-xl animate-float">
            <Shield size={20} />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">{user?.name}</h1>
          <p className="text-[11px] font-black text-brand-secondary tracking-[0.3em] uppercase bg-brand-secondary/5 px-6 py-2 rounded-full border border-brand-secondary/10">
            Enterprise {user?.role}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h2 className="text-xs font-black text-slate-400 tracking-[0.3em] uppercase ml-6">Global Identity</h2>
          <ProfileCard icon={Mail} label="Primary Mail" value={user?.email} color="bg-indigo-50 text-indigo-600" />
          <ProfileCard icon={Smartphone} label="Stakeholder Device" value="Verified iPhone 15 Pro" color="bg-emerald-50 text-emerald-600" />
          <ProfileCard icon={Globe} label="Region Terminal" value="Dubai Node (AE)" color="bg-blue-50 text-blue-600" />
        </div>

        <div className="space-y-6">
          <h2 className="text-xs font-black text-slate-400 tracking-[0.3em] uppercase ml-6">Infrastructure Security</h2>
          
          <div className="p-8 bg-white border border-slate-100 rounded-[3rem] space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-xl">
                  <Bell size={20} strokeWidth={2.5} />
                </div>
                <span className="text-sm font-black text-slate-900">Push Terminals</span>
              </div>
              <button 
                onClick={() => setNotifications(!notifications)}
                className={`w-14 h-8 rounded-full p-1 transition-all duration-500 ${notifications ? 'bg-brand-primary' : 'bg-slate-200'}`}
              >
                <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-500 ${notifications ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Fingerprint size={20} strokeWidth={2.5} />
                </div>
                <span className="text-sm font-black text-slate-900">Biometric Key</span>
              </div>
              <button 
                onClick={() => setBiometrics(!biometrics)}
                className={`w-14 h-8 rounded-full p-1 transition-all duration-500 ${biometrics ? 'bg-emerald-500' : 'bg-slate-200'}`}
              >
                <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-500 ${biometrics ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="w-full py-6 bg-rose-50 text-rose-500 rounded-[2.5rem] font-black uppercase text-xs tracking-[0.3em] border border-rose-100 shadow-xl shadow-rose-500/5 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <LogOut size={20} /> Terminate Stakeholder Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;

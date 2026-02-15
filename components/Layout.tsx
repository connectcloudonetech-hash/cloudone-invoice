
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Receipt, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Briefcase,
  Coins,
  ShieldCheck
} from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { UserRole, Currency } from '../types';
import { APP_LOGO } from '../constants';

const SidebarItem = ({ icon: Icon, label, path, active, onClick }: any) => (
  <Link
    to={path}
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      active 
        ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' 
        : 'text-slate-500 hover:bg-brand-secondary/10 hover:text-brand-primary'
    }`}
  >
    <Icon size={20} strokeWidth={active ? 2.5 : 2} />
    <span className={`font-medium ${active ? 'font-bold' : ''}`}>{label}</span>
  </Link>
);

const MobileNavItem = ({ icon: Icon, label, path, active }: any) => (
  <Link
    to={path}
    className={`flex flex-col items-center justify-center gap-1 flex-1 transition-all duration-300 ${
      active ? 'text-brand-primary scale-110' : 'text-slate-400'
    }`}
  >
    <div className={`p-1.5 rounded-lg transition-colors ${active ? 'bg-brand-primary/10' : ''}`}>
      <Icon size={22} strokeWidth={active ? 2.5 : 2} />
    </div>
    <span className={`text-[9px] font-black tracking-tighter ${active ? 'text-brand-primary' : 'text-slate-400'}`}>
      {label}
    </span>
  </Link>
);

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { currency, setCurrency } = useData();
  const location = useLocation();
  const navigate = useNavigate();

  const isAdmin = user?.role === UserRole.ADMIN;

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Users, label: 'Customers', path: '/customers' },
    { icon: Briefcase, label: 'Services', path: '/services' },
    { icon: FileText, label: 'Quotations', path: '/quotations' },
    { icon: Receipt, label: 'Invoices', path: '/invoices' },
  ];

  if (isAdmin) {
    menuItems.push({ icon: ShieldCheck, label: 'Team', path: '/users' });
    menuItems.push({ icon: Settings, label: 'Cloud Backup', path: '/backup' });
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-brand-surface flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-brand-primary/40 backdrop-blur-sm z-[100] lg:hidden animate-in fade-in duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar (Desktop + Mobile Drawer) */}
      <aside className={`
        fixed inset-y-0 left-0 z-[110] w-72 bg-white border-r border-slate-100 transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) lg:static lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col p-6">
          <div className="px-2 mb-10 flex items-center justify-between">
            <img 
              src={APP_LOGO} 
              alt="Cloud One Technologies" 
              className="h-16 w-auto object-contain"
            />
            <button 
              className="lg:hidden p-2 text-slate-400 hover:bg-slate-50 rounded-xl"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={24} />
            </button>
          </div>

          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => (
              <SidebarItem
                key={item.path}
                {...item}
                active={location.pathname === item.path}
                onClick={() => setSidebarOpen(false)}
              />
            ))}
          </nav>

          <div className="pt-6 mt-6 border-t border-slate-100">
            <div className="px-4 py-4 mb-4 flex items-center gap-3 bg-slate-50 rounded-2xl">
              <div className="w-10 h-10 rounded-full bg-brand-secondary flex items-center justify-center text-white text-sm font-bold shadow-sm">
                {user?.name.slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                <p className="text-[10px] font-bold text-brand-primary tracking-wider">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-all duration-200 font-semibold group"
            >
              <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span>Logout Session</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <div className="flex-1 lg:flex-none">
              <img 
                src={APP_LOGO} 
                alt="Cloud One" 
                className="h-10 lg:hidden"
              />
              <div className="hidden lg:block">
                 <h2 className="text-xs font-black text-slate-300 tracking-[0.2em]">Enterprise Management Suite</h2>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            <div className="flex items-center bg-brand-surface border border-slate-100 rounded-full p-0.5 sm:p-1 gap-0.5 sm:gap-1">
               <button 
                onClick={() => setCurrency(Currency.AED)}
                className={`px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-black transition-all ${currency === Currency.AED ? 'bg-brand-primary text-white shadow-md' : 'text-slate-400 hover:text-brand-primary'}`}
               >
                 AED
               </button>
               <button 
                onClick={() => setCurrency(Currency.INR)}
                className={`px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-black transition-all ${currency === Currency.INR ? 'bg-brand-primary text-white shadow-md' : 'text-slate-400 hover:text-brand-primary'}`}
               >
                 INR
               </button>
            </div>

            <div className="hidden md:block text-right">
              <p className="text-[10px] font-black text-slate-400 tracking-widest">Active: {currency}</p>
              <p className="text-sm font-bold text-brand-primary">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            </div>
            
            <div className="w-px h-8 bg-slate-100 hidden md:block" />
            
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden sm:flex w-10 h-10 bg-brand-surface rounded-full items-center justify-center text-brand-primary cursor-pointer hover:bg-brand-secondary/10 transition-colors">
                <Coins size={20} className={currency === Currency.INR ? 'text-brand-secondary' : 'text-brand-primary'} />
              </div>

              <button 
                onClick={handleLogout}
                className="w-10 h-10 flex items-center justify-center text-rose-500 hover:bg-rose-50 rounded-full transition-all active:scale-95"
                title="LOGOUT"
              >
                <LogOut size={22} />
              </button>
            </div>
          </div>
        </header>

        <div className="p-6 lg:p-10 overflow-x-hidden pb-24 lg:pb-10">
          {children}
        </div>

        <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-white/90 backdrop-blur-xl border-t border-slate-100 flex items-center justify-around px-4 pb-2 z-40 shadow-[0_-10px_25px_rgba(0,0,0,0.03)]">
          <MobileNavItem 
            icon={LayoutDashboard} 
            label="Home" 
            path="/" 
            active={location.pathname === '/'} 
          />
          <MobileNavItem 
            icon={Users} 
            label="Clients" 
            path="/customers" 
            active={location.pathname === '/customers'} 
          />
          <MobileNavItem 
            icon={Briefcase} 
            label="Assets" 
            path="/services" 
            active={location.pathname === '/services'} 
          />
          <MobileNavItem 
            icon={Receipt} 
            label="Billing" 
            path="/invoices" 
            active={location.pathname === '/invoices'} 
          />
          <button 
            onClick={() => setSidebarOpen(true)}
            className="flex flex-col items-center justify-center gap-1 flex-1 text-slate-400 group"
          >
            <div className="p-1.5 rounded-lg group-active:bg-brand-primary/10 transition-colors">
              <Menu size={22} />
            </div>
            <span className="text-[9px] font-black tracking-tighter">Menu</span>
          </button>
        </nav>
      </main>
    </div>
  );
};

export default Layout;


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
  Search,
  ChevronRight,
  ShieldCheck,
  User as UserIcon,
  Plus,
  Power
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
    className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group ${
      active 
        ? 'bg-brand-primary text-white shadow-xl shadow-brand-primary/20 scale-[1.02]' 
        : 'text-slate-400 hover:bg-slate-50 hover:text-brand-primary'
    }`}
  >
    <div className={`p-2 rounded-xl transition-colors ${active ? 'bg-white/10' : 'bg-transparent group-hover:bg-brand-primary/10'}`}>
      <Icon size={20} strokeWidth={active ? 2.5 : 2} />
    </div>
    <span className={`text-sm tracking-tight ${active ? 'font-bold' : 'font-semibold'}`}>{label}</span>
    {active && <ChevronRight size={14} className="ml-auto opacity-50" />}
  </Link>
);

const DockItem = ({ icon: Icon, label, path, active }: any) => (
  <Link
    to={path}
    className={`relative flex flex-col items-center justify-center flex-1 py-3 transition-all duration-500 ${
      active ? 'text-brand-primary -translate-y-1' : 'text-slate-400'
    }`}
  >
    <div className={`p-2.5 rounded-2xl transition-all duration-500 ${active ? 'bg-brand-primary/10 shadow-inner' : 'bg-transparent'}`}>
      <Icon size={22} strokeWidth={active ? 2.5 : 2} />
    </div>
    <span className={`text-[10px] font-black tracking-tighter mt-1.5 transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-60'}`}>
      {label}
    </span>
    {active && (
      <div className="absolute -bottom-1 w-1 h-1 bg-brand-primary rounded-full shadow-[0_0_8px_rgba(43,93,138,0.8)]" />
    )}
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
    { icon: LayoutDashboard, label: 'Hub', path: '/' },
    { icon: Users, label: 'Clients', path: '/customers' },
    { icon: Briefcase, label: 'Assets', path: '/services' },
    { icon: FileText, label: 'Quotes', path: '/quotations' },
    { icon: Receipt, label: 'Invoices', path: '/invoices' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#f8fbfe] flex font-sans selection:bg-brand-secondary/20">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-brand-primary/30 backdrop-blur-md z-[100] lg:hidden animate-in fade-in duration-500"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Desktop Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-[110] w-80 bg-white border-r border-slate-100 transform transition-all duration-700 lg:static lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col p-8">
          <div className="flex items-center justify-between mb-12">
            <Link to="/" className="flex items-center gap-3">
              <img src={APP_LOGO} alt="Cloud One" className="h-14 w-auto object-contain drop-shadow-sm" />
              <div>
                <h1 className="text-lg font-black text-brand-primary leading-none tracking-tight">Cloud One</h1>
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-0.5">Enterprise OS 2.5</p>
              </div>
            </Link>
            <button className="lg:hidden p-3 bg-slate-50 rounded-2xl text-slate-400" onClick={() => setSidebarOpen(false)}>
              <X size={20} />
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
            
            <div className="pt-6 mt-6 border-t border-slate-50 space-y-2">
              {isAdmin && (
                <>
                  <SidebarItem icon={ShieldCheck} label="Team" path="/users" active={location.pathname === '/users'} />
                  <SidebarItem icon={Settings} label="Backups" path="/backup" active={location.pathname === '/backup'} />
                </>
              )}
            </div>
          </nav>

          <div className="pt-8 mt-8 border-t border-slate-50">
            <Link to="/profile" className="flex items-center gap-4 p-4 rounded-3xl bg-slate-50/50 border border-slate-100 hover:border-brand-primary/20 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-brand-primary text-white flex items-center justify-center font-bold text-lg shadow-lg group-hover:scale-110 transition-transform">
                {user?.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-slate-900 truncate">{user?.name}</p>
                <p className="text-[10px] font-bold text-brand-secondary tracking-widest uppercase">{user?.role}</p>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="mt-4 w-full flex items-center justify-center gap-2 py-4 text-rose-500 hover:bg-rose-50 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest"
            >
              <LogOut size={16} />
              Terminate Session
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Modern Glass Header */}
        <header className="h-24 bg-white/70 backdrop-blur-2xl border-b border-slate-100/50 flex items-center justify-between px-6 lg:px-12 sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-3 bg-white border border-slate-100 rounded-2xl shadow-sm text-brand-primary active:scale-95 transition-all"
            >
              <Menu size={20} />
            </button>
            <div className="hidden lg:block">
              <h2 className="text-xs font-black text-slate-300 tracking-[0.3em] uppercase">Cloud Terminal Alpha</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-[11px] font-bold text-slate-500">Global Node Active</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            {/* Search Trigger */}
            <div className="hidden md:flex items-center relative group">
              <Search className="absolute left-4 text-slate-300 group-focus-within:text-brand-primary transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Global Search..."
                className="pl-11 pr-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold w-48 focus:w-64 transition-all outline-none focus:ring-4 focus:ring-brand-primary/5 focus:bg-white"
              />
            </div>

            {/* Currency Multi-Toggle */}
            <div className="bg-slate-100/50 border border-slate-200/50 p-1.5 rounded-full flex gap-1 shadow-inner">
               <button 
                onClick={() => setCurrency(Currency.AED)}
                className={`px-4 py-1.5 rounded-full text-[9px] font-black transition-all ${currency === Currency.AED ? 'bg-brand-primary text-white shadow-xl scale-[1.05]' : 'text-slate-400 hover:text-brand-primary'}`}
               >
                 AED
               </button>
               <button 
                onClick={() => setCurrency(Currency.INR)}
                className={`px-4 py-1.5 rounded-full text-[9px] font-black transition-all ${currency === Currency.INR ? 'bg-brand-primary text-white shadow-xl scale-[1.05]' : 'text-slate-400 hover:text-brand-primary'}`}
               >
                 INR
               </button>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <Link to="/profile" className="flex w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-brand-primary/10 text-brand-primary items-center justify-center hover:bg-brand-primary hover:text-white transition-all shadow-sm">
                <UserIcon size={20} />
              </Link>
              
              {/* REQUESTED LOGOUT BUTTON TOP RIGHT */}
              <button 
                onClick={handleLogout}
                className="flex w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-rose-50 text-rose-500 items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm border border-rose-100 active:scale-90"
                title="Logout Session"
              >
                <Power size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-32 lg:pb-12 bg-transparent">
          <div className="p-6 lg:p-12 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </div>
        </div>

        {/* 2025 Floating Command Dock */}
        <nav className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 h-20 w-[92%] glass-card shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[2.5rem] flex items-center justify-around px-4 z-50 border border-white/50 animate-in slide-in-from-bottom-12 duration-1000">
          <DockItem 
            icon={LayoutDashboard} 
            label="Hub" 
            path="/" 
            active={location.pathname === '/'} 
          />
          <DockItem 
            icon={Users} 
            label="Clients" 
            path="/customers" 
            active={location.pathname === '/customers'} 
          />
          <div className="relative -top-8">
            <button 
              onClick={() => navigate('/quotations')}
              className="w-16 h-16 bg-brand-gradient text-white rounded-[1.75rem] shadow-2xl shadow-brand-primary/40 flex items-center justify-center active:scale-90 transition-all border-4 border-white"
            >
              <Plus size={32} strokeWidth={3} />
            </button>
          </div>
          <DockItem 
            icon={Receipt} 
            label="Billing" 
            path="/invoices" 
            active={location.pathname === '/invoices'} 
          />
          <DockItem 
            icon={UserIcon} 
            label="Profile" 
            path="/profile" 
            active={location.pathname === '/profile'} 
          />
        </nav>
      </main>
    </div>
  );
};

export default Layout;

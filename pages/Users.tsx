
import React, { useState } from 'react';
import { 
  ShieldCheck, 
  UserPlus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Key, 
  Mail, 
  User as UserIcon,
  Shield,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { User, UserRole, UserProfile } from '../types';

const Users: React.FC = () => {
  const { users, user: currentUser, addUser, updateUser, deleteUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Fixed: Use UserProfile | null as the users array contains UserProfile objects
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: UserRole.STAFF
  });

  const isAdmin = currentUser?.role === UserRole.ADMIN;

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fixed: Parameter type updated to UserProfile
  const handleEdit = (u: UserProfile) => {
    setEditingUser(u);
    setFormData({
      name: u.name,
      email: u.email,
      // Fixed: safely access password if it exists (for internal tracking if any)
      password: (u as any).password || '',
      role: u.role
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateUser({ ...editingUser, ...formData });
    } else {
      addUser(formData);
    }
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({ name: '', email: '', password: '', role: UserRole.STAFF });
  };

  if (!isAdmin || !currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-8">
          <ShieldAlert size={48} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight uppercase">Access Denied</h2>
        <p className="text-slate-400 font-medium max-w-md leading-relaxed">System security parameters restrict Team Management to Master Administrators only.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Team Management</h1>
          <p className="text-slate-400 font-medium mt-1">Configure internal stakeholders and terminal access permissions.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-3 bg-brand-primary hover:bg-brand-primary/90 text-white px-8 py-4 rounded-[1.5rem] font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl shadow-brand-primary/20 group transition-all"
        >
          <UserPlus size={18} className="group-hover:scale-110 transition-transform" />
          <span>Onboard Stakeholder</span>
        </button>
      </div>

      <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
        <div className="relative mb-10">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          <input
            type="text"
            placeholder="Search team by name or email terminal..."
            className="w-full pl-14 pr-8 py-5 bg-brand-surface border-none rounded-2xl focus:ring-4 focus:ring-brand-primary/5 transition-all font-bold text-slate-700 placeholder:text-slate-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-slate-50">
                <th className="pb-6 font-black text-slate-400 text-[10px] tracking-[0.2em] pl-4">Identity</th>
                <th className="pb-6 font-black text-slate-400 text-[10px] tracking-[0.2em]">Email Terminal</th>
                <th className="pb-6 font-black text-slate-400 text-[10px] tracking-[0.2em]">System Role</th>
                <th className="pb-6 font-black text-slate-400 text-[10px] tracking-[0.2em]">Joined</th>
                <th className="pb-6 font-black text-slate-400 text-[10px] tracking-[0.2em] text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="group hover:bg-brand-surface transition-colors duration-300">
                  <td className="py-6 pl-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg transition-all group-hover:scale-110 ${
                        u.role === UserRole.ADMIN ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-sm">{u.name}</p>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">ID: {u.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-6">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                      <Mail size={14} className="text-slate-300" />
                      {u.email}
                    </div>
                  </td>
                  <td className="py-6">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-[0.2em] border uppercase ${
                      u.role === UserRole.ADMIN 
                        ? 'bg-brand-primary text-white border-transparent shadow-md' 
                        : 'bg-white text-slate-500 border-slate-100'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {/* Fixed: u.createdAt is now available on UserProfile */}
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-6 text-right pr-4">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEdit(u)}
                        className="p-3 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/5 rounded-xl transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      {u.id !== currentUser.id && (
                        <button 
                          onClick={() => deleteUser(u.id)}
                          className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-brand-primary/30 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl p-12 space-y-10 animate-in zoom-in-95 duration-500">
            <div className="flex items-center justify-between border-b border-slate-50 pb-8">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{editingUser ? 'Update Profile' : 'Stakeholder Onboarding'}</h3>
                <p className="text-[10px] font-black text-slate-400 tracking-[0.3em] uppercase mt-1">System Terminal Authorization</p>
              </div>
              <button onClick={closeModal} className="p-4 hover:bg-rose-50 hover:text-rose-500 text-slate-300 rounded-[1.5rem] transition-all border border-slate-100 bg-white"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 tracking-widest ml-1 uppercase">Stakeholder Identity</label>
                <div className="relative">
                  <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input
                    required
                    placeholder="Full Professional Name"
                    className="w-full pl-16 pr-6 py-5 bg-brand-surface border-none rounded-2xl outline-none focus:ring-4 focus:ring-brand-primary/5 text-sm font-bold shadow-inner"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 tracking-widest ml-1 uppercase">Email Terminal</label>
                <div className="relative">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input
                    required
                    type="email"
                    placeholder="Email Address"
                    className="w-full pl-16 pr-6 py-5 bg-brand-surface border-none rounded-2xl outline-none focus:ring-4 focus:ring-brand-primary/5 text-sm font-bold shadow-inner"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 tracking-widest ml-1 uppercase">Security Token (Password)</label>
                <div className="relative">
                  <Key className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input
                    required
                    type="password"
                    placeholder="Authentication Code"
                    className="w-full pl-16 pr-6 py-5 bg-brand-surface border-none rounded-2xl outline-none focus:ring-4 focus:ring-brand-primary/5 text-sm font-bold shadow-inner"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 tracking-widest ml-1 uppercase">System Access Role</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, role: UserRole.STAFF})}
                    className={`flex items-center justify-center gap-3 py-5 rounded-2xl font-black text-[10px] tracking-widest uppercase transition-all ${
                      formData.role === UserRole.STAFF ? 'bg-slate-900 text-white shadow-xl' : 'bg-brand-surface text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    <Shield size={16} />
                    Staff Member
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, role: UserRole.ADMIN})}
                    className={`flex items-center justify-center gap-3 py-5 rounded-2xl font-black text-[10px] tracking-widest uppercase transition-all ${
                      formData.role === UserRole.ADMIN ? 'bg-brand-primary text-white shadow-xl' : 'bg-brand-surface text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    <ShieldCheck size={16} />
                    Administrator
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full py-6 bg-brand-primary text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                Commit Authentication Profile
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
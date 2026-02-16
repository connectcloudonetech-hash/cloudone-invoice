
import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Mail, 
  X, 
  Building2, 
  User as UserIcon,
  MessageCircle,
  ShieldCheck,
  Smartphone,
  ChevronRight,
  Loader2,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { Customer } from '../types';

const CustomerCard = ({ customer, onEdit, onDelete }: { customer: Customer, onEdit: (c: Customer) => void, onDelete: (id: string) => void }) => (
  <div className="glass-card p-8 rounded-[3rem] border border-white/50 group transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden flex flex-col h-full">
    <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/5 rounded-full blur-3xl -mr-12 -mt-12 transition-all group-hover:bg-brand-primary/10" />
    
    <div className="flex flex-col flex-1 space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-[1.75rem] bg-brand-gradient p-0.5 shadow-xl transition-transform group-hover:scale-105 duration-500">
             <div className="w-full h-full bg-white rounded-[1.6rem] flex items-center justify-center font-black text-2xl text-brand-primary">
               {customer.name.charAt(0)}
             </div>
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-black text-slate-900 tracking-tight leading-tight truncate">{customer.name}</h3>
            <div className="flex items-center gap-1.5 mt-1">
              <Building2 size={12} className="text-brand-secondary shrink-0" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">
                {customer.companyName || 'Private Client'}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => onEdit(customer)} className="p-3 text-slate-300 hover:text-brand-primary hover:bg-brand-primary/5 rounded-2xl transition-all active:scale-90">
            <Edit2 size={18} />
          </button>
          <button onClick={() => onDelete(customer.id)} className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all active:scale-90">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="space-y-3 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 flex-1">
        <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
          <div className="w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 shrink-0">
            <Mail size={14} />
          </div>
          <span className="truncate">{customer.email}</span>
        </div>
        <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
          <div className="w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 shrink-0">
            <Smartphone size={14} />
          </div>
          <span>{customer.phone}</span>
        </div>
        {customer.address && (
          <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
            <div className="w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 shrink-0">
              <MapPin size={14} />
            </div>
            <span className="truncate">{customer.address}</span>
          </div>
        )}
        {customer.trn && (
          <div className="mt-4 pt-4 border-t border-slate-100/50 flex items-center justify-between">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tax Identity</span>
            <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest bg-brand-primary/5 px-2.5 py-1 rounded-lg">
              {customer.trn}
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <a href={`mailto:${customer.email}`} className="flex-1 py-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-brand-primary hover:border-brand-primary/30 transition-all shadow-sm active:scale-95 group/btn">
           <Mail size={18} className="group-hover/btn:scale-110 transition-transform" />
        </a>
        <a href={`https://wa.me/${customer.phone.replace(/\D/g,'')}`} target="_blank" className="flex-1 py-4 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all shadow-sm active:scale-95 group/btn">
           <MessageCircle size={18} className="group-hover/btn:scale-110 transition-transform" />
        </a>
        <button className="flex-[2] py-4 bg-brand-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-brand-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2 group/btn">
           <span>Profile Trace</span>
           <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  </div>
);

const Customers: React.FC = () => {
  const { customers, addCustomer, updateCustomer, deleteCustomer, isLoading } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    phone: '',
    email: '',
    address: '',
    trn: '',
    notes: ''
  });

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      companyName: customer.companyName,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      trn: customer.trn,
      notes: customer.notes
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await updateCustomer({ ...editingCustomer, ...formData });
      } else {
        await addCustomer(formData);
      }
      closeModal();
    } catch (err) {
      console.error('Terminal Stakeholder Update failed:', err);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCustomer(null);
    setFormData({ name: '', companyName: '', phone: '', email: '', address: '', trn: '', notes: '' });
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 px-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Stakeholder Hub</h1>
          <p className="text-slate-400 text-[11px] font-black tracking-[0.3em] uppercase mt-1">Enterprise Client Directory</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-3 bg-brand-primary text-white px-10 py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-2xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <Plus size={20} /> Onboard Stakeholder
        </button>
      </div>

      {/* Global Filter Bar */}
      <div className="px-4">
        <div className="glass-card p-4 rounded-[2.5rem] border border-white/50 flex items-center relative group">
          <Search className="absolute left-10 text-slate-300 group-focus-within:text-brand-primary transition-colors" size={24} />
          <input
            type="text"
            placeholder="Filter by name, corporate entity, or encrypted mail..."
            className="w-full pl-20 pr-10 py-6 bg-transparent outline-none font-black text-slate-900 placeholder:text-slate-300 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Stakeholder Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
        {isLoading ? (
          <div className="col-span-full py-32 flex flex-col items-center">
            <Loader2 size={48} className="text-brand-primary animate-spin mb-4" />
            <p className="text-[11px] font-black text-slate-300 tracking-[0.3em] uppercase">Synchronizing Nodes...</p>
          </div>
        ) : filteredCustomers.length > 0 ? (
          filteredCustomers.map((customer) => (
            <CustomerCard 
              key={customer.id} 
              customer={customer} 
              onEdit={handleEdit} 
              onDelete={deleteCustomer} 
            />
          ))
        ) : (
          <div className="col-span-full py-32 text-center">
            <div className="w-24 h-24 bg-slate-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-slate-300">
               <UserIcon size={48} />
            </div>
            <p className="text-[11px] font-black text-slate-300 tracking-[0.4em] uppercase">No stakeholders indexed in system cache</p>
          </div>
        )}
      </div>

      {/* Modern Slide-up Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-brand-primary/30 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-[4rem] shadow-3xl overflow-hidden flex flex-col border border-white/50 animate-in zoom-in-95 duration-500">
            <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-brand-surface/30">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">{editingCustomer ? 'Update' : 'New'} Identity</h3>
                <p className="text-[10px] font-black text-slate-400 tracking-[0.3em] uppercase">Stakeholder Profile Configuration</p>
              </div>
              <button onClick={closeModal} className="p-4 hover:bg-rose-50 hover:text-rose-500 text-slate-300 rounded-[1.5rem] transition-all border border-slate-100 bg-white shadow-sm active:scale-95">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 tracking-widest ml-4 uppercase">Full Legal Name</label>
                  <input
                    required
                    placeholder="Stakeholder Identity"
                    className="w-full px-8 py-5 bg-brand-surface border-none rounded-[1.5rem] outline-none focus:ring-4 focus:ring-brand-primary/5 font-bold text-sm shadow-inner"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 tracking-widest ml-4 uppercase">Corporate Title</label>
                  <input
                    placeholder="Company Name"
                    className="w-full px-8 py-5 bg-brand-surface border-none rounded-[1.5rem] outline-none focus:ring-4 focus:ring-brand-primary/5 font-bold text-sm shadow-inner"
                    value={formData.companyName}
                    onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 tracking-widest ml-4 uppercase">Secure Email Terminal</label>
                  <input
                    required
                    type="email"
                    placeholder="name@cloudone.tech"
                    className="w-full px-8 py-5 bg-brand-surface border-none rounded-[1.5rem] outline-none focus:ring-4 focus:ring-brand-primary/5 font-bold text-sm shadow-inner"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 tracking-widest ml-4 uppercase">Mobile Interface</label>
                  <input
                    required
                    placeholder="+971 50 000 0000"
                    className="w-full px-8 py-5 bg-brand-surface border-none rounded-[1.5rem] outline-none focus:ring-4 focus:ring-brand-primary/5 font-bold text-sm shadow-inner"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 tracking-widest ml-4 uppercase">TRN Verification</label>
                  <input
                    placeholder="Tax Registration Number"
                    className="w-full px-8 py-5 bg-brand-surface border-none rounded-[1.5rem] outline-none focus:ring-4 focus:ring-brand-primary/5 font-bold text-sm shadow-inner"
                    value={formData.trn}
                    onChange={(e) => setFormData({...formData, trn: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 tracking-widest ml-4 uppercase">Geographic Node</label>
                  <input
                    placeholder="Physical Address"
                    className="w-full px-8 py-5 bg-brand-surface border-none rounded-[1.5rem] outline-none focus:ring-4 focus:ring-brand-primary/5 font-bold text-sm shadow-inner"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 tracking-widest ml-4 uppercase">Internal Stakeholder Notes</label>
                <textarea
                  rows={4}
                  placeholder="System metadata or contractual context..."
                  className="w-full px-8 py-6 bg-brand-surface border-none rounded-[2rem] outline-none focus:ring-4 focus:ring-brand-primary/5 font-bold text-sm shadow-inner"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>
              <div className="pt-4 flex items-center justify-end gap-6">
                <button 
                  type="button"
                  onClick={closeModal}
                  className="px-10 py-5 text-slate-400 hover:text-slate-900 font-black uppercase text-[10px] tracking-[0.3em] transition-colors"
                >
                  Discard
                </button>
                <button 
                  type="submit"
                  className="px-12 py-5 bg-brand-primary text-white rounded-[1.5rem] font-black uppercase text-[10px] tracking-[0.3em] shadow-2xl shadow-brand-primary/20 active:scale-95 transition-all"
                >
                  {editingCustomer ? 'Authorize Updates' : 'Commit Onboarding'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;

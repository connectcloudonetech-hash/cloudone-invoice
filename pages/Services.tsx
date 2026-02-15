
import React, { useState, useMemo } from 'react';
import { 
  Briefcase, 
  Edit2, 
  Check, 
  X, 
  DollarSign, 
  Info, 
  BarChart3, 
  History, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  FileText,
  Receipt,
  Search,
  PlusCircle,
  CreditCard,
  Monitor,
  Code,
  Globe,
  Palette,
  Smartphone,
  Tag,
  Layers,
  Save,
  Plus,
  AlertCircle
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { UserRole, ServiceItem, Quotation, Invoice, DocStatus, LineItem, Currency } from '../types';
import { formatCurrency } from '../utils/storage';
import { VAT_RATE } from '../constants';

const ServiceIcon = ({ name, size = 18, className = "" }: { name?: string, size?: number, className?: string }) => {
  const icons: Record<string, any> = {
    'Monitor': Monitor,
    'Code': Code,
    'Globe': Globe,
    'Palette': Palette,
    'Smartphone': Smartphone,
    'Briefcase': Briefcase
  };
  
  const IconComponent = name ? icons[name] || Briefcase : Briefcase;
  return <IconComponent size={size} className={className} />;
};

const AVAILABLE_ICONS = ['Monitor', 'Code', 'Globe', 'Palette', 'Smartphone', 'Briefcase'];

const Services: React.FC = () => {
  const { services, addService, updateService, quotations, invoices, customers, addInvoice, currency, convertValue } = useData();
  const { user } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<string>('');
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const [newServiceForm, setNewServiceForm] = useState<Omit<ServiceItem, 'id'>>({
    name: '',
    price: 0,
    category: '',
    description: '',
    iconName: 'Briefcase'
  });

  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editForm, setEditForm] = useState<Partial<ServiceItem>>({});

  const [isInvoiceMode, setIsInvoiceMode] = useState(false);
  const [invCustomerId, setInvCustomerId] = useState('');
  const [invQty, setInvQty] = useState(1);
  const [invDiscount, setInvDiscount] = useState(0);

  const isAdmin = user?.role === UserRole.ADMIN;

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.category && s.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceForm.name || newServiceForm.price <= 0) return;
    addService(newServiceForm);
    setIsAddModalOpen(false);
    setNewServiceForm({
      name: '',
      price: 0,
      category: '',
      description: '',
      iconName: 'Briefcase'
    });
  };

  const startEditingPrice = (service: ServiceItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAdmin) return;
    setEditingId(service.id);
    setTempPrice(service.price.toString());
  };

  const cancelEditingPrice = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingId(null);
    setTempPrice('');
  };

  const handleSavePrice = (service: ServiceItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const newPrice = parseFloat(tempPrice);
    if (isNaN(newPrice)) return;
    updateService({ ...service, price: newPrice });
    setEditingId(null);
  };

  const startEditingDetails = () => {
    if (!selectedService) return;
    setEditForm({ ...selectedService });
    setIsEditingDetails(true);
  };

  const cancelEditingDetails = () => {
    setIsEditingDetails(false);
    setEditForm({});
  };

  const saveDetails = () => {
    if (!selectedService || !editForm.name) return;
    const updated = { ...selectedService, ...editForm } as ServiceItem;
    updateService(updated);
    setSelectedService(updated);
    setIsEditingDetails(false);
    setEditForm({});
  };

  const getServiceInsights = (serviceId: string) => {
    const relatedQuotes = quotations.filter(q => q.items.some(item => item.serviceId === serviceId));
    const relatedInvoices = invoices.filter(i => i.items.some(item => item.serviceId === serviceId));
    
    const totalRevenue = relatedInvoices.reduce((acc, inv) => {
      const item = inv.items.find(it => it.serviceId === serviceId);
      return acc + (item ? item.total : 0);
    }, 0);

    return {
      quotes: relatedQuotes,
      invoices: relatedInvoices,
      revenue: totalRevenue,
      volume: relatedQuotes.length + relatedInvoices.length
    };
  };

  const activeInsights = useMemo(() => 
    selectedService ? getServiceInsights(selectedService.id) : null, 
    [selectedService, quotations, invoices]
  );

  const handleCreateDirectInvoice = () => {
    if (!selectedService || !invCustomerId) return;
    
    const subtotal = selectedService.price * invQty;
    const vat = subtotal * VAT_RATE;
    const total = subtotal + vat - invDiscount;

    const lineItem: LineItem = {
      id: Math.random().toString(36).substr(2, 9),
      serviceId: selectedService.id,
      name: selectedService.name,
      quantity: invQty,
      unitPrice: selectedService.price,
      total: subtotal
    };

    addInvoice({
      customerId: invCustomerId,
      items: [lineItem],
      subtotal,
      vat,
      vatRate: VAT_RATE * 100,
      discount: invDiscount,
      total,
      status: DocStatus.UNPAID,
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    });

    setIsInvoiceMode(false);
    setSelectedService(null);
    setInvCustomerId('');
    setInvQty(1);
    setInvDiscount(0);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Service Catalog</h1>
          <p className="text-slate-400 font-medium mt-1">Manage core offerings and proprietary pricing models.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Filter by name..."
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-primary/10 transition-all text-sm font-medium w-64 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {isAdmin && (
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-xl shadow-brand-primary/20 group"
            >
              <Plus size={18} className="group-hover:rotate-90 transition-transform" />
              <span>New Asset</span>
            </button>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-slate-50">
                <th className="pb-6 font-black text-slate-400 text-[10px] tracking-[0.2em] pl-4">Asset Code</th>
                <th className="pb-6 font-black text-slate-400 text-[10px] tracking-[0.2em]">Service Description</th>
                <th className="pb-6 font-black text-slate-400 text-[10px] tracking-[0.2em]">Category</th>
                <th className="pb-6 font-black text-slate-400 text-[10px] tracking-[0.2em]">Unit Value</th>
                <th className="pb-6 font-black text-slate-400 text-[10px] tracking-[0.2em] text-right pr-4">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredServices.map((service) => (
                <tr 
                  key={service.id} 
                  onClick={() => {
                    if (editingId !== service.id) {
                      setSelectedService(service);
                      setIsEditingDetails(false);
                      setIsInvoiceMode(false);
                    }
                  }}
                  className={`group transition-all duration-300 ${editingId === service.id ? 'bg-brand-primary/5' : 'hover:bg-brand-surface cursor-pointer'}`}
                >
                  <td className="py-6 pl-4 font-black text-slate-300 text-xs tracking-tighter">
                    #{service.id.padStart(3, '0')}
                  </td>
                  <td className="py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-brand-surface rounded-2xl flex items-center justify-center text-brand-primary transition-all group-hover:scale-110">
                        <ServiceIcon name={service.iconName} size={22} />
                      </div>
                      <div className="max-w-[240px]">
                        <p className="font-black text-slate-900 text-sm">{service.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 line-clamp-1">{service.description || 'No technical spec provided.'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-6">
                    <span className="px-3 py-1 bg-brand-surface text-brand-primary rounded-lg text-[9px] font-black tracking-widest border border-slate-100 uppercase">
                      {service.category || 'Standard'}
                    </span>
                  </td>
                  <td className="py-6">
                    {editingId === service.id ? (
                      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        <div className="relative group">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">AED</span>
                          <input
                            autoFocus
                            type="number"
                            className="pl-12 pr-4 py-2.5 bg-white border-2 border-brand-primary rounded-xl focus:ring-4 focus:ring-brand-primary/10 outline-none font-black text-brand-primary text-sm w-32 shadow-sm transition-all"
                            value={tempPrice}
                            onChange={(e) => setTempPrice(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSavePrice(service, e as any);
                              if (e.key === 'Escape') cancelEditingPrice();
                            }}
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <button 
                            onClick={(e) => handleSavePrice(service, e)}
                            className="p-1 text-emerald-500 hover:bg-emerald-50 rounded"
                          >
                            <Check size={16} strokeWidth={3} />
                          </button>
                          <button 
                            onClick={(e) => cancelEditingPrice(e)}
                            className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                          >
                            <X size={16} strokeWidth={3} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 group/price">
                        <p className="font-black text-brand-primary text-sm tracking-tight">
                          {formatCurrency(convertValue(service.price), currency)}
                        </p>
                        {isAdmin && (
                          <button 
                            onClick={(e) => startEditingPrice(service, e)}
                            className="p-1.5 text-slate-300 hover:text-brand-secondary hover:bg-brand-secondary/5 rounded-lg opacity-0 group-hover/price:opacity-100 transition-all"
                          >
                            <Edit2 size={14} />
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="py-6 text-right pr-4">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-100 text-slate-500 hover:text-brand-primary hover:border-brand-primary rounded-xl text-[10px] font-black transition-all shadow-sm group-hover:bg-brand-surface"
                      >
                        <BarChart3 size={14} />
                        <span>Insights</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-brand-primary/20 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl p-12 space-y-10 animate-in zoom-in-95 duration-500">
            <div className="flex items-center justify-between border-b border-slate-50 pb-8">
              <div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Catalog Enrollment</h3>
                <p className="text-[10px] font-black text-slate-400 tracking-[0.3em] uppercase mt-1">New Asset Entry Process</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-4 hover:bg-rose-50 hover:text-rose-500 text-slate-300 rounded-[1.5rem] transition-all border border-slate-100 bg-white"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleAddService} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 tracking-widest ml-1 uppercase">Asset Name</label>
                  <input 
                    required 
                    placeholder="e.g. Enterprise Cloud ERP" 
                    className="w-full px-6 py-5 bg-brand-surface border-none rounded-[1.5rem] outline-none focus:ring-4 focus:ring-brand-primary/5 text-sm font-bold shadow-inner" 
                    value={newServiceForm.name} 
                    onChange={e => setNewServiceForm({...newServiceForm, name: e.target.value})} 
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 tracking-widest ml-1 uppercase">Industry Category</label>
                  <input 
                    placeholder="e.g. Infrastructure" 
                    className="w-full px-6 py-5 bg-brand-surface border-none rounded-[1.5rem] outline-none focus:ring-4 focus:ring-brand-primary/5 text-sm font-bold shadow-inner" 
                    value={newServiceForm.category} 
                    onChange={e => setNewServiceForm({...newServiceForm, category: e.target.value})} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 tracking-widest ml-1 uppercase">Base Unit Price (AED)</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">AED</span>
                    <input 
                      required 
                      type="number" 
                      placeholder="0.00" 
                      className="w-full pl-16 pr-6 py-5 bg-brand-surface border-none rounded-[1.5rem] outline-none focus:ring-4 focus:ring-brand-primary/5 text-sm font-bold shadow-inner" 
                      value={newServiceForm.price || ''} 
                      onChange={e => setNewServiceForm({...newServiceForm, price: parseFloat(e.target.value) || 0})} 
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 tracking-widest ml-1 uppercase">Visual Token</label>
                  <div className="grid grid-cols-6 gap-2">
                    {AVAILABLE_ICONS.map(icon => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setNewServiceForm({...newServiceForm, iconName: icon})}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                          newServiceForm.iconName === icon 
                            ? 'bg-brand-primary text-white scale-110 shadow-lg shadow-brand-primary/20' 
                            : 'bg-brand-surface text-slate-400 hover:bg-slate-100'
                        }`}
                      >
                        <ServiceIcon name={icon} size={20} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 tracking-widest ml-1 uppercase">Technical Specifications</label>
                <textarea 
                  rows={4}
                  placeholder="Define scope, deliverables, and value proposition..." 
                  className="w-full px-6 py-6 bg-brand-surface border-none rounded-[1.5rem] outline-none focus:ring-4 focus:ring-brand-primary/5 text-sm font-bold min-h-[120px] shadow-inner" 
                  value={newServiceForm.description} 
                  onChange={e => setNewServiceForm({...newServiceForm, description: e.target.value})} 
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-6 bg-brand-primary text-white rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-xs shadow-2xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                Enroll Asset into Catalog
              </button>
            </form>
          </div>
        </div>
      )}

      {selectedService && activeInsights && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-brand-primary/30 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[4rem] shadow-[0_32px_128px_-16px_rgba(43,93,138,0.4)] overflow-hidden flex flex-col border border-white/50 animate-in zoom-in-95 slide-in-from-bottom-12 duration-700">
            
            <div className="p-12 border-b border-slate-50 flex items-center justify-between bg-brand-surface/20">
              <div className="flex items-center gap-8">
                <div className="w-20 h-20 bg-brand-gradient rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-brand-primary/30">
                  <ServiceIcon name={selectedService.iconName} size={36} />
                </div>
                <div>
                  {isEditingDetails ? (
                    <div className="space-y-3">
                       <input 
                        className="text-3xl font-black text-slate-900 tracking-tight bg-white border-2 border-brand-primary/10 rounded-2xl px-6 py-2 focus:ring-4 focus:ring-brand-primary/5 outline-none transition-all"
                        value={editForm.name || ''}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      />
                      <input 
                        className="block text-[11px] font-black text-indigo-600 bg-white border border-slate-100 rounded-xl px-4 py-2 tracking-widest focus:ring-2 focus:ring-indigo-100 outline-none uppercase"
                        value={editForm.category || ''}
                        onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                        placeholder="Category..."
                      />
                    </div>
                  ) : (
                    <>
                      <h3 className="text-4xl font-black text-slate-900 tracking-tight">{selectedService.name}</h3>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-[11px] font-black text-brand-primary bg-brand-primary/5 px-4 py-1.5 rounded-full tracking-widest uppercase">
                          Token #{selectedService.id.padStart(3, '0')}
                        </span>
                        <span className="text-[11px] font-black text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full tracking-widest uppercase">
                          {selectedService.category || 'Standard Asset'}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                {isAdmin && !isInvoiceMode && !isEditingDetails && (
                  <button 
                    onClick={startEditingDetails}
                    className="p-5 bg-white hover:bg-brand-surface text-brand-primary rounded-[2rem] transition-all shadow-sm border border-slate-100 flex items-center gap-4 font-black text-[11px] tracking-widest uppercase group"
                  >
                    <Edit2 size={24} className="group-hover:rotate-12 transition-transform" />
                    <span>Modify Profile</span>
                  </button>
                )}
                <button 
                  onClick={() => {
                    setSelectedService(null);
                    setIsInvoiceMode(false);
                    setIsEditingDetails(false);
                  }}
                  className="p-5 bg-white hover:bg-rose-50 hover:text-rose-500 text-slate-300 rounded-[2rem] transition-all shadow-sm border border-slate-100"
                >
                  <X size={32} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar">
              {!isInvoiceMode ? (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-10">
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 text-slate-900">
                          <Info size={24} className="text-brand-primary" />
                          <h4 className="font-black text-xs tracking-[0.3em] uppercase">Service Specification Profile</h4>
                        </div>
                        
                        {isEditingDetails ? (
                          <div className="space-y-3 animate-in slide-in-from-top-4">
                             <textarea 
                              rows={6}
                              className="w-full text-slate-600 font-bold leading-relaxed bg-brand-surface border-2 border-brand-primary/5 rounded-[2.5rem] p-8 focus:ring-8 focus:ring-brand-primary/5 outline-none transition-all shadow-inner"
                              value={editForm.description || ''}
                              onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                              placeholder="Detail the technical parameters of this asset..."
                            />
                          </div>
                        ) : (
                          <div className="text-slate-500 font-bold leading-relaxed bg-brand-surface p-10 rounded-[3rem] border border-slate-50 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                              <Layers size={80} />
                            </div>
                            <p className="relative z-10">{selectedService.description || "System metadata suggests no technical spec has been entered for this asset. Please update to improve quotation clarity."}</p>
                          </div>
                        )}
                      </div>

                      {!isEditingDetails && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between group">
                            <div>
                              <p className="text-[10px] font-black text-slate-400 tracking-widest mb-2 uppercase">Aggregate Revenue</p>
                              <p className="text-3xl font-black text-brand-primary">{formatCurrency(convertValue(activeInsights.revenue), currency)}</p>
                            </div>
                            <div className="p-5 bg-brand-primary/5 text-brand-primary rounded-2xl group-hover:bg-brand-primary group-hover:text-white transition-all">
                              <TrendingUp size={32} />
                            </div>
                          </div>
                          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between group">
                            <div>
                              <p className="text-[10px] font-black text-slate-400 tracking-widest mb-2 uppercase">Utilization Index</p>
                              <p className="text-3xl font-black text-slate-900">{activeInsights.volume} Hits</p>
                            </div>
                            <div className="p-5 bg-slate-50 text-slate-400 rounded-2xl group-hover:bg-slate-900 group-hover:text-white transition-all">
                              <Layers size={32} />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-8">
                      <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white space-y-8 relative overflow-hidden group">
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-brand-secondary/10 rounded-full -mb-16 -mr-16 blur-2xl" />
                        <div className="flex items-center gap-4">
                          <Tag size={20} className="text-brand-secondary" />
                          <h4 className="font-black text-xs tracking-[0.3em] uppercase">Asset Valuation</h4>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] font-black text-white/40 tracking-widest uppercase">Base Rate Configuration</p>
                          {isEditingDetails ? (
                            <div className="flex items-center gap-4">
                              <span className="text-3xl font-black text-brand-secondary">AED</span>
                              <input 
                                type="number"
                                className="w-full bg-white/10 border-2 border-white/10 rounded-2xl px-6 py-3 text-3xl font-black text-white focus:ring-8 focus:ring-brand-secondary/5 outline-none transition-all"
                                value={editForm.price || 0}
                                onChange={(e) => setEditForm({...editForm, price: parseFloat(e.target.value) || 0})}
                              />
                            </div>
                          ) : (
                            <p className="text-5xl font-black tracking-tighter text-brand-secondary">
                              {formatCurrency(convertValue(selectedService.price), currency)}
                            </p>
                          )}
                        </div>
                        <div className="pt-8 border-t border-white/5 space-y-5">
                           <div className="flex items-center justify-between text-[11px] font-black tracking-widest uppercase">
                             <span className="text-white/30">Taxability</span>
                             <span className="text-brand-secondary">5.0% STD VAT</span>
                           </div>
                           <div className="flex items-center justify-between text-[11px] font-black tracking-widest uppercase">
                             <span className="text-white/30">Availability</span>
                             <span className="text-emerald-400">Online</span>
                           </div>
                        </div>
                      </div>

                      {!isEditingDetails && (
                        <div className="p-8 bg-brand-surface rounded-[2.5rem] border border-slate-100 space-y-6">
                          <h4 className="font-black text-[10px] tracking-widest text-slate-400 flex items-center gap-3 uppercase">
                            <ExternalLink size={16} /> Asset Repository
                          </h4>
                          <div className="space-y-3">
                            <button className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 text-xs font-black text-slate-700 hover:border-brand-primary transition-all group shadow-sm">
                              Technical Spec PDF
                              <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 text-xs font-black text-slate-700 hover:border-brand-primary transition-all group shadow-sm">
                              Operational SLA
                              <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {!isEditingDetails && (
                    <div className="space-y-8 pt-12 border-t border-slate-50">
                      <div className="flex items-center gap-4 text-slate-900">
                        <History size={24} className="text-brand-primary" />
                        <h4 className="font-black text-xs tracking-[0.3em] uppercase">Lifecycle Activity Feed</h4>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <div className="space-y-6">
                          <div className="flex items-center justify-between px-4">
                            <span className="text-[11px] font-black text-slate-400 tracking-widest uppercase">Billed Transactions</span>
                            <span className="text-[11px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase">{activeInsights.invoices.length} Finalized</span>
                          </div>
                          <div className="space-y-4">
                            {activeInsights.invoices.length > 0 ? activeInsights.invoices.map((inv) => {
                              const customer = customers.find(c => c.id === inv.customerId);
                              const item = inv.items.find(it => it.serviceId === selectedService.id);
                              return (
                                <div key={inv.id} className="p-6 rounded-[2rem] bg-white border border-slate-100 hover:border-brand-secondary/20 transition-all flex items-center justify-between group shadow-sm">
                                  <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors">
                                      <Receipt size={22} />
                                    </div>
                                    <div>
                                      <p className="text-sm font-black text-slate-900">{inv.invoiceNumber}</p>
                                      <p className="text-[10px] font-bold text-slate-400 uppercase">{customer?.name}</p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-black text-brand-primary">{formatCurrency(convertValue(item?.total || 0), currency)}</p>
                                    <p className="text-[10px] font-black text-slate-300 uppercase">{new Date(inv.createdAt).toLocaleDateString()}</p>
                                  </div>
                                </div>
                              );
                            }) : (
                              <div className="py-20 bg-brand-surface/50 rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center">
                                <AlertCircle size={40} className="text-slate-100 mb-4" />
                                <p className="text-[11px] font-black text-slate-300 tracking-[0.3em] uppercase">No billing events detected</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div className="flex items-center justify-between px-4">
                            <span className="text-[11px] font-black text-slate-400 tracking-widest uppercase">Proposed Quotes</span>
                            <span className="text-[11px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase">{activeInsights.quotes.length} Open</span>
                          </div>
                          <div className="space-y-4">
                            {activeInsights.quotes.length > 0 ? activeInsights.quotes.map((quote) => {
                              const customer = customers.find(c => c.id === quote.customerId);
                              const item = quote.items.find(it => it.serviceId === selectedService.id);
                              return (
                                <div key={quote.id} className="p-6 rounded-[2rem] bg-white border border-slate-100 hover:border-brand-secondary/20 transition-all flex items-center justify-between group shadow-sm">
                                  <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors">
                                      <FileText size={22} />
                                    </div>
                                    <div>
                                      <p className="text-sm font-black text-slate-900">{quote.quoteNumber}</p>
                                      <p className="text-[10px] font-bold text-slate-400 uppercase">{customer?.name}</p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-black text-brand-primary">{formatCurrency(convertValue(item?.total || 0), currency)}</p>
                                    <p className="text-[10px] font-black text-slate-300 uppercase">{new Date(quote.createdAt).toLocaleDateString()}</p>
                                  </div>
                                </div>
                              );
                            }) : (
                              <div className="py-20 bg-brand-surface/50 rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center">
                                <AlertCircle size={40} className="text-slate-100 mb-4" />
                                <p className="text-[11px] font-black text-slate-300 tracking-[0.3em] uppercase">No active proposals</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="max-w-3xl mx-auto space-y-12 animate-in zoom-in-95 duration-500 p-12 bg-brand-surface rounded-[4rem] border border-slate-100">
                  <div className="flex items-center gap-8 border-b border-white pb-10">
                    <PlusCircle size={48} className="text-brand-secondary" />
                    <div>
                      <h4 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Instant Invoice Generation</h4>
                      <p className="text-sm font-bold text-slate-400">Direct billing for asset: <span className="text-brand-primary">{selectedService.name}</span></p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-500 tracking-[0.3em] ml-2 uppercase">Client Selection</label>
                      <select 
                        required
                        className="w-full px-8 py-5 bg-white border-none rounded-3xl focus:ring-8 focus:ring-brand-secondary/5 outline-none font-black text-slate-700 shadow-sm"
                        value={invCustomerId}
                        onChange={(e) => setInvCustomerId(e.target.value)}
                      >
                        <option value="">SELECT STAKEHOLDER...</option>
                        {customers.map(c => (
                          <option key={c.id} value={c.id}>{c.name} — {c.companyName}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-500 tracking-[0.3em] ml-2 uppercase">Volume</label>
                        <input 
                          type="number"
                          min="1"
                          className="w-full px-8 py-5 bg-white border-none rounded-3xl focus:ring-8 focus:ring-brand-secondary/5 outline-none font-black text-brand-primary text-center shadow-sm"
                          value={invQty}
                          onChange={(e) => setInvQty(parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-500 tracking-[0.3em] ml-2 uppercase">Discount</label>
                        <input 
                          type="number"
                          className="w-full px-8 py-5 bg-white border-none rounded-3xl focus:ring-8 focus:ring-brand-secondary/5 outline-none font-black text-brand-secondary text-center shadow-sm"
                          value={invDiscount}
                          onChange={(e) => setInvDiscount(parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-brand-primary p-12 rounded-[3.5rem] text-white space-y-8 shadow-[0_24px_64px_rgba(43,93,138,0.4)] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24" />
                    <div className="space-y-4 relative z-10">
                      <div className="flex justify-between items-center text-[11px] font-black tracking-widest opacity-60 uppercase">
                        <span>Line Item Subtotal</span>
                        <span>{formatCurrency(convertValue(selectedService.price * invQty), currency)}</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] font-black tracking-widest opacity-60 uppercase">
                        <span>VAT (5% Std)</span>
                        <span>{formatCurrency(convertValue((selectedService.price * invQty) * VAT_RATE), currency)}</span>
                      </div>
                    </div>
                    <div className="pt-8 border-t border-white/10 flex justify-between items-end relative z-10">
                      <div className="space-y-2">
                        <span className="text-xs font-black tracking-[0.3em] opacity-80 uppercase">Total Invoice Valuation</span>
                        {invDiscount > 0 && <p className="text-[10px] font-black text-brand-secondary">-{formatCurrency(convertValue(invDiscount), currency)} Custom Loyalty Rebate Applied</p>}
                      </div>
                      <span className="text-5xl font-black tracking-tighter">{formatCurrency(convertValue((selectedService.price * invQty) * (1 + VAT_RATE) - invDiscount), currency)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-12 border-t border-slate-50 bg-brand-surface/20 flex items-center justify-between">
              {isInvoiceMode ? (
                <button 
                  onClick={() => setIsInvoiceMode(false)}
                  className="px-12 py-5 text-slate-400 hover:text-slate-600 font-black uppercase text-[11px] tracking-[0.3em] transition-colors"
                >
                  Return to Dashboard
                </button>
              ) : isEditingDetails ? (
                <button 
                  onClick={cancelEditingDetails}
                  className="px-12 py-5 text-rose-500 hover:bg-rose-50 rounded-[1.5rem] font-black uppercase text-[11px] tracking-[0.3em] transition-colors"
                >
                  Discard Changes
                </button>
              ) : (
                <div className="w-1" />
              )}
              
              <div className="flex items-center gap-6">
                {isAdmin && (
                  isInvoiceMode ? (
                    <button 
                      onClick={handleCreateDirectInvoice}
                      disabled={!invCustomerId}
                      className="flex items-center gap-4 px-12 py-6 bg-brand-secondary disabled:opacity-50 text-white rounded-[2rem] font-black uppercase text-[11px] tracking-[0.3em] shadow-2xl shadow-brand-secondary/30 hover:scale-[1.02] transition-all active:scale-95"
                    >
                      <Check size={24} />
                      Finalize Billing
                    </button>
                  ) : isEditingDetails ? (
                    <button 
                      onClick={saveDetails}
                      className="flex items-center gap-4 px-12 py-6 bg-brand-primary text-white rounded-[2rem] font-black uppercase text-[11px] tracking-[0.3em] shadow-2xl shadow-brand-primary/30 hover:scale-[1.02] transition-all active:scale-95"
                    >
                      <Save size={24} />
                      Commit Updates
                    </button>
                  ) : (
                    <button 
                      onClick={() => setIsInvoiceMode(true)}
                      className="flex items-center gap-4 px-12 py-6 bg-brand-secondary text-white rounded-[2rem] font-black uppercase text-[11px] tracking-[0.3em] shadow-2xl shadow-brand-secondary/30 hover:scale-[1.02] transition-all active:scale-95"
                    >
                      <CreditCard size={24} />
                      Instant Invoice
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;

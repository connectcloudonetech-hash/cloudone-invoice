
import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Search, FileText, Send, Download, CheckCircle, Trash2, X, UserPlus, PackagePlus, Save, AlertCircle, Coins, Percent } from 'lucide-react';
import { useData } from '../context/DataContext';
import { DocStatus, LineItem, Quotation, Customer, ServiceItem, Currency } from '../types';
import { generateId, formatCurrency } from '../utils/storage';
import { VAT_RATE, AED_TO_INR_RATE } from '../constants.tsx';
import { generateDocumentPDF } from '../utils/pdfGenerator';

const Quotations: React.FC = () => {
  const { customers, quotations, addQuotation, convertQuoteToInvoice, services, addCustomer, updateService, currency: globalCurrency } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [customVatRate, setCustomVatRate] = useState(VAT_RATE * 100);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(globalCurrency);

  // Sync selected currency with global currency when opening modal
  useEffect(() => {
    if (isModalOpen) setSelectedCurrency(globalCurrency);
  }, [isModalOpen, globalCurrency]);

  const subtotal = useMemo(() => lineItems.reduce((acc, curr) => acc + curr.total, 0), [lineItems]);
  const vat = useMemo(() => subtotal * (customVatRate / 100), [subtotal, customVatRate]);
  const total = useMemo(() => subtotal + vat - discount, [subtotal, vat, discount]);

  // Handle currency conversion when user toggles currency in the modal
  const handleCurrencyChange = (newCurrency: Currency) => {
    if (newCurrency === selectedCurrency) return;
    
    const rate = newCurrency === Currency.INR ? AED_TO_INR_RATE : (1 / AED_TO_INR_RATE);
    
    // Convert all existing line items
    const convertedItems = lineItems.map(item => {
      const newUnitPrice = item.unitPrice * rate;
      return {
        ...item,
        unitPrice: newUnitPrice,
        total: newUnitPrice * item.quantity
      };
    });
    
    setLineItems(convertedItems);
    setDiscount(prev => prev * rate);
    setSelectedCurrency(newCurrency);
  };

  const addLineItem = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;
    
    // Use price adjusted for current selected currency
    const basePrice = selectedCurrency === Currency.INR ? service.price * AED_TO_INR_RATE : service.price;
    
    const newItem: LineItem = {
      id: Math.random().toString(36).substr(2, 9),
      serviceId: service.id,
      name: service.name,
      description: service.description || '',
      quantity: 1,
      unitPrice: basePrice,
      total: basePrice
    };
    setLineItems([...lineItems, newItem]);
  };

  const updateLineItem = (id: string, updates: Partial<LineItem>) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, ...updates };
        if (updates.quantity !== undefined || updates.unitPrice !== undefined) {
          updated.total = updated.quantity * updated.unitPrice;
        }
        return updated;
      }
      return item;
    }));
  };

  const removeLineItem = (id: string) => {
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || lineItems.length === 0) return;

    addQuotation({
      customerId: selectedCustomerId,
      items: lineItems,
      subtotal,
      vat,
      vatRate: customVatRate,
      discount,
      total,
      status: DocStatus.DRAFT,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      currency: selectedCurrency
    });
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCustomerId('');
    setLineItems([]);
    setDiscount(0);
    setCustomVatRate(VAT_RATE * 100);
  };

  const handleDownload = async (quote: Quotation) => {
    const customer = customers.find(c => c.id === quote.customerId);
    if (customer) await generateDocumentPDF('QUOTATION', quote, customer);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Proposals & Quotes</h1>
          <p className="text-slate-400 font-medium mt-1">Professional estimates for prospective clients.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-3 bg-brand-primary hover:bg-brand-primary/90 text-white px-6 py-3.5 rounded-2xl font-bold transition-all shadow-xl shadow-brand-primary/20 group"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform" />
          <span>New Proposal</span>
        </button>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          <input
            type="text"
            placeholder="Search quotation history..."
            className="w-full pl-12 pr-6 py-4 bg-brand-surface border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-secondary/20 transition-all font-medium placeholder:text-slate-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-slate-50">
                <th className="pb-5 font-black text-slate-400 text-[10px] tracking-[0.2em]">ID Token</th>
                <th className="pb-5 font-black text-slate-400 text-[10px] tracking-[0.2em]">Stakeholder</th>
                <th className="pb-5 font-black text-slate-400 text-[10px] tracking-[0.2em]">Timestamp</th>
                <th className="pb-5 font-black text-slate-400 text-[10px] tracking-[0.2em]">Valuation</th>
                <th className="pb-5 font-black text-slate-400 text-[10px] tracking-[0.2em] text-right">Utility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {quotations.length > 0 ? quotations.map((quote) => {
                const customer = customers.find(c => c.id === quote.customerId);
                return (
                  <tr key={quote.id} className="hover:bg-brand-surface transition-colors">
                    <td className="py-6 font-black text-brand-primary text-sm">{quote.quoteNumber}</td>
                    <td className="py-6">
                      <p className="font-black text-slate-900 text-sm">{customer?.name || 'External Entity'}</p>
                      <p className="text-[10px] font-black text-brand-secondary tracking-widest">{customer?.companyName}</p>
                    </td>
                    <td className="py-6 text-xs font-bold text-slate-400">
                      {new Date(quote.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-6 font-black text-brand-primary text-sm">{formatCurrency(quote.total, quote.currency)}</td>
                    <td className="py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleDownload(quote)}
                          className="p-3 text-slate-400 hover:text-brand-secondary hover:bg-brand-secondary/5 rounded-xl transition-all"
                        >
                          <Download size={18} />
                        </button>
                        <button 
                          onClick={() => convertQuoteToInvoice(quote.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-[10px] font-black tracking-widest transition-all shadow-sm"
                        >
                          <CheckCircle size={14} />
                          Finalize
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <FileText size={48} className="mx-auto text-slate-100 mb-4" />
                    <p className="text-xs font-black text-slate-300 tracking-widest">No quotations in buffer</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-brand-primary/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-6xl max-h-[95vh] rounded-[3.5rem] shadow-[0_32px_128px_-16px_rgba(43,93,138,0.3)] overflow-hidden flex flex-col border border-white/50 animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
            <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-brand-surface/30">
              <div className="pl-2">
                <h3 className="text-3xl font-black text-brand-primary tracking-tight">Generate Quotation</h3>
                <p className="text-slate-400 text-[10px] font-black tracking-[0.3em] mt-1">PROPOSAL BUILDER ALPHA V1.2</p>
              </div>
              <div className="flex items-center gap-4">
                {/* Currency Selector for this Quote */}
                <div className="flex bg-white rounded-2xl border border-slate-100 p-1 shadow-sm">
                  <button 
                    type="button"
                    onClick={() => handleCurrencyChange(Currency.AED)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${selectedCurrency === Currency.AED ? 'bg-brand-primary text-white' : 'text-slate-400'}`}
                  >
                    AED
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleCurrencyChange(Currency.INR)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${selectedCurrency === Currency.INR ? 'bg-brand-primary text-white' : 'text-slate-400'}`}
                  >
                    INR
                  </button>
                </div>
                <button 
                  onClick={closeModal} 
                  className="p-4 hover:bg-rose-50 hover:text-rose-500 text-slate-300 rounded-[1.5rem] transition-all border border-slate-100 bg-white shadow-sm"
                >
                  <X size={28} />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
              <div className="p-10 space-y-10 flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 tracking-widest ml-1">DESIGNATED STAKEHOLDER</label>
                    <select 
                      required
                      className="w-full px-6 py-5 bg-brand-surface border-none rounded-[1.5rem] focus:ring-2 focus:ring-brand-secondary/20 outline-none font-bold text-slate-700 text-sm shadow-sm"
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                    >
                      <option value="">Select designated client...</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id} className="font-bold">{c.name} — {c.companyName}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 tracking-widest ml-1">ASSET LIBRARY CATALOG</label>
                    <select 
                      className="w-full px-6 py-5 bg-brand-secondary/5 border-none text-brand-secondary rounded-[1.5rem] focus:ring-2 focus:ring-brand-secondary/20 outline-none font-black text-xs shadow-sm"
                      onChange={(e) => {
                        if (e.target.value) {
                          addLineItem(e.target.value);
                          e.target.value = '';
                        }
                      }}
                    >
                      <option value="">+ Append service package from vault</option>
                      {services.map(s => (
                        <option key={s.id} value={s.id}>{s.name} — {formatCurrency(selectedCurrency === Currency.INR ? s.price * AED_TO_INR_RATE : s.price, selectedCurrency)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="font-black text-slate-900 text-xs tracking-[0.2em] border-l-4 border-brand-secondary pl-4 py-1">Itemized Resource Allocation</h4>
                  
                  <div className="bg-brand-surface/50 rounded-[2.5rem] p-8 border border-slate-100">
                    <table className="w-full">
                      <thead className="text-left text-[9px] text-slate-400 font-black tracking-[0.2em]">
                        <tr>
                          <th className="pb-6 pl-4">ASSET SPECIFICATIONS</th>
                          <th className="pb-6 w-40 text-center">UNIT RATE</th>
                          <th className="pb-6 w-28 text-center">QTY</th>
                          <th className="pb-6 w-40 text-right pr-4">VALUATION</th>
                          <th className="pb-6 w-16"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {lineItems.map((item) => (
                          <tr key={item.id} className="align-top hover:bg-white/40 transition-colors">
                            <td className="py-6 pl-4 space-y-3">
                              <p className="font-black text-slate-700 text-sm tracking-tight">{item.name}</p>
                              <textarea 
                                placeholder="Detailed technical scope..."
                                className="w-full p-4 text-[11px] font-bold text-slate-500 bg-white border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-secondary/10 outline-none resize-none shadow-sm"
                                rows={2}
                                value={item.description}
                                onChange={(e) => updateLineItem(item.id, { description: e.target.value })}
                              />
                            </td>
                            <td className="py-6 px-4">
                              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
                                <span className="text-[10px] font-black text-slate-300">{selectedCurrency}</span>
                                <input 
                                  type="number"
                                  className="w-full text-xs font-black text-brand-primary outline-none border-none p-0 text-center"
                                  value={item.unitPrice}
                                  onChange={(e) => updateLineItem(item.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                                />
                              </div>
                            </td>
                            <td className="py-6 px-2">
                              <input 
                                type="number"
                                min="1"
                                className="w-full px-3 py-3 bg-white border border-slate-200 rounded-2xl text-center font-black text-brand-primary text-xs shadow-sm outline-none"
                                value={item.quantity}
                                onChange={(e) => updateLineItem(item.id, { quantity: parseInt(e.target.value) || 1 })}
                              />
                            </td>
                            <td className="py-6 text-right pr-4 align-middle">
                              <p className="font-black text-brand-primary text-sm tracking-tight">{formatCurrency(item.total, selectedCurrency)}</p>
                            </td>
                            <td className="py-6 text-right align-middle">
                              <button 
                                type="button"
                                onClick={() => removeLineItem(item.id)}
                                className="text-slate-200 hover:text-rose-500 hover:bg-rose-50 transition-all p-3 rounded-xl"
                              >
                                <Trash2 size={20} />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {lineItems.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-20 text-center">
                              <div className="flex flex-col items-center justify-center opacity-40">
                                <AlertCircle size={48} className="text-slate-200 mb-4" />
                                <p className="text-[10px] font-black text-slate-300 tracking-[0.3em]">AWAITING RESOURCE ALLOCATION INPUT</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-10">
                  <div className="flex-1 bg-brand-surface border border-slate-100 p-10 rounded-[2.5rem] shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                      <FileText size={18} className="text-brand-primary" />
                      <h5 className="text-[10px] font-black text-slate-900 tracking-widest">CONTRACTUAL PROVISIONS & NOTES</h5>
                    </div>
                    <textarea 
                      className="w-full bg-white border border-slate-100 rounded-[1.5rem] p-6 text-xs font-bold text-slate-600 focus:ring-4 focus:ring-brand-primary/5 h-40 outline-none leading-relaxed shadow-inner"
                      placeholder="Enter terms, schedules, or additional context..."
                    />
                  </div>
                  
                  <div className="w-full lg:w-[400px] bg-brand-primary p-10 rounded-[2.5rem] text-white space-y-6 shadow-2xl shadow-brand-primary/30 relative overflow-hidden group">
                    <div className="space-y-4 relative z-10">
                      <div className="flex justify-between items-center text-[10px] font-black tracking-widest opacity-60">
                        <span>AGGREGATE SUBTOTAL</span>
                        <span>{formatCurrency(subtotal, selectedCurrency)}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black tracking-widest opacity-60 flex items-center gap-1">
                          TAX RATE <Percent size={10} />
                        </span>
                        <input 
                          type="number" 
                          className="w-20 px-3 py-1.5 bg-white/10 border border-white/20 rounded-xl text-center font-black text-white focus:ring-2 focus:ring-brand-secondary outline-none text-[10px] shadow-inner"
                          value={customVatRate}
                          onChange={(e) => setCustomVatRate(parseFloat(e.target.value) || 0)}
                        />
                      </div>

                      <div className="flex justify-between items-center text-[10px] font-black tracking-widest opacity-60">
                        <span>ESTIMATED TAX ({customVatRate}%)</span>
                        <span>{formatCurrency(vat, selectedCurrency)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black tracking-widest opacity-60">LOYALTY DISCOUNT</span>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] font-black opacity-40 text-white">{selectedCurrency}</span>
                          <input 
                            type="number" 
                            className="w-32 pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-right font-black text-white focus:ring-2 focus:ring-brand-secondary outline-none text-xs shadow-inner"
                            value={discount}
                            onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-8 border-t border-white/10 flex justify-between items-end relative z-10">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black tracking-[0.2em] opacity-80">NET PROPOSAL VALUATION</span>
                        <p className="text-[9px] font-bold opacity-40 uppercase">VALID FOR 30 DAYS</p>
                      </div>
                      <span className="text-4xl font-black tracking-tighter">{formatCurrency(total, selectedCurrency)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-10 py-8 border-t border-slate-100 bg-white flex items-center justify-between sticky bottom-0 z-20">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="px-8 py-5 text-slate-400 hover:text-rose-500 font-black uppercase text-[10px] tracking-[0.3em] transition-all flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  DISCARD PROPOSAL
                </button>
                
                <button 
                  type="submit"
                  disabled={!selectedCustomerId || lineItems.length === 0}
                  className="px-12 py-5 bg-brand-secondary hover:bg-brand-secondary/90 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-[1.5rem] font-black uppercase text-[10px] tracking-[0.3em] shadow-2xl shadow-brand-secondary/30 transition-all active:scale-95 flex items-center gap-3"
                >
                  <CheckCircle size={18} />
                  AUTHORIZE PROPOSAL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Quotations;

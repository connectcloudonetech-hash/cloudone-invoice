
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Customer, Quotation, Invoice, ServiceItem, DocStatus, Currency, LineItem } from '../types';
import { supabase, handleSupabaseError } from '../utils/supabase';
import { useAuth } from './AuthContext';
import { VAT_RATE, AED_TO_INR_RATE } from '../constants';

interface DataContextType {
  customers: Customer[];
  quotations: Quotation[];
  invoices: Invoice[];
  services: ServiceItem[];
  currency: Currency;
  setCurrency: (c: Currency) => void;
  convertValue: (val: number) => number;
  addCustomer: (c: any) => Promise<void>;
  updateCustomer: (c: Customer) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  addQuotation: (q: any) => Promise<void>;
  addInvoice: (inv: any) => Promise<void>;
  convertQuoteToInvoice: (quoteId: string) => Promise<void>;
  updateInvoiceStatus: (id: string, status: DocStatus) => Promise<void>;
  addService: (s: any) => Promise<void>;
  updateService: (s: ServiceItem) => Promise<void>;
  isLoading: boolean;
  stats: {
    totalCustomers: number;
    totalQuotations: number;
    totalInvoices: number;
    totalRevenue: number;
    pendingPayments: number;
  };
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [currency, setCurrencyState] = useState<Currency>(Currency.AED);
  const [isLoading, setIsLoading] = useState(false);

  // Mapping Helpers
  const mapCustomer = (d: any): Customer => ({
    id: d.id,
    name: d.name,
    companyName: d.company_name || d.companyName || '',
    phone: d.phone || '',
    email: d.email || '',
    address: d.address || '',
    trn: d.trn || '',
    notes: d.notes || '',
    createdAt: d.created_at || d.createdAt || new Date().toISOString()
  });

  const mapQuotation = (d: any): Quotation => ({
    id: d.id,
    quoteNumber: d.quote_number || d.quoteNumber || '',
    customerId: d.customer_id || d.customerId || '',
    items: d.items || [],
    subtotal: d.subtotal || 0,
    vat: d.vat || 0,
    vatRate: d.vat_rate || d.vatRate || 5,
    discount: d.discount || 0,
    total: d.total || 0,
    status: d.status as DocStatus,
    createdAt: d.created_at || d.createdAt || new Date().toISOString(),
    validUntil: d.valid_until || d.validUntil || '',
    currency: d.currency as Currency
  });

  const mapInvoice = (d: any): Invoice => ({
    id: d.id,
    invoiceNumber: d.invoice_number || d.invoiceNumber || '',
    quotationId: d.quotation_id || d.quotationId || '',
    customerId: d.customer_id || d.customerId || '',
    items: d.items || [],
    subtotal: d.subtotal || 0,
    vat: d.vat || 0,
    vatRate: d.vat_rate || d.vatRate || 5,
    discount: d.discount || 0,
    total: d.total || 0,
    status: d.status as DocStatus,
    createdAt: d.created_at || d.createdAt || new Date().toISOString(),
    dueDate: d.due_date || d.dueDate || '',
    currency: d.currency as Currency
  });

  const mapService = (d: any): ServiceItem => ({
    id: d.id,
    name: d.name,
    price: d.price,
    iconName: d.icon_name || d.iconName || 'Briefcase',
    description: d.description || '',
    category: d.category || ''
  });

  const fetchData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [cust, quot, inv, serv] = await Promise.all([
        supabase.from('customers').select('*').order('created_at', { ascending: false }),
        supabase.from('quotations').select('*').order('created_at', { ascending: false }),
        supabase.from('invoices').select('*').order('created_at', { ascending: false }),
        supabase.from('services').select('*').order('name', { ascending: true }),
      ]);

      if (cust.error) throw cust.error;
      if (quot.error) throw quot.error;
      if (inv.error) throw inv.error;
      if (serv.error) throw serv.error;

      if (cust.data) setCustomers(cust.data.map(mapCustomer));
      if (quot.data) setQuotations(quot.data.map(mapQuotation));
      if (inv.data) setInvoices(inv.data.map(mapInvoice));
      if (serv.data) setServices(serv.data.map(mapService));
    } catch (err) {
      handleSupabaseError(err, 'fetchData');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();

      const customerChannel = supabase.channel('public:customers').on('postgres_changes', { event: '*', schema: 'public', table: 'customers' }, fetchData).subscribe();
      const quotationChannel = supabase.channel('public:quotations').on('postgres_changes', { event: '*', schema: 'public', table: 'quotations' }, fetchData).subscribe();
      const invoiceChannel = supabase.channel('public:invoices').on('postgres_changes', { event: '*', schema: 'public', table: 'invoices' }, fetchData).subscribe();
      const serviceChannel = supabase.channel('public:services').on('postgres_changes', { event: '*', schema: 'public', table: 'services' }, fetchData).subscribe();

      return () => {
        supabase.removeChannel(customerChannel);
        supabase.removeChannel(quotationChannel);
        supabase.removeChannel(invoiceChannel);
        supabase.removeChannel(serviceChannel);
      };
    }
  }, [user]);

  useEffect(() => {
    const savedCurrency = localStorage.getItem('cot_preferred_currency') as Currency;
    if (savedCurrency) setCurrencyState(savedCurrency);
  }, []);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem('cot_preferred_currency', c);
  };

  const convertValue = (val: number) => {
    return currency === Currency.INR ? val * AED_TO_INR_RATE : val;
  };

  const getNextNumber = async (type: 'QTN' | 'INV'): Promise<string> => {
    const { data, error } = await supabase
      .from('counters')
      .select('current_val')
      .eq('type', type)
      .single();
    
    let nextVal = 1000;
    if (data) {
      nextVal = data.current_val + 1;
      await supabase.from('counters').update({ current_val: nextVal }).eq('type', type);
    } else {
      await supabase.from('counters').insert([{ type, current_val: nextVal }]);
    }
    return `${type}-${nextVal}`;
  };

  const addCustomer = async (c: any) => {
    const dbCustomer = {
      name: c.name,
      company_name: c.companyName,
      phone: c.phone,
      email: c.email,
      address: c.address,
      trn: c.trn,
      notes: c.notes
    };
    const { error } = await supabase.from('customers').insert([dbCustomer]);
    if (error) throw new Error(handleSupabaseError(error, 'addCustomer'));
    await fetchData();
  };

  const updateCustomer = async (c: Customer) => {
    const dbCustomer = {
      name: c.name,
      company_name: c.companyName,
      phone: c.phone,
      email: c.email,
      address: c.address,
      trn: c.trn,
      notes: c.notes
    };
    const { error } = await supabase.from('customers').update(dbCustomer).eq('id', c.id);
    if (error) throw new Error(handleSupabaseError(error, 'updateCustomer'));
    await fetchData();
  };

  const deleteCustomer = async (id: string) => {
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (error) throw new Error(handleSupabaseError(error, 'deleteCustomer'));
    await fetchData();
  };

  const addQuotation = async (q: any) => {
    const nextNum = await getNextNumber('QTN');
    const dbQuotation = {
      quote_number: nextNum,
      customer_id: q.customerId,
      items: q.items,
      subtotal: q.subtotal,
      vat: q.vat,
      vat_rate: q.vatRate,
      discount: q.discount,
      total: q.total,
      status: q.status,
      valid_until: q.validUntil,
      currency: q.currency
    };
    const { error } = await supabase.from('quotations').insert([dbQuotation]);
    if (error) throw new Error(handleSupabaseError(error, 'addQuotation'));
    await fetchData();
  };

  const addInvoice = async (inv: any) => {
    const nextNum = await getNextNumber('INV');
    const dbInvoice = {
      invoice_number: nextNum,
      quotation_id: inv.quotationId,
      customer_id: inv.customerId,
      items: inv.items,
      subtotal: inv.subtotal,
      vat: inv.vat,
      vat_rate: inv.vatRate,
      discount: inv.discount,
      total: inv.total,
      status: inv.status,
      due_date: inv.dueDate,
      currency: inv.currency
    };
    const { error } = await supabase.from('invoices').insert([dbInvoice]);
    if (error) throw new Error(handleSupabaseError(error, 'addInvoice'));
    await fetchData();
  };

  const convertQuoteToInvoice = async (quoteId: string) => {
    const quote = quotations.find(q => q.id === quoteId);
    if (!quote) return;

    const nextNum = await getNextNumber('INV');
    const dbInvoice = {
      invoice_number: nextNum,
      quotation_id: quote.id,
      customer_id: quote.customerId,
      items: quote.items,
      subtotal: quote.subtotal,
      vat: quote.vat,
      vat_rate: quote.vatRate,
      discount: quote.discount,
      total: quote.total,
      status: DocStatus.UNPAID,
      due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      currency: quote.currency || Currency.AED
    };

    const { error: invError } = await supabase.from('invoices').insert([dbInvoice]);
    if (invError) throw new Error(handleSupabaseError(invError, 'convertQuoteToInvoice_Insert'));

    const { error: quoteError } = await supabase.from('quotations').update({ status: DocStatus.SENT }).eq('id', quoteId);
    if (quoteError) handleSupabaseError(quoteError, 'convertQuoteToInvoice_UpdateQuote');
    await fetchData();
  };

  const updateInvoiceStatus = async (id: string, status: DocStatus) => {
    const { error } = await supabase.from('invoices').update({ status }).eq('id', id);
    if (error) throw new Error(handleSupabaseError(error, 'updateInvoiceStatus'));
    await fetchData();
  };

  const addService = async (s: any) => {
    const dbService = {
      name: s.name,
      price: s.price,
      icon_name: s.iconName,
      description: s.description,
      category: s.category
    };
    const { error } = await supabase.from('services').insert([dbService]);
    if (error) throw new Error(handleSupabaseError(error, 'addService'));
    await fetchData();
  };

  const updateService = async (s: ServiceItem) => {
    const dbService = {
      name: s.name,
      price: s.price,
      icon_name: s.iconName,
      description: s.description,
      category: s.category
    };
    const { error } = await supabase.from('services').update(dbService).eq('id', s.id);
    if (error) throw new Error(handleSupabaseError(error, 'updateService'));
    await fetchData();
  };

  const normalizeToAED = (amount: number, docCurrency?: Currency) => {
    if (docCurrency === Currency.INR) return amount / AED_TO_INR_RATE;
    return amount;
  };

  const stats = {
    totalCustomers: customers.length,
    totalQuotations: quotations.length,
    totalInvoices: invoices.length,
    totalRevenue: invoices
      .filter(i => i.status === DocStatus.PAID || i.status === DocStatus.PARTIAL)
      .reduce((acc, curr) => acc + normalizeToAED(curr.total, curr.currency), 0),
    pendingPayments: invoices
      .filter(i => i.status === DocStatus.UNPAID || i.status === DocStatus.PARTIAL)
      .reduce((acc, curr) => acc + normalizeToAED(curr.total, curr.currency), 0),
  };

  return (
    <DataContext.Provider value={{
      customers,
      quotations,
      invoices,
      services,
      currency,
      setCurrency,
      convertValue,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      addQuotation,
      addInvoice,
      convertQuoteToInvoice,
      updateInvoiceStatus,
      addService,
      updateService,
      stats,
      isLoading
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};

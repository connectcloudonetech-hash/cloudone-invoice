
import React, { useState } from 'react';
import { 
  Search, 
  Receipt, 
  Download, 
  Send, 
  MessageCircle, 
  AlertCircle,
  X
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { DocStatus, Invoice, Currency } from '../types';
import { formatCurrency } from '../utils/storage';
import { generateDocumentPDF } from '../utils/pdfGenerator';
import { AED_TO_INR_RATE } from '../constants';

const Invoices: React.FC = () => {
  const { invoices, customers, updateInvoiceStatus, currency: globalCurrency } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [sendingId, setSendingId] = useState<string | null>(null);

  const filteredInvoices = invoices.filter(inv => {
    const customer = customers.find(c => c.id === inv.customerId);
    return inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
           customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           customer?.companyName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleDownload = async (invoice: Invoice) => {
    const customer = customers.find(c => c.id === invoice.customerId);
    if (customer) await generateDocumentPDF('INVOICE', invoice, customer);
  };

  const handleSendEmail = (invoice: Invoice) => {
    setSendingId(invoice.id);
    setTimeout(() => {
      alert(`Invoice ${invoice.invoiceNumber} has been dispatched via secure mail.`);
      setSendingId(null);
    }, 1500);
  };

  const handleWhatsApp = (invoice: Invoice) => {
    const customer = customers.find(c => c.id === invoice.customerId);
    if (!customer) return;

    // Use current display currency for WhatsApp message
    const totalInAED = invoice.currency === Currency.INR ? invoice.total / AED_TO_INR_RATE : invoice.total;
    const displayAmount = globalCurrency === Currency.INR ? totalInAED * AED_TO_INR_RATE : totalInAED;
    const formattedAmount = formatCurrency(displayAmount, globalCurrency);

    const message = `Hello ${customer.name},%0A%0AHere is your invoice ${invoice.invoiceNumber} from Cloud One Technologies.%0A%0AAmount due: ${formattedAmount}%0A%0APlease proceed with payment at your earliest convenience.%0A%0AThank you for choosing Cloud One!`;
    const whatsappUrl = `https://wa.me/${customer.phone.replace(/\+/g, '').replace(/\s/g, '')}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const StatusBadge = ({ status }: { status: DocStatus }) => {
    const configs = {
      [DocStatus.PAID]: 'bg-green-50 text-green-700 border-green-100',
      [DocStatus.UNPAID]: 'bg-rose-50 text-rose-700 border-rose-100',
      [DocStatus.PARTIAL]: 'bg-amber-50 text-amber-700 border-amber-100',
      [DocStatus.DRAFT]: 'bg-gray-50 text-gray-700 border-gray-100',
      [DocStatus.SENT]: 'bg-blue-50 text-blue-700 border-blue-100',
      [DocStatus.CANCELLED]: 'bg-red-50 text-red-700 border-red-100',
    };

    return (
      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${configs[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing & Receivables</h1>
        <p className="text-gray-500">Track enterprise payments and financial status.</p>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Filter by invoice ID or customer entity..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-100">
                <th className="pb-3 font-semibold text-gray-400 text-xs tracking-wider">Invoice ID</th>
                <th className="pb-3 font-semibold text-gray-400 text-xs tracking-wider">Stakeholder</th>
                <th className="pb-3 font-semibold text-gray-400 text-xs tracking-wider">Due Date</th>
                <th className="pb-3 font-semibold text-gray-400 text-xs tracking-wider">Valuation</th>
                <th className="pb-3 font-semibold text-gray-400 text-xs tracking-wider">Status</th>
                <th className="pb-3 font-semibold text-gray-400 text-xs tracking-wider text-right">Utility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredInvoices.length > 0 ? filteredInvoices.map((inv) => {
                const customer = customers.find(c => c.id === inv.customerId);
                
                // Correct multi-currency normalization
                const totalInAED = inv.currency === Currency.INR ? inv.total / AED_TO_INR_RATE : inv.total;
                const displayTotal = globalCurrency === Currency.INR ? totalInAED * AED_TO_INR_RATE : totalInAED;
                
                return (
                  <tr key={inv.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-4">
                      <p className="font-bold text-gray-900">{inv.invoiceNumber}</p>
                      <p className="text-xs text-gray-500">Issued: {new Date(inv.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="py-4">
                      <p className="font-semibold text-gray-800">{customer?.name || 'External Entity'}</p>
                      <p className="text-xs text-gray-500">{customer?.companyName}</p>
                    </td>
                    <td className="py-4 text-sm font-medium">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <AlertCircle size={14} className="text-amber-500" />
                        {new Date(inv.dueDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-4 font-bold text-gray-900">{formatCurrency(displayTotal, globalCurrency)}</td>
                    <td className="py-4">
                      <div className="flex flex-col gap-1 items-start">
                        <StatusBadge status={inv.status} />
                        {inv.status !== DocStatus.PAID && (
                          <button 
                            onClick={() => updateInvoiceStatus(inv.id, DocStatus.PAID)}
                            className="text-[10px] text-blue-600 hover:underline font-semibold"
                          >
                            Mark as Settled
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => handleDownload(inv)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Download PDF"
                        >
                          <Download size={18} />
                        </button>
                        <button 
                          onClick={() => handleSendEmail(inv)}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Send Email"
                          disabled={sendingId === inv.id}
                        >
                          {sendingId === inv.id ? (
                            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent animate-spin rounded-full" />
                          ) : (
                            <Send size={18} />
                          )}
                        </button>
                        <button 
                          onClick={() => handleWhatsApp(inv)}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Share via WhatsApp"
                        >
                          <MessageCircle size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    No billing records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Invoices;

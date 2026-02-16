
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Customer, LineItem, Quotation, Invoice, Currency, DocStatus } from '../types';
import { formatCurrencyValueOnly } from './storage';
import { APP_LOGO, BANK_DETAILS, PAYMENT_QR_URL } from '../constants';

/**
 * Helper to convert image URL to base64 for reliable PDF embedding
 */
const getBase64ImageFromURL = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.setAttribute('crossOrigin', 'anonymous');
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL('image/png');
      resolve(dataURL);
    };
    img.onerror = (error) => {
      reject(error);
    };
    img.src = url;
  });
};

/**
 * Re-usable header generator for each page
 */
const renderPDFHeader = async (doc: jsPDF, type: string, number: string, date: string, currency: string) => {
  doc.setFillColor(248, 250, 252); 
  doc.rect(0, 0, 210, 55, 'F');
  doc.setFillColor(43, 93, 138); 
  doc.rect(0, 0, 210, 2, 'F');

  try {
    const base64Logo = await getBase64ImageFromURL(APP_LOGO);
    doc.addImage(base64Logo, 'PNG', 14, 12, 45, 14);
  } catch (e) {
    doc.setFontSize(22);
    doc.setTextColor(43, 93, 138);
    doc.setFont('helvetica', 'bold');
    doc.text('CLOUD ONE', 14, 22);
  }

  doc.setFontSize(26);
  doc.setTextColor(43, 93, 138);
  doc.setFont('helvetica', 'bold');
  doc.text(type, 200, 25, { align: 'right' });

  doc.setFontSize(10);
  doc.setTextColor(37, 193, 235);
  doc.setFont('helvetica', 'bold');
  doc.text(`${number}`, 200, 32, { align: 'right' });

  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.setFont('helvetica', 'normal');
  doc.text(`DATE: ${date}`, 200, 42, { align: 'right' });
  doc.text(`CURRENCY: ${currency}`, 200, 47, { align: 'right' });
};

/**
 * Re-usable footer generator for each page
 */
const renderPDFFooter = (doc: jsPDF, pageNumber: number) => {
  const footerY = 285;
  doc.setFillColor(43, 93, 138);
  doc.rect(0, footerY, 210, 15, 'F');
  doc.setFontSize(8);
  doc.setTextColor(255);
  doc.setFont('helvetica', 'bold');
  doc.text(`Cloud One Technologies | www.cloudone.tech | Dubai, UAE | Page ${pageNumber}`, 105, footerY + 9, { align: 'center' });
};

export const generateDocumentPDF = async (
  type: 'QUOTATION' | 'INVOICE',
  data: Quotation | Invoice,
  customer: Customer
) => {
  const doc = new jsPDF();
  const num = type === 'QUOTATION' ? (data as Quotation).quoteNumber : (data as Invoice).invoiceNumber;
  const currency = data.currency || Currency.AED;
  const dateStr = new Date(data.createdAt).toLocaleDateString();

  // PAGE 1: Line Items & Totals
  await renderPDFHeader(doc, type, num, dateStr, currency);

  const billingY = 65;
  doc.setFontSize(10);
  doc.setTextColor(43, 93, 138);
  doc.setFont('helvetica', 'bold');
  doc.text('FROM', 14, billingY);
  
  doc.setFontSize(9);
  doc.setTextColor(0);
  doc.setFont('helvetica', 'bold');
  doc.text('Cloud One Technologies', 14, billingY + 7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80);
  doc.text('Office 304 Haji Nasser Building, Dubai', 14, billingY + 12);
  doc.text('Email: info@cloudone.tech', 14, billingY + 17);

  doc.setFontSize(10);
  doc.setTextColor(43, 93, 138);
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO', 110, billingY);
  
  doc.setFontSize(9);
  doc.setTextColor(0);
  doc.setFont('helvetica', 'bold');
  doc.text(customer.name, 110, billingY + 7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80);
  doc.text(customer.companyName || 'Private Client', 110, billingY + 12);
  doc.text(`Email: ${customer.email}`, 110, billingY + 17);
  if (customer.trn) {
    doc.text(`TRN: ${customer.trn}`, 110, billingY + 22);
  }

  // Formatting rows with Currency-Safe Strings (Values Only)
  const tableRows = data.items.map((item, index) => [
    { content: (index + 1).toString(), styles: { halign: 'center' } },
    { content: item.description ? `${item.name}\n${item.description}` : item.name },
    { content: item.quantity.toString(), styles: { halign: 'center' } },
    { content: formatCurrencyValueOnly(item.unitPrice, currency), styles: { halign: 'right' } },
    { content: formatCurrencyValueOnly(item.total, currency), styles: { halign: 'right' } }
  ]);

  autoTable(doc, {
    startY: billingY + 35,
    head: [[ '#', 'DESCRIPTION OF SERVICES', 'QTY', `UNIT RATE (${currency})`, `TOTAL VALUE (${currency})` ]],
    body: tableRows as any,
    theme: 'grid',
    headStyles: { 
      fillColor: [43, 93, 138], 
      textColor: [255, 255, 255],
      fontSize: 8, 
      fontStyle: 'bold', 
      halign: 'center'
    },
    styles: { 
      fontSize: 8, 
      cellPadding: 5, 
      lineColor: [230, 230, 230], 
      textColor: [50, 50, 50],
      font: 'helvetica'
    },
    columnStyles: { 
      0: { cellWidth: 10 }, 
      1: { cellWidth: 'auto' }, 
      2: { cellWidth: 15 }, 
      3: { cellWidth: 38 }, 
      4: { cellWidth: 38 } 
    },
    margin: { left: 14, right: 14 },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 150;

  const summaryX = 130;
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(`SUBTOTAL (${currency}):`, summaryX, finalY + 12);
  doc.setTextColor(0);
  doc.text(formatCurrencyValueOnly(data.subtotal, currency), 200, finalY + 12, { align: 'right' });
  
  doc.setTextColor(100);
  doc.text(`TAX (${data.vatRate}%):`, summaryX, finalY + 18);
  doc.setTextColor(0);
  doc.text(formatCurrencyValueOnly(data.vat, currency), 200, finalY + 18, { align: 'right' });

  if (data.discount > 0) {
    doc.setTextColor(100);
    doc.text(`DISCOUNT:`, summaryX, finalY + 24);
    doc.setTextColor(220, 38, 38);
    doc.text(`-${formatCurrencyValueOnly(data.discount, currency)}`, 200, finalY + 24, { align: 'right' });
  }

  doc.setFillColor(43, 93, 138);
  doc.rect(summaryX - 5, finalY + 28, 205 - summaryX + 5, 14, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255);
  doc.text(`TOTAL VALUE (${currency}):`, summaryX, finalY + 37);
  doc.text(formatCurrencyValueOnly(data.total, currency), 200, finalY + 37, { align: 'right' });

  renderPDFFooter(doc, 1);

  // PAGE 2: Settlement Instructions & Payment QR
  doc.addPage();
  await renderPDFHeader(doc, type, num, dateStr, currency);

  const paymentY = 70;
  doc.setFontSize(12);
  doc.setTextColor(43, 93, 138);
  doc.setFont('helvetica', 'bold');
  doc.text('SETTLEMENT INSTRUCTIONS & BANKING', 14, paymentY);
  
  doc.setFontSize(10);
  doc.setTextColor(80);
  doc.setFont('helvetica', 'normal');
  doc.text('Please utilize the following account details for all bank transfers:', 14, paymentY + 8);
  
  const bankDetailsX = 14;
  let currentY = paymentY + 20;
  
  const bankDetails = [
    ['Bank Name', BANK_DETAILS.bankName],
    ['Account Holder', BANK_DETAILS.accountName],
    ['IBAN Number', BANK_DETAILS.iban],
    ['Swift / BIC', BANK_DETAILS.swiftCode],
    ['Branch Location', BANK_DETAILS.branch]
  ];

  bankDetails.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(43, 93, 138);
    doc.text(`${label}:`, bankDetailsX, currentY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60);
    doc.text(value, bankDetailsX + 40, currentY);
    currentY += 8;
  });

  // Large QR Code Section
  const qrY = currentY + 15;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(120, qrY, 70, 85, 5, 5, 'F');
  
  try {
    const base64QR = await getBase64ImageFromURL(PAYMENT_QR_URL);
    doc.addImage(base64QR, 'PNG', 130, qrY + 10, 50, 50);
    doc.setFontSize(10);
    doc.setTextColor(43, 93, 138);
    doc.setFont('helvetica', 'bold');
    doc.text('SECURE PAYSCAN', 155, qrY + 70, { align: 'center' });
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('Scan for direct payment via GPay / Portal', 155, qrY + 75, { align: 'center' });
  } catch (e) {
    console.error('QR failed:', e);
  }

  // Terms & Conditions Block
  const termsY = qrY;
  doc.setFontSize(10);
  doc.setTextColor(43, 93, 138);
  doc.setFont('helvetica', 'bold');
  doc.text('TERMS OF SERVICE', 14, termsY);
  
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.setFont('helvetica', 'normal');
  const terms = [
    '1. Valid for 30 days from the date of issuance.',
    '2. 50% advance payment required to initiate project phases.',
    '3. Taxes are calculated based on regulatory standards.',
    '4. Late payments may incur administrative processing fees.',
    '5. This is an electronically verified document.'
  ];
  
  let ty = termsY + 8;
  terms.forEach(t => {
    doc.text(t, 14, ty);
    ty += 5;
  });

  renderPDFFooter(doc, 2);

  doc.save(`${type}_${num}.pdf`);
};

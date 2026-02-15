
export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF'
}

export enum Currency {
  AED = 'AED',
  INR = 'INR'
}

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  // Added missing createdAt property
  createdAt: string;
}

export interface User extends UserProfile {
  password: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  companyName: string;
  phone: string;
  email: string;
  address: string;
  trn: string;
  notes: string;
  createdAt: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  price: number;
  iconName?: string;
  description?: string;
  category?: string;
}

export interface LineItem {
  id: string;
  serviceId: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export enum DocStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
  UNPAID = 'UNPAID',
  PARTIAL = 'PARTIAL',
  CANCELLED = 'CANCELLED'
}

export interface Quotation {
  id: string;
  quoteNumber: string;
  customerId: string;
  items: LineItem[];
  subtotal: number;
  vat: number;
  vatRate: number;
  discount: number;
  total: number;
  status: DocStatus;
  createdAt: string;
  validUntil: string;
  currency?: Currency;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  quotationId?: string;
  customerId: string;
  items: LineItem[];
  subtotal: number;
  vat: number;
  vatRate: number;
  discount: number;
  total: number;
  status: DocStatus;
  createdAt: string;
  dueDate: string;
  currency?: Currency;
}
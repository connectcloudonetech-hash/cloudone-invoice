
import { ServiceItem } from './types';

// Provided official logo URL
export const APP_LOGO = "https://raw.githubusercontent.com/connectcloudonetech-hash/cloudoneuae/refs/heads/main/images/1.png";

// GPay / Payment QR Code
export const PAYMENT_QR_URL = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=GPay-CloudOneTechnologies-Payment";

// Exchange Rate: 1 AED = 22.50 INR (Placeholder rate)
export const AED_TO_INR_RATE = 22.50;

export const BANK_DETAILS = {
  bankName: "Emirates NBD",
  accountName: "Cloud One Technologies",
  accountNumber: "10189423567",
  iban: "AE22 0260 0000 0101 8942 3567",
  swiftCode: "EBILAEAD",
  branch: "Al Sabkha Branch, Dubai"
};

export const PRELOADED_SERVICES: ServiceItem[] = [
  { 
    id: '1', 
    name: 'Web Design', 
    price: 1500, 
    iconName: 'Monitor',
    category: 'Creative',
    description: 'Bespoke UI/UX design services focusing on conversion-optimized landing pages and brand-aligned digital interfaces.'
  },
  { 
    id: '2', 
    name: 'Web Development', 
    price: 2500, 
    iconName: 'Code',
    category: 'Development',
    description: 'Full-stack engineering solutions using modern frameworks. Includes SEO optimization and responsive architecture.'
  },
  { 
    id: '3', 
    name: 'Domain Registration', 
    price: 50, 
    iconName: 'Globe',
    category: 'Infrastructure',
    description: 'Secure domain acquisition and DNS management services with high-availability nameservers.'
  },
  { 
    id: '4', 
    name: 'Graphics Design', 
    price: 500, 
    iconName: 'Palette',
    category: 'Creative',
    description: 'Professional branding, logo creation, and marketing collateral design for digital and print media.'
  },
  { 
    id: '5', 
    name: 'App Development', 
    price: 5000, 
    iconName: 'Development',
    category: 'Engineering',
    description: 'Native and cross-platform mobile application development for iOS and Android ecosystems.'
  },
];

export const APP_THEME = {
  primary: 'brand-primary', 
  secondary: 'brand-secondary',
  accent: 'blue-600',
  bg: 'gray-50',
};

export const VAT_RATE = 0.05;

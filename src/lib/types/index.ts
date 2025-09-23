// types/index.ts
export type ActionState = {
  success: boolean;
  error: boolean;
  message?: string;
  data?: any
};

export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type InvoiceStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
export type FeeFrequency = 'ONE_TIME' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'CARD' | 'MOBILE_MONEY';
export type TransactionType = 'INCOME' | 'EXPENSE';
export type AdmissionStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'WAITLISTED';
export type FeeStatus = 'PENDING' | 'PAID' | 'WAIVED';

export const isValidPaymentMethod = (method: string): method is PaymentMethod => {
  return ['CASH', 'BANK_TRANSFER', 'CARD', 'MOBILE_MONEY'].includes(method);
};

export const toPaymentMethod = (method: string | undefined): PaymentMethod | undefined => {
  return method && isValidPaymentMethod(method) ? method : undefined;
};

export const paymentMethodDisplayNames: Record<PaymentMethod, string> = {
  CASH: 'Cash',
  BANK_TRANSFER: 'Bank Transfer',
  CARD: 'Credit Card',
  MOBILE_MONEY: 'Mobile Money'
};

export interface AdmissionBase {
  studentName: string;
  parentName: string;
  age: number;
  grade: string;
  status: AdmissionStatus;
  applicationDate: string;
  birthDate: string;
  bloodGroup: string;
  allergies: string[];
  specialNeeds: string;
  emergencyContact: string;
  medicalConditions?: string;
  previousSchool?: string;
  transportationNeeded?: boolean;
  dietaryRestrictions?: string;
  registrationFee?: number;
  feeStatus?: FeeStatus;
  paymentDate?: string;
  paymentMethod?: PaymentMethod;
  studentId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Admission extends AdmissionBase {
  id: string;
  studentId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const convertToAdmission = (data: any): Admission => {
  return {
    ...data,
    paymentMethod: toPaymentMethod(data.paymentMethod),
    status: data.status as AdmissionStatus,
    feeStatus: data.feeStatus as FeeStatus,
  };
};

export type AdmissionFormData = Omit<AdmissionBase, 'id' | 'studentId' | 'createdAt' | 'updatedAt'>;
export type AdmissionFeeUpdate = Partial<Pick<AdmissionBase, 'registrationFee' | 'feeStatus' | 'paymentDate' | 'paymentMethod'>>;


export interface Expense {
  id: string;
  description: string; 
  amount: number;
  category: string;
  date: string;
  vendor: string;
  paymentMethod: string;
  status: string;
  receiptUrl?: string; 
}


export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  imageUrl?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  author: string;
  createdAt: string;
  publishedAt?: string;
}

export interface PostCardData {
  id: string;
  title: string;
  imageUrl?: string;
  intro: string;
  description: string;
  createdAt: string;
  author: string;
  slug: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}
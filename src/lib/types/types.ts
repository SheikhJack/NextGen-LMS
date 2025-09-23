export type ActionState = {
  success: boolean;
  error: boolean;
  message?: string;
};

export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type InvoiceStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
export type FeeFrequency = 'ONE_TIME' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'CARD' | 'MOBILE_MONEY';
export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Admission {
    id: string;
    studentName: string;
    parentName: string;
    age: number;
    grade: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'WAITLISTED';
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
    feeStatus?: 'PENDING' | 'PAID' | 'WAIVED';
    paymentDate?: string;
    paymentMethod?: 'CASH' | 'BANK_TRANSFER' | 'CARD' | 'MOBILE_MONEY';
    studentId?: string;
    createdAt?: string;
    updatedAt?: string;
}

export type AdmissionFormData = Omit<Admission, 'id'>;


export type AdmissionStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'WAITLISTED';
export type FeeStatus = 'PENDING' | 'PAID' | 'WAIVED';

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
}

export interface Admission extends AdmissionBase {
  id: string;
  studentId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateAdmissionData = AdmissionBase;

export type UpdateAdmissionData = Partial<AdmissionBase> & { id: string };

export interface AdmissiontFeeUpdae {
  registrationFee?: number;
  feeStatus?: FeeStatus;
  paymentDate?: string;
  paymentMethod?: PaymentMethod;
}
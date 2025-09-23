import { PaymentMethod, TransactionStatus } from "@prisma/client";

export const mapToPaymentMethod = (method: string): PaymentMethod => {
  switch (method) {
    case "Cash": return PaymentMethod.CASH;
    case "Bank Transfer": return PaymentMethod.BANK_TRANSFER;
    case "Credit Card": return PaymentMethod.CARD;
    case "Mobile Money": return PaymentMethod.MOBILE_MONEY;
    case "Other": return PaymentMethod.OTHER;
    default: return PaymentMethod.CASH;
  }
};

export const mapToTransactionStatus = (status: string): TransactionStatus => {
  switch (status) {
    case "pending": return TransactionStatus.PENDING;
    case "completed": return TransactionStatus.COMPLETED;
    case "failed": return TransactionStatus.FAILED;
    case "refunded": return TransactionStatus.REFUNDED;
    default: return TransactionStatus.PENDING;
  }
};

export const mapFromPaymentMethod = (method: PaymentMethod): string => {
  switch (method) {
    case PaymentMethod.CASH: return "Cash";
    case PaymentMethod.BANK_TRANSFER: return "Bank Transfer";
    case PaymentMethod.CARD: return "Credit Card";
    case PaymentMethod.MOBILE_MONEY: return "Mobile Money";
    case PaymentMethod.OTHER: return "Other";
    default: return "Cash";
  }
};

export const mapFromTransactionStatus = (status: TransactionStatus): string => {
  switch (status) {
    case TransactionStatus.PENDING: return "pending";
    case TransactionStatus.COMPLETED: return "completed";
    case TransactionStatus.FAILED: return "failed";
    case TransactionStatus.REFUNDED: return "refunded";
    default: return "pending";
  }
};

export const getStatusDisplayText = (status: TransactionStatus): string => {
  switch (status) {
    case TransactionStatus.PENDING: return "Pending";
    case TransactionStatus.COMPLETED: return "Completed";
    case TransactionStatus.FAILED: return "Failed";
    case TransactionStatus.REFUNDED: return "Refunded";
    default: return "Pending";
  }
};
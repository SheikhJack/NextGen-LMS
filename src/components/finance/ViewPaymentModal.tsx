"use client";

import { Button } from "@/components/ui/button";
import { X, CheckCircle, XCircle, Clock, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Payment {
  id: string;
  invoiceNumber: string;
  studentName: string;
  amount: number;
  date: string;
  method: string;
  reference: string;
  status: string;
  description?: string;
}

interface ViewPaymentModalProps {
  payment: Payment;
  onClose: () => void;
  onUpdateStatus: (status: string) => void;
}

export function ViewPaymentModal({ payment, onClose, onUpdateStatus }: ViewPaymentModalProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'PENDING': return <Clock className="w-5 h-5 text-orange-600" />;
      case 'FAILED': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'REFUNDED': return <DollarSign className="w-5 h-5 text-blue-600" />;
      default: return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getMethodLabel = (method: string) => {
    switch (method) {
      case 'BANK_TRANSFER': return 'Bank Transfer';
      case 'CARD': return 'Credit/Debit Card';
      case 'CASH': return 'Cash';
      case 'MOBILE_MONEY': return 'Mobile Money';
      default: return method;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Payment Details</h2>
          <Button variant="ghost" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-6">
          {/* Payment Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Payment Information</h3>
              <p><strong>Reference:</strong> {payment.reference}</p>
              <p><strong>Date:</strong> {new Date(payment.date).toLocaleDateString()}</p>
              <p><strong>Method:</strong> {getMethodLabel(payment.method)}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Status</h3>
              <div className="flex items-center">
                {getStatusIcon(payment.status)}
                <span className="ml-2 font-medium capitalize">{payment.status.toLowerCase()}</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-green-600">
                {formatCurrency(payment.amount)}
              </p>
            </div>
          </div>

          {/* Student Information */}
          <div>
            <h3 className="font-semibold mb-2">Student Information</h3>
            <p><strong>Student:</strong> {payment.studentName}</p>
            {payment.invoiceNumber && (
              <p><strong>Invoice:</strong> {payment.invoiceNumber}</p>
            )}
          </div>

          {/* Description */}
          {payment.description && (
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-600">{payment.description}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            {payment.status === 'PENDING' && (
              <>
                <Button
                  onClick={() => onUpdateStatus('COMPLETED')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark as Completed
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onUpdateStatus('FAILED')}
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Mark as Failed
                </Button>
              </>
            )}
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
// components/ViewInvoiceModal.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { X, CreditCard, CheckCircle } from "lucide-react";

interface InvoiceItem {
  id: string;
  description: string;
  amount: number;
  quantity: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  studentName: string;
  grade: number;
  className: string;
  totalAmount: number;
  dueDate: string;
  issueDate: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  items: InvoiceItem[];
  paidAmount: number;
}

interface ViewInvoiceModalProps {
  invoice: Invoice;
  onClose: () => void;
  onRecordPayment: (invoiceId: string, amount: number, method: string, reference: string) => void;
}

export function ViewInvoiceModal({ invoice, onClose, onRecordPayment }: ViewInvoiceModalProps) {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: invoice.totalAmount - invoice.paidAmount,
    method: 'CASH',
    reference: ''
  });

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRecordPayment(invoice.id, paymentData.amount, paymentData.method, paymentData.reference);
  };

  const amountDue = invoice.totalAmount - invoice.paidAmount;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Invoice Details - {invoice.invoiceNumber}</h2>
          <Button variant="ghost" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="font-semibold mb-2">Student Information</h3>
            <p><strong>Name:</strong> {invoice.studentName}</p>
            <p><strong>Class:</strong> Grade {invoice.grade} - {invoice.className}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Invoice Information</h3>
            <p><strong>Issue Date:</strong> {new Date(invoice.issueDate).toLocaleDateString()}</p>
            <p><strong>Due Date:</strong> {new Date(invoice.dueDate).toLocaleDateString()}</p>
            <p><strong>Status:</strong> 
              <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                invoice.status === 'PAID' ? 'bg-green-100 text-green-800' :
                invoice.status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                'bg-orange-100 text-orange-800'
              }`}>
                {invoice.status}
              </span>
            </p>
            <p><strong>Amount Due:</strong> {formatCurrency(amountDue)}</p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-3">Invoice Items</h3>
          <div className="border rounded">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-3">Description</th>
                  <th className="text-left p-3">Quantity</th>
                  <th className="text-left p-3">Unit Price</th>
                  <th className="text-left p-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="p-3">{item.description}</td>
                    <td className="p-3">{item.quantity}</td>
                    <td className="p-3">{formatCurrency(item.amount)}</td>
                    <td className="p-3 font-semibold">{formatCurrency(item.amount * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50">
                  <td colSpan={3} className="p-3 text-right font-semibold">Total Amount:</td>
                  <td className="p-3 font-semibold">{formatCurrency(invoice.totalAmount)}</td>
                </tr>
                {invoice.paidAmount > 0 && (
                  <>
                    <tr className="bg-gray-50">
                      <td colSpan={3} className="p-3 text-right font-semibold">Amount Paid:</td>
                      <td className="p-3 font-semibold text-green-600">
                        {formatCurrency(invoice.paidAmount)}
                      </td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td colSpan={3} className="p-3 text-right font-semibold">Balance Due:</td>
                      <td className="p-3 font-semibold">
                        {formatCurrency(amountDue)}
                      </td>
                    </tr>
                  </>
                )}
              </tfoot>
            </table>
          </div>
        </div>

        {amountDue > 0 && !showPaymentForm && (
          <div className="flex justify-end mb-6">
            <Button onClick={() => setShowPaymentForm(true)}>
              <CreditCard className="w-4 h-4 mr-2" />
              Record Payment
            </Button>
          </div>
        )}

        {showPaymentForm && (
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">Record Payment</h3>
            <form onSubmit={handlePaymentSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Amount *</label>
                <Input
                  type="number"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData(prev => ({ 
                    ...prev, 
                    amount: Math.min(parseFloat(e.target.value) || 0, amountDue)
                  }))}
                  step="0.01"
                  max={amountDue}
                  required
                />
                <p className="text-sm text-gray-600 mt-1">
                  Maximum: {formatCurrency(amountDue)}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Payment Method *</label>
                <select
                  value={paymentData.method}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, method: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="CASH">Cash</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CARD">Card</option>
                  <option value="MOBILE_MONEY">Mobile Money</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Reference Number</label>
                <Input
                  placeholder="Payment reference (optional)"
                  value={paymentData.reference}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, reference: e.target.value }))}
                />
              </div>
              
              <div className="md:col-span-2 flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPaymentForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Record Payment
                </Button>
              </div>
            </form>
          </div>
        )}

        {invoice.status === 'PAID' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-green-800 font-medium">This invoice has been fully paid</span>
            </div>
            <p className="text-green-700 text-sm mt-1">
              Total paid: {formatCurrency(invoice.paidAmount)} on {new Date().toLocaleDateString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
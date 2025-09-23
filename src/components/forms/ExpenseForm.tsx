// components/forms/ExpenseForm.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { PaymentMethod, TransactionStatus } from "@prisma/client";
import { 
  mapToPaymentMethod, 
  mapToTransactionStatus, 
  mapFromPaymentMethod, 
  mapFromTransactionStatus 
} from "@/lib/paymentMethodMapper";

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  vendor: string;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  receiptUrl?: string;
}

interface ExpenseFormProps {
  expense?: Expense | any;
  onSubmit: (data: Omit<Expense, 'id'>) => void;
  onClose: () => void;
}

const categories = ["Supplies", "Utilities", "Training", "Equipment", "Salaries", "Maintenance", "Other"];
const paymentMethods = ["Cash", "Bank Transfer", "Credit Card", "Mobile Money", "Other"];
const statusOptions = ["pending", "completed"];

export function ExpenseForm({ expense, onSubmit, onClose }: ExpenseFormProps) {
  const [formData, setFormData] = useState({
    description: expense?.description || "",
    amount: expense?.amount.toString() || "",
    category: expense?.category || "",
    date: expense?.date || new Date().toISOString().split('T')[0],
    vendor: expense?.vendor || "",
    paymentMethod: expense?.paymentMethod ? mapFromPaymentMethod(expense.paymentMethod) : "Cash",
    status: expense?.status ? mapFromTransactionStatus(expense.status) : "pending",
    receiptUrl: expense?.receiptUrl || ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Valid amount is required";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.date) {
      newErrors.date = "Date is required";
    }

    if (!formData.vendor.trim()) {
      newErrors.vendor = "Vendor is required";
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = "Payment method is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    onSubmit({
      description: formData.description,
      amount: parseFloat(formData.amount),
      category: formData.category,
      date: formData.date,
      vendor: formData.vendor,
      paymentMethod: mapToPaymentMethod(formData.paymentMethod),
      status: mapToTransactionStatus(formData.status),
      receiptUrl: formData.receiptUrl || undefined
    });

    toast.success(expense ? "Expense updated successfully" : "Expense created successfully");
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {expense ? "Edit Expense" : "Add New Expense"}
          </h2>
          <Button variant="ghost" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Description *</label>
              <Input
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Enter expense description"
                className={errors.description ? "border-red-500" : ""}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Amount *</label>
              <Input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
                placeholder="0.00"
                className={errors.amount ? "border-red-500" : ""}
              />
              {errors.amount && (
                <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => handleChange("category", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${errors.category ? "border-red-500" : ""}`}
              >
                <option value="">Select category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">{errors.category}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Date *</label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange("date", e.target.value)}
                className={errors.date ? "border-red-500" : ""}
              />
              {errors.date && (
                <p className="text-red-500 text-sm mt-1">{errors.date}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Vendor *</label>
              <Input
                value={formData.vendor}
                onChange={(e) => handleChange("vendor", e.target.value)}
                placeholder="Enter vendor name"
                className={errors.vendor ? "border-red-500" : ""}
              />
              {errors.vendor && (
                <p className="text-red-500 text-sm mt-1">{errors.vendor}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Payment Method *</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => handleChange("paymentMethod", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${errors.paymentMethod ? "border-red-500" : ""}`}
              >
                <option value="">Select payment method</option>
                {paymentMethods.map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
              {errors.paymentMethod && (
                <p className="text-red-500 text-sm mt-1">{errors.paymentMethod}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => handleChange("status", e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Receipt URL (Optional)</label>
              <Input
                type="url"
                value={formData.receiptUrl}
                onChange={(e) => handleChange("receiptUrl", e.target.value)}
                placeholder="https://example.com/receipt.pdf"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {expense ? "Update Expense" : "Create Expense"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
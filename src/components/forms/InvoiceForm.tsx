// components/forms/InvoiceForm.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getStudents } from "@/lib/actions";
import { toast } from "sonner";

interface InvoiceItem {
  id: string;
  description: string;
  amount: number;
  quantity: number;
}

interface Student {
  id: string;
  name: string;
  surname: string;
  grade: { level: number };
  class: { name: string };
}

interface InvoiceFormProps {
  onSubmit: (data: any) => void;
  onClose: () => void;
}

export function InvoiceForm({ onSubmit, onClose }: InvoiceFormProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    studentId: "",
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    issueDate: new Date().toISOString().split('T')[0],
    items: [] as InvoiceItem[]
  });

  const [currentItem, setCurrentItem] = useState({
    description: "",
    amount: "",
    quantity: "1"
  });

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const loadingToast = toast.loading("Loading students...");
        const studentsData = await getStudents();
        setStudents(studentsData);
        toast.success("Students loaded successfully", { id: loadingToast });
      } catch (error) {
        console.error("Failed to fetch students:", error);
        toast.error("Failed to load students");
        // Fallback to empty array if API fails
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const selectedStudent = students.find(s => s.id === formData.studentId);

  const addItem = () => {
    if (!currentItem.description || !currentItem.amount) {
      toast.error("Please enter both description and amount for the item");
      return;
    }

    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: currentItem.description,
      amount: parseFloat(currentItem.amount),
      quantity: parseInt(currentItem.quantity) || 1
    };

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));

    setCurrentItem({ description: "", amount: "", quantity: "1" });
    toast.success("Item added to invoice");
  };

  const removeItem = (id: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
    toast.info("Item removed from invoice");
  };

  const totalAmount = formData.items.reduce((sum, item) => sum + (item.amount * item.quantity), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId) {
      toast.error("Please select a student");
      return;
    }
    
    if (formData.items.length === 0) {
      toast.error("Please add at least one item to the invoice");
      return;
    }

    onSubmit({
      studentId: formData.studentId,
      items: formData.items,
      dueDate: formData.dueDate,
      issueDate: formData.issueDate,
      totalAmount
    });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-4xl">
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Create New Invoice</h2>
          <Button variant="ghost" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Student Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Student *</label>
              <select
                value={formData.studentId}
                onChange={(e) => setFormData(prev => ({ ...prev, studentId: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md"
                required
              >
                <option value="">Select student</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.name} {student.surname} - Grade {student.grade.level} {student.class.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Issue Date *</label>
                <Input
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, issueDate: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Due Date *</label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  required
                />
              </div>
            </div>
          </div>

          {/* Invoice Items */}
          <div>
            <label className="block text-sm font-medium mb-2">Invoice Items *</label>
            <div className="space-y-3">
              {formData.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-3 border rounded">
                  <div className="flex-1">
                    <p className="font-medium">{item.description}</p>
                    <p className="text-sm text-gray-600">
                      {item.quantity} × {formatCurrency(item.amount)} = {formatCurrency(item.amount * item.quantity)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 border rounded">
                <Input
                  placeholder="Description"
                  value={currentItem.description}
                  onChange={(e) => setCurrentItem(prev => ({ ...prev, description: e.target.value }))}
                />
                <Input
                  type="number"
                  placeholder="Amount"
                  value={currentItem.amount}
                  onChange={(e) => setCurrentItem(prev => ({ ...prev, amount: e.target.value }))}
                  step="0.01"
                />
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Qty"
                    value={currentItem.quantity}
                    onChange={(e) => setCurrentItem(prev => ({ ...prev, quantity: e.target.value }))}
                    min="1"
                    className="w-20"
                  />
                  <Button type="button" onClick={addItem}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Total */}
          {formData.items.length > 0 && (
            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total Amount:</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={formData.items.length === 0 || !formData.studentId}>
              Create Invoice
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
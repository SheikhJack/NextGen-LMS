// app/finance/expenses/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Eye
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { ExpenseForm } from "@/components/forms/ExpenseForm";
import { createExpense, getExpenses, updateExpense, deleteExpense, getExpenseStats } from "@/lib/actions";
import { toast } from "sonner";
import { PaymentMethod, TransactionStatus } from "@prisma/client";
import { mapFromPaymentMethod, mapFromTransactionStatus, getStatusDisplayText } from "@/lib/paymentMethodMapper";
import { Expense } from "@/lib/types";





export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalExpenses: 0,
    completedExpenses: 0,
    pendingExpenses: 0
  });

  useEffect(() => {
    fetchExpenses();
    fetchStats();
  }, []);

  useEffect(() => {
    filterExpenses();
  }, [searchTerm, selectedCategory, expenses]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const expenseData = await getExpenses();
      setExpenses(expenseData);
      setFilteredExpenses(expenseData);
    } catch (error) {
      toast.error("Failed to load expenses");
      console.error("Error fetching expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await getExpenseStats();
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching expense stats:", error);
    }
  };

  const filterExpenses = () => {
    let filtered = expenses;

    if (searchTerm) {
      filtered = filtered.filter(expense =>
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(expense => expense.category === selectedCategory);
    }

    setFilteredExpenses(filtered);
  };



  const categories = ["all", "Supplies", "Utilities", "Training", "Equipment", "Salaries", "Maintenance", "Other"];

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      const loadingToast = toast.loading("Deleting expense...");
      const result = await deleteExpense(id);

      if (result.success) {
        toast.success("Expense deleted successfully", { id: loadingToast });
        await fetchExpenses();
        await fetchStats();
      } else {
        toast.error("Failed to delete expense", { id: loadingToast });
      }
    }
  };

  const handleFormSubmit = async (expenseData: Omit<Expense, 'id'>) => {
    const formData = new FormData();

    if (editingExpense) {
      formData.append('id', editingExpense.id);
    }

    Object.entries(expenseData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    const loadingToast = toast.loading(editingExpense ? "Updating expense..." : "Creating expense...");

    try {
      let result;
      if (editingExpense) {
        result = await updateExpense({ success: false, error: false, message: '' }, formData);
      } else {
        result = await createExpense({ success: false, error: false, message: '' }, formData);
      }

      if (result.success) {
        toast.success(result.message, { id: loadingToast });
        await fetchExpenses();
        await fetchStats();
      } else {
        toast.error(result.message, { id: loadingToast });
      }
    } catch (error) {
      toast.error("An error occurred", { id: loadingToast });
    } finally {
      setIsFormOpen(false);
      setEditingExpense(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Expense Management</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Expense
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalExpenses)}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <div className="w-6 h-6 bg-blue-500 rounded-full" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.completedExpenses)}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <div className="w-6 h-6 bg-green-500 rounded-full" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(stats.pendingExpenses)}</p>
              </div>
              <div className="p-3 rounded-full bg-orange-100">
                <div className="w-6 h-6 bg-orange-500 rounded-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </option>
              ))}
            </select>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Expense Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Description</th>
                  <th className="text-left p-4">Category</th>
                  <th className="text-left p-4">Vendor</th>
                  <th className="text-left p-4">Amount</th>
                  <th className="text-left p-4">Date</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">{expense.description}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {expense.category}
                      </span>
                    </td>
                    <td className="p-4">{expense.vendor}</td>
                    <td className="p-4 font-semibold">{formatCurrency(expense.amount)}</td>
                    <td className="p-4">{new Date(expense.date).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${expense.status === TransactionStatus.COMPLETED
                          ? 'bg-green-100 text-green-800'
                          : expense.status === TransactionStatus.PENDING
                            ? 'bg-orange-100 text-orange-800'
                            : expense.status === TransactionStatus.FAILED
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}>
                        {expense.status.toLowerCase()}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(expense)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(expense.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        {expense.receiptUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(expense.receiptUrl!, '_blank')}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Expense Form Modal */}
      {isFormOpen && (
        <ExpenseForm
          expense={editingExpense}
          onSubmit={handleFormSubmit}
          onClose={() => {
            setIsFormOpen(false);
            setEditingExpense(null);
          }}
        />
      )}
    </div>
  );
}
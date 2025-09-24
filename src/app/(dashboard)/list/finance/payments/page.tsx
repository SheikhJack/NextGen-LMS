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
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  CreditCard,
  Banknote,
  Smartphone
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { PaymentForm } from "@/components/forms/PaymentForm";
import { ViewPaymentModal } from "@/components/finance/ViewPaymentModal";
import { createDirectPayment, exportPayments, getPayments, getPaymentStatistics, getStudents } from "@/lib/actions";
import { recordPayment, getInvoices, updateInvoiceStatus, getFinancialOverview } from "@/lib/actions";
import { toast } from "sonner";
import { ActionState } from "@/lib/types";

interface Payment {
  id: string;
  invoiceNumber: string;
  studentName: string;
  studentId: string;
  amount: number;
  date: string;
  method: 'CASH' | 'BANK_TRANSFER' | 'CARD' | 'MOBILE_MONEY' | 'OTHER';
  reference: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'OTHER';
  description?: string;
  invoiceId?: string;
}

interface TotalIncome {
  total: number;
  completed: number;
  pending: number;
  failed: number;
  totalAmount: number;
  completedAmount: number;
  pendingAmount: number;
}

interface Student {
  id: string;
  name: string;
  surname: string;
  grade: { level: number };
  class: { name: string };
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalIncome, setTotalIncome] = useState<TotalIncome>({
    total: 0,
    completed: 0,
    pending: 0,
    failed: 0,
    totalAmount: 0,
    completedAmount: 0,
    pendingAmount: 0
  });
  const [students, setStudents] = useState<Student[]>([]);

  const convertServerPaymentToClient = (serverPayment: any): Payment => {
    return {
      id: serverPayment.id,
      invoiceNumber: serverPayment.invoiceNumber,
      studentName: serverPayment.studentName,
      studentId: serverPayment.studentId,
      amount: serverPayment.amount,
      date: serverPayment.date,
      method: serverPayment.method as Payment['method'],
      reference: serverPayment.reference,
      status: serverPayment.status as Payment['status'],
      description: serverPayment.description,
      invoiceId: serverPayment.invoiceId
    };
  };


  const fetchData = async () => {
    try {
      setLoading(true);

      const paymentsData = await getPayments();

      const convertedPayments = paymentsData.map(convertServerPaymentToClient);

      const studentsData = await getStudents();

      const incomeStats = calculateTotalIncomeLocal(convertedPayments);

      setPayments(convertedPayments);
      setFilteredPayments(convertedPayments);
      setTotalIncome(incomeStats);
      setStudents(studentsData);

      toast.success("Data loaded successfully");

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error("Failed to load data");

      setPayments(mockPayments);
      setFilteredPayments(mockPayments);
      setTotalIncome(calculateTotalIncomeLocal(mockPayments));
      setStudents(mockStudents);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalIncomeLocal = (payments: Payment[]): TotalIncome => {
    const completedPayments = payments.filter(p => p.status === 'COMPLETED');
    const pendingPayments = payments.filter(p => p.status === 'PENDING');
    const failedPayments = payments.filter(p => p.status === 'FAILED' || p.status === 'REFUNDED' || p.status === 'OTHER');

    return {
      total: payments.length,
      completed: completedPayments.length,
      pending: pendingPayments.length,
      failed: failedPayments.length,
      totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
      completedAmount: completedPayments.reduce((sum, p) => sum + p.amount, 0),
      pendingAmount: pendingPayments.reduce((sum, p) => sum + p.amount, 0)
    };
  };



  const updatePaymentStatus = async (paymentId: string, newStatus: Payment['status']) => {
    try {
      const invoiceStatus = newStatus === 'COMPLETED' ? 'PAID' :
        newStatus === 'PENDING' ? 'PENDING' :
          newStatus === 'FAILED' ? 'CANCELLED' : 'CANCELLED';

      const toastId = toast.loading("Updating payment status...");

      const result = await updateInvoiceStatus(paymentId, invoiceStatus);

      if (result && 'success' in result) {
        if (result.success) {
          toast.success("Payment status updated successfully", { id: toastId });
          fetchData();
        } else {
          toast.error(result.message || "Failed to update payment status", { id: toastId });
        }
      } else {
        toast.error("Unexpected response from server", { id: toastId });
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error("Failed to update payment status");
      setPayments(payments.map(payment =>
        payment.id === paymentId
          ? { ...payment, status: newStatus }
          : payment
      ));
    }
  };



  const addPayment = async (paymentData: Omit<Payment, 'id'>) => {
    try {
      const toastId = toast.loading("Recording payment...");

      let result: ActionState | void;

      if (paymentData.invoiceId) {
        result = await recordPayment(
          paymentData.invoiceId,
          paymentData.amount,
          paymentData.method,
          paymentData.reference
        );
      } else {
        result = await createDirectPayment(
          paymentData.studentId,
          paymentData.amount,
          paymentData.method,
          paymentData.reference,
          paymentData.description
        );
      }

      if (result && 'success' in result) {
        if (result.success) {
          toast.success("Payment recorded successfully", { id: toastId });
          fetchData();
          setIsFormOpen(false);
        } else {
          toast.error(result.message || "Failed to record payment", { id: toastId });
        }
      } else {
        toast.error("Unexpected response from server", { id: toastId });
      }
    } catch (error) {
      console.error('Error adding payment:', error);
      toast.error("Failed to record payment");

      const newPayment: Payment = {
        ...paymentData,
        id: Date.now().toString(),
        status: 'COMPLETED'
      };
      setPayments([...payments, newPayment]);
      setIsFormOpen(false);
    }
  };



  useEffect(() => {
    fetchData();
  }, [fetchData]);


  const filterPayments = () => {
    let filtered = payments;

    if (searchTerm) {
      filtered = filtered.filter(payment =>
        payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.reference.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }

    if (methodFilter !== "all") {
      filtered = filtered.filter(payment => payment.method === methodFilter);
    }

    setFilteredPayments(filtered);
  };


  useEffect(() => {
    filterPayments();
  }, [searchTerm, statusFilter, methodFilter, payments, filterPayments]);

  const getStatusIcon = (status: string = 'PENDING') => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'PENDING': return <Clock className="w-4 h-4 text-orange-600" />;
      case 'FAILED': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'REFUNDED': return <DollarSign className="w-4 h-4 text-blue-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string = 'PENDING') => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-orange-100 text-orange-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      case 'REFUNDED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'BANK_TRANSFER': return <CreditCard className="w-4 h-4" />;
      case 'CARD': return <CreditCard className="w-4 h-4" />;
      case 'CASH': return <Banknote className="w-4 h-4" />;
      case 'MOBILE_MONEY': return <Smartphone className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'BANK_TRANSFER': return 'bg-blue-100 text-blue-800';
      case 'CARD': return 'bg-purple-100 text-purple-800';
      case 'CASH': return 'bg-green-100 text-green-800';
      case 'MOBILE_MONEY': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsViewModalOpen(true);
  };


  const handleUpdateStatus = async (paymentId: string, newStatus: Payment['status']) => {
    try {
      const toastId = toast.loading("Updating payment status...");

      const result = await updatePaymentStatus(paymentId, newStatus) as unknown as { success: boolean; message: string };

      if (result.success) {
        toast.success("Payment status updated successfully", { id: toastId });
        fetchData();
      } else {
        toast.error(result.message || "Failed to update payment status", { id: toastId });
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error("Failed to update payment status");
    }
  }

  const handleFormSubmit = async (paymentData: Omit<Payment, 'id'>) => {
    await addPayment(paymentData);
  };

  const handleExportClick = () => {
    handleExport('csv');
  };



  const handleExport = async (format: 'csv' | 'json' = 'csv') => {
    try {
      const toastId = toast.loading(`Exporting payments as ${format.toUpperCase()}...`);

      let exportData: string;

      try {
        exportData = await exportPayments(format);
      } catch (serverError) {
        console.error('Server export failed, using client-side export:', serverError);

        exportData = exportPaymentsClientSide(format, filteredPayments);
      }

      const blob = new Blob([exportData], {
        type: format === 'csv' ? 'text/csv' : 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payments-export-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`Payments exported successfully as ${format.toUpperCase()}`, { id: toastId });
    } catch (error) {
      console.error('Error exporting payments:', error);
      toast.error("Failed to export payments");
    }
  };


  const exportPaymentsClientSide = (format: 'csv' | 'json', payments: Payment[]): string => {
    if (format === 'json') {
      return JSON.stringify(payments, null, 2);
    }

    const headers = ['Invoice #', 'Student', 'Amount', 'Date', 'Method', 'Reference', 'Status', 'Description'];
    const rows = payments.map(payment => [
      payment.invoiceNumber,
      payment.studentName,
      payment.amount.toString(),
      new Date(payment.date).toLocaleDateString(),
      payment.method,
      payment.reference,
      payment.status,
      payment.description || ''
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field?.toString().replace(/"/g, '""')}"`).join(','))
      .join('\n');

    return csvContent;
  };


  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
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
        <h1 className="text-2xl font-bold">Payment Management</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Record Payment
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Payments</p>
                <p className="text-2xl font-bold">{totalIncome.total}</p>
                <p className="text-sm text-gray-600">{formatCurrency(totalIncome.totalAmount)}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{totalIncome.completed}</p>
                <p className="text-sm text-gray-600">{formatCurrency(totalIncome.completedAmount)}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-orange-600">{totalIncome.pending}</p>
                <p className="text-sm text-gray-600">{formatCurrency(totalIncome.pendingAmount)}</p>
              </div>
              <div className="p-3 rounded-full bg-orange-100">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">{totalIncome.failed}</p>
              </div>
              <div className="p-3 rounded-full bg-red-100">
                <XCircle className="w-6 h-6 text-red-600" />
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
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
            </select>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Methods</option>
              <option value="CASH">Cash</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="CARD">Card</option>
              <option value="MOBILE_MONEY">Mobile Money</option>
            </select>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
            <Button variant="outline" onClick={handleExportClick}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Invoice #</th>
                  <th className="text-left p-4">Student</th>
                  <th className="text-left p-4">Amount</th>
                  <th className="text-left p-4">Date</th>
                  <th className="text-left p-4">Method</th>
                  <th className="text-left p-4">Reference</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-mono">{payment.invoiceNumber}</td>
                    <td className="p-4">{payment.studentName}</td>
                    <td className="p-4 font-semibold">{formatCurrency(payment.amount)}</td>
                    <td className="p-4">{new Date(payment.date).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs flex items-center w-fit ${getStatusColor(payment.status)}`}>
                        {getStatusIcon(payment.status)}
                        <span className="ml-1">{payment.status}</span>
                      </span>
                    </td>
                    <td className="p-4 font-mono text-sm">{payment.reference}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs flex items-center w-fit ${getStatusColor(payment.status)}`}>
                        {getStatusIcon(payment.status)}
                        <span className="ml-1">{payment.status}</span>
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewPayment(payment)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {payment.status === 'PENDING' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleUpdateStatus(payment.id, 'COMPLETED')}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateStatus(payment.id, 'FAILED')}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </>
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

      {/* Modals */}
      {isFormOpen && (
        <PaymentForm
          onSubmit={handleFormSubmit}
          onClose={() => setIsFormOpen(false)}
          students={students}
        />
      )}

      {isViewModalOpen && selectedPayment && (
        <ViewPaymentModal
          payment={selectedPayment}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedPayment(null);
          }}
          onUpdateStatus={(newStatus: any) => {
            handleUpdateStatus(selectedPayment.id, newStatus);
            setIsViewModalOpen(false);
            setSelectedPayment(null);
          }}
        />
      )}
    </div>
  );
}

// Mock data for fallback
const mockPayments: Payment[] = [
  {
    id: "1",
    invoiceNumber: "INV-2024-001",
    studentName: "John Doe",
    studentId: "std-001",
    amount: 6500,
    date: "2024-03-15",
    method: "BANK_TRANSFER",
    reference: "REF-001",
    status: "COMPLETED",
    description: "Q1 2024 Tuition Fee Payment"
  },
  {
    id: "2",
    invoiceNumber: "INV-2024-002",
    studentName: "Jane Smith",
    studentId: "std-002",
    amount: 5000,
    date: "2024-03-10",
    method: "CARD",
    reference: "REF-002",
    status: "COMPLETED",
    description: "Tuition Fee Payment"
  },
  {
    id: "3",
    invoiceNumber: "INV-2024-003",
    studentName: "Mike Johnson",
    studentId: "std-003",
    amount: 1500,
    date: "2024-03-05",
    method: "MOBILE_MONEY",
    reference: "REF-003",
    status: "PENDING",
    description: "Book Fee Payment"
  },
  {
    id: "4",
    invoiceNumber: "INV-2024-004",
    studentName: "Sarah Wilson",
    studentId: "std-004",
    amount: 5000,
    date: "2024-02-28",
    method: "CASH",
    reference: "REF-004",
    status: "FAILED",
    description: "Tuition Fee Payment - Declined"
  }
];

const mockStudents: Student[] = [
  {
    id: "std-001",
    name: "John",
    surname: "Doe",
    grade: { level: 5 },
    class: { name: "5A" }
  },
  {
    id: "std-002",
    name: "Jane",
    surname: "Smith",
    grade: { level: 6 },
    class: { name: "6B" }
  },
  {
    id: "std-003",
    name: "Mike",
    surname: "Johnson",
    grade: { level: 4 },
    class: { name: "4C" }
  },
  {
    id: "std-004",
    name: "Sarah",
    surname: "Wilson",
    grade: { level: 5 },
    class: { name: "5A" }
  }
];
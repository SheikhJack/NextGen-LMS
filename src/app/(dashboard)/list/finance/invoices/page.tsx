// app/finance/invoices/page.tsx
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
  Printer,
  Mail,
  FileText,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { InvoiceForm } from "@/components/forms/InvoiceForm";
import { ViewInvoiceModal } from "@/components/ViewInvoiceModal";
import { createInvoice, getInvoices, recordPayment } from "@/lib/actions";
import { toast } from "sonner";

interface Invoice {
  id: string;
  invoiceNumber: string;
  studentName: string;
  studentId: string;
  grade: number;
  className: string;
  totalAmount: number;
  dueDate: string;
  issueDate: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  items: InvoiceItem[];
  paidAmount: number;
}

interface InvoiceItem {
  id: string;
  description: string;
  amount: number;
  quantity: number;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    filterInvoices();
  }, [searchTerm, statusFilter, invoices]);

 const fetchInvoices = async () => {
  try {
    setLoading(true);
    const invoiceData = await getInvoices();
    
    // Calculate status based on due date and payments
    const today = new Date();
    const processedInvoices: Invoice[] = invoiceData.map(invoice => {
      const dueDate = new Date(invoice.dueDate);
      const isOverdue = dueDate < today && invoice.paidAmount < invoice.totalAmount;
      const isPaid = invoice.paidAmount >= invoice.totalAmount;
      
      // If the invoice is already marked as CANCELLED, keep it as is
      if (invoice.status === 'CANCELLED') {
        return invoice;
      }
      
      return {
        ...invoice,
        status: isPaid ? 'PAID' : isOverdue ? 'OVERDUE' : 'PENDING'
      };
    });
    
    setInvoices(processedInvoices);
    setFilteredInvoices(processedInvoices);
  } catch (error) {
    toast.error("Failed to load invoices");
    console.error("Error fetching invoices:", error);
  } finally {
    setLoading(false);
  }
};


  const filterInvoices = () => {
    let filtered = invoices;

    if (searchTerm) {
      filtered = filtered.filter(invoice =>
        invoice.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.className.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(invoice => invoice.status === statusFilter);
    }

    setFilteredInvoices(filtered);
  };

  const statusStats = {
    total: invoices.length,
    pending: invoices.filter(i => i.status === 'PENDING').length,
    paid: invoices.filter(i => i.status === 'PAID').length,
    overdue: invoices.filter(i => i.status === 'OVERDUE').length,
    totalAmount: invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
    paidAmount: invoices.filter(i => i.status === 'PAID').reduce((sum, inv) => sum + inv.totalAmount, 0),
    pendingAmount: invoices.filter(i => i.status === 'PENDING').reduce((sum, inv) => sum + inv.totalAmount, 0),
    overdueAmount: invoices.filter(i => i.status === 'OVERDUE').reduce((sum, inv) => sum + inv.totalAmount, 0)
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'PENDING': return <Clock className="w-4 h-4 text-orange-600" />;
      case 'OVERDUE': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-orange-100 text-orange-800';
      case 'OVERDUE': return 'bg-red-100 text-red-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsViewModalOpen(true);
  };

  const handleGeneratePDF = (invoice: Invoice) => {
    // PDF generation logic would go here
    console.log("Generating PDF for:", invoice.invoiceNumber);
    // This would typically download a PDF file
  };

  const handleSendEmail = (invoice: Invoice) => {
    // Email sending logic would go here
    console.log("Sending email for:", invoice.invoiceNumber);
    alert(`Invoice ${invoice.invoiceNumber} would be sent to student/parent email`);
  };

  const handleFormSubmit = async (invoiceData: any) => {
    const formData = new FormData();
    formData.append('studentId', invoiceData.studentId);
    formData.append('items', JSON.stringify(invoiceData.items));
    formData.append('dueDate', invoiceData.dueDate);
    formData.append('issueDate', invoiceData.issueDate);

    const loadingToast = toast.loading("Creating invoice...");
    const result = await createInvoice({ success: false, error: false, message: '' }, formData);

    if (result.success) {
      toast.success("Invoice created successfully", { id: loadingToast });
      await fetchInvoices(); // Refresh the list
    } else {
      toast.error(result.message || "Failed to create invoice", { id: loadingToast });
    }

    setIsFormOpen(false);
  };

  const handleRecordPayment = async (invoiceId: string, amount: number, method: string, reference: string) => {
    const loadingToast = toast.loading("Recording payment...");
    const result = await recordPayment(invoiceId, amount, method as any, reference);

    if (result.success) {
      toast.success("Payment recorded successfully", { id: loadingToast });
      await fetchInvoices(); // Refresh the list
      setIsViewModalOpen(false);
    } else {
      toast.error(result.message || "Failed to record payment", { id: loadingToast });
    }
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
        <h1 className="text-2xl font-bold">Invoice Management</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Invoices</p>
                <p className="text-2xl font-bold">{statusStats.total}</p>
                <p className="text-sm text-gray-600">{formatCurrency(statusStats.totalAmount)}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Paid</p>
                <p className="text-2xl font-bold text-green-600">{statusStats.paid}</p>
                <p className="text-sm text-gray-600">{formatCurrency(statusStats.paidAmount)}</p>
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
                <p className="text-2xl font-bold text-orange-600">{statusStats.pending}</p>
                <p className="text-sm text-gray-600">{formatCurrency(statusStats.pendingAmount)}</p>
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
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{statusStats.overdue}</p>
                <p className="text-sm text-gray-600">{formatCurrency(statusStats.overdueAmount)}</p>
              </div>
              <div className="p-3 rounded-full bg-red-100">
                <AlertCircle className="w-6 h-6 text-red-600" />
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
                placeholder="Search invoices..."
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
              <option value="PAID">Paid</option>
              <option value="OVERDUE">Overdue</option>
              <option value="CANCELLED">Cancelled</option>
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

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Invoice #</th>
                  <th className="text-left p-4">Student</th>
                  <th className="text-left p-4">Class</th>
                  <th className="text-left p-4">Amount</th>
                  <th className="text-left p-4">Issue Date</th>
                  <th className="text-left p-4">Due Date</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-mono">{invoice.invoiceNumber}</td>
                    <td className="p-4">{invoice.studentName}</td>
                    <td className="p-4">Grade {invoice.grade} - {invoice.className}</td>
                    <td className="p-4 font-semibold">{formatCurrency(invoice.totalAmount)}</td>
                    <td className="p-4">{new Date(invoice.issueDate).toLocaleDateString()}</td>
                    <td className="p-4">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs flex items-center w-fit ${getStatusColor(invoice.status)}`}>
                        {getStatusIcon(invoice.status)}
                        <span className="ml-1">{invoice.status}</span>
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewInvoice(invoice)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleGeneratePDF(invoice)}
                        >
                          <Printer className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSendEmail(invoice)}
                        >
                          <Mail className="w-4 h-4" />
                        </Button>
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
        <InvoiceForm
          onSubmit={handleFormSubmit}
          onClose={() => setIsFormOpen(false)}
        />
      )}

      {isViewModalOpen && selectedInvoice && (
        <ViewInvoiceModal
          invoice={selectedInvoice}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedInvoice(null);
          }}
          onRecordPayment={handleRecordPayment}
        />
      )}
    </div>
  );
}
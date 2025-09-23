"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Download,
  Filter,
  Calendar,
  BarChart3,
  PieChart,
  TrendingUp,
  FileText,
  DollarSign,
  Users,
  CreditCard
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { FinancialReports } from "@/components/finance/FinancialReports";
import { CollectionReports } from "@/components/finance/CollectionReports";
import { ExpenseReports } from "@/components/finance/ExpenseReports";
import { toast } from "sonner";
import { exportReport, generateCollectionReport, generateExpenseReport, generateFinancialReport } from "@/lib/actions";

interface ReportData {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  feeCollectionRate: number;
  outstandingFees: number;
  expenseBreakdown: { category: string; amount: number; percentage: number }[];
  revenueTrends: { month: string; revenue: number; expenses: number }[];
  topStudents: { name: string; grade: string; paid: number }[];
}

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState<'financial' | 'collection' | 'expense'>('financial');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, [dateRange, activeReport]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      const filters = {
        startDate: new Date(dateRange.start),
        endDate: new Date(dateRange.end)
      };

      let data: ReportData;

      switch (activeReport) {
        case 'financial':
          data = await generateFinancialReport(filters);
          break;
        case 'collection':
          data = await generateCollectionReport(filters);
          break;
        case 'expense':
          data = await generateExpenseReport(filters);
          break;
        default:
          data = await generateFinancialReport(filters);
      }

      setReportData(data);
      toast.success("Report data loaded successfully");
      
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error("Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (field: 'start' | 'end', value: string) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      const toastId = toast.loading(`Exporting ${activeReport} report as ${format.toUpperCase()}...`);
      
      if (format === 'csv') {
        const csvData = await exportReport(
          activeReport,
          'csv',
          {
            startDate: new Date(dateRange.start),
            endDate: new Date(dateRange.end)
          }
        );

        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${activeReport}-report-${dateRange.start}-to-${dateRange.end}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast.success(`Report exported as CSV successfully`, { id: toastId });
        return;
      }

      // For PDF/Excel, you might want to use a client-side library
      // This is a placeholder for actual implementation
      console.log(`Exporting ${activeReport} report as ${format} for date range:`, dateRange);
      toast.success(`Export functionality for ${format.toUpperCase()} will be implemented soon`, { id: toastId });
      
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error("Failed to export report");
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

  if (!reportData) return null;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Financial Reports</h1>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => handleExport('pdf')}>
            <FileText className="w-4 h-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" onClick={() => handleExport('excel')}>
            <BarChart3 className="w-4 h-4 mr-2" />
            Excel
          </Button>
          <Button variant="outline" onClick={() => handleExport('csv')}>
            <Download className="w-4 h-4 mr-2" />
            CSV
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex items-center">
              <Calendar className="text-gray-400 w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Date Range:</span>
            </div>
            <Input
              type="date"
              value={dateRange.start}
              onChange={(e) => handleDateChange('start', e.target.value)}
              className="w-full md:w-auto"
            />
            <span className="text-gray-400">to</span>
            <Input
              type="date"
              value={dateRange.end}
              onChange={(e) => handleDateChange('end', e.target.value)}
              className="w-full md:w-auto"
            />
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(reportData.totalRevenue)}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(reportData.totalExpenses)}
                </p>
              </div>
              <div className="p-3 rounded-full bg-red-100">
                <CreditCard className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Net Profit</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(reportData.netProfit)}
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Collection Rate</p>
                <p className="text-2xl font-bold">
                  {reportData.feeCollectionRate}%
                </p>
              </div>
              <div className="p-3 rounded-full bg-orange-100">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`px-6 py-3 font-medium flex items-center ${
            activeReport === 'financial'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500'
          }`}
          onClick={() => setActiveReport('financial')}
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Financial Summary
        </button>
        <button
          className={`px-6 py-3 font-medium flex items-center ${
            activeReport === 'collection'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500'
          }`}
          onClick={() => setActiveReport('collection')}
        >
          <DollarSign className="w-4 h-4 mr-2" />
          Collection Report
        </button>
        <button
          className={`px-6 py-3 font-medium flex items-center ${
            activeReport === 'expense'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500'
          }`}
          onClick={() => setActiveReport('expense')}
        >
          <PieChart className="w-4 h-4 mr-2" />
          Expense Analysis
        </button>
      </div>

      {/* Report Content */}
      <div className="mb-6">
        {activeReport === 'financial' && (
          <FinancialReports data={reportData} dateRange={dateRange} />
        )}
        {activeReport === 'collection' && (
          <CollectionReports data={reportData} dateRange={dateRange} />
        )}
        {activeReport === 'expense' && (
          <ExpenseReports data={reportData} dateRange={dateRange} />
        )}
      </div>

      {/* Additional Reports Section */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button variant="outline" className="justify-start">
              <FileText className="w-4 h-4 mr-2" />
              Student Fee Statements
            </Button>
            <Button variant="outline" className="justify-start">
              <FileText className="w-4 h-4 mr-2" />
              Tax Reports
            </Button>
            <Button variant="outline" className="justify-start">
              <FileText className="w-4 h-4 mr-2" />
              Audit Trail
            </Button>
            <Button variant="outline" className="justify-start">
              <FileText className="w-4 h-4 mr-2" />
              Vendor Payments
            </Button>
            <Button variant="outline" className="justify-start">
              <FileText className="w-4 h-4 mr-2" />
              Cash Flow Statement
            </Button>
            <Button variant="outline" className="justify-start">
              <FileText className="w-4 h-4 mr-2" />
              Budget vs Actual
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
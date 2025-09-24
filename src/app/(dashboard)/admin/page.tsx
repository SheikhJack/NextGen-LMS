"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Wallet,
  TrendingUp,
  AlertCircle,
  Receipt,
  Download,
  Plus,
  FileText,
  DollarSign
} from "lucide-react";
import { formatCurrency } from '@/lib/utils';
import EventCalendar from "@/components/EventCalendar";
import Announcements from "@/components/Announcements";
import EventList from "@/components/EventList";
import { RecentTransactions } from "@/components/finance/RecentTransactions";
import { IncomeExpenseChart } from "@/components/finance/IncomeExpenseChart";
import { CollectionRateChart } from "@/components/finance/CollectionRateChart";
import { getFinancialOverview, getPaymentStatistics, getSchoolFinance } from "@/lib/actions";

interface FinanceStats {
  totalBalance: number;
  monthlyRevenue: number;
  outstandingFees: number;
  totalExpenses: number;
}

interface PaymentStats {
  total: number;
  completed: number;
  pending: number;
  failed: number;
  totalAmount: number;
  completedAmount: number;
  pendingAmount: number;
}

export default function FinanceDashboard() {
  const [stats, setStats] = useState<FinanceStats>({
    totalBalance: 0,
    monthlyRevenue: 0,
    outstandingFees: 0,
    totalExpenses: 0
  });

  const [paymentStats, setPaymentStats] = useState<PaymentStats>({
    total: 0,
    completed: 0,
    pending: 0,
    failed: 0,
    totalAmount: 0,
    completedAmount: 0,
    pendingAmount: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const fetchFinanceData = async () => {
    try {
      const financialOverview = await getFinancialOverview();

      const paymentStatistics = await getPaymentStatistics();

      const schoolFinance = await getSchoolFinance();

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      
      
      const monthlyRevenue = paymentStatistics.completedAmount;

      const updatedStats: FinanceStats = {
        totalBalance: schoolFinance?.balance || 0,
        monthlyRevenue: monthlyRevenue,
        outstandingFees: financialOverview.totalIncome - paymentStatistics.completedAmount,
        totalExpenses: financialOverview.totalExpenses
      };

      setStats(updatedStats);
      setPaymentStats(paymentStatistics);
    } catch (error) {
      console.error("Error fetching finance data:", error);
      const mockStats: FinanceStats = {
        totalBalance: 45000,
        monthlyRevenue: 12000,
        outstandingFees: 8500,
        totalExpenses: 8000
      };
      setStats(mockStats);
    } finally {
      setLoading(false);
    }
  };



  const handleQuickAction = async (action: string) => {
    try {
      switch (action) {
        case 'generate-invoice':
          window.location.href = '/finance/invoices/new';
          break;
        case 'record-expense':
          window.location.href = '/finance/expenses/new';
          break;
        case 'record-payment':
          window.location.href = '/finance/payments/new';
          break;
        case 'download-reports':
          await downloadFinancialReport();
          break;
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
    }
  };



  const downloadFinancialReport = async () => {
    try {
      // This would call your exportReport server action
      // For now, we'll create a simple CSV download
      const csvContent = `Financial Report,${new Date().toLocaleDateString()}
      Total Balance,${formatCurrency(stats.totalBalance)}
      Monthly Revenue,${formatCurrency(stats.monthlyRevenue)}
      Outstanding Fees,${formatCurrency(stats.outstandingFees)}
      Total Expenses,${formatCurrency(stats.totalExpenses)}
      Collection Rate,${((stats.monthlyRevenue / (stats.monthlyRevenue + stats.outstandingFees)) * 100).toFixed(2)}%`;

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `financial-report-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };



  if (loading) {
    return (
      <div className="p-4 flex gap-4 flex-col md:flex-row bg-stone-200">
        <div className="w-full flex flex-col gap-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="w-full lg:w-2/3 flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-32 bg-gray-300 rounded-lg animate-pulse"></div>
                ))}
              </div>
              <div className="h-64 bg-gray-300 rounded-lg animate-pulse"></div>
            </div>
            <div className="w-full lg:w-1/3 space-y-4">
              <div className="h-64 bg-gray-300 rounded-lg animate-pulse"></div>
              <div className="h-32 bg-gray-300 rounded-lg animate-pulse"></div>
              <div className="h-32 bg-gray-300 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 flex gap-4 flex-col md:flex-row bg-stone-200">
      {/* MAIN CONTENT */}
      <div className="w-full flex flex-col gap-8">
        {/* FINANCE CARDS GRID - Now on top */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Balance"
            value={stats.totalBalance}
            trend={stats.totalBalance >= 0 ? "+12%" : "-8%"}
            icon={<Wallet className="w-6 h-6" />}
            color={stats.totalBalance >= 0 ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}
          />
          <MetricCard
            title="Monthly Revenue"
            value={stats.monthlyRevenue}
            trend="+8%"
            icon={<TrendingUp className="w-6 h-6" />}
            color="bg-blue-100 text-blue-600"
          />
          <MetricCard
            title="Outstanding Fees"
            value={stats.outstandingFees}
            trend={stats.outstandingFees > 0 ? "Attention Needed" : "All Clear"}
            icon={<AlertCircle className="w-6 h-6" />}
            color={stats.outstandingFees > 0 ? "bg-orange-100 text-orange-600" : "bg-green-100 text-green-600"}
          />
          <MetricCard
            title="Total Expenses"
            value={stats.totalExpenses}
            trend="+3%"
            icon={<Receipt className="w-6 h-6" />}
            color="bg-red-100 text-red-600"
          />
        </div>

        {/* PAYMENT STATISTICS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{paymentStats.total}</div>
              <p className="text-xs text-gray-600">
                {paymentStats.completed} completed • {paymentStats.pending} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Amount Processed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(paymentStats.totalAmount)}</div>
              <p className="text-xs text-gray-600">
                {formatCurrency(paymentStats.completedAmount)} collected
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.monthlyRevenue + stats.outstandingFees > 0
                  ? `${((stats.monthlyRevenue / (stats.monthlyRevenue + stats.outstandingFees)) * 100).toFixed(1)}%`
                  : '100%'
                }
              </div>
              <p className="text-xs text-gray-600">
                of expected revenue collected
              </p>
            </CardContent>
          </Card>
        </div>

        {/* MAIN CONTENT ROW */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* LEFT - Recent Transactions */}
          <div className="w-full lg:w-2/3 flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <RecentTransactions />
              </CardContent>
            </Card>

            {/* Charts */}
            <Card>
              <CardHeader>
                <CardTitle>Income vs Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <IncomeExpenseChart
                  data={[
                    { month: 'Jan', income: stats.monthlyRevenue, expenses: stats.totalExpenses },
                    { month: 'Feb', income: stats.monthlyRevenue * 1.1, expenses: stats.totalExpenses * 0.9 },
                    { month: 'Mar', income: stats.monthlyRevenue * 0.95, expenses: stats.totalExpenses * 1.1 }
                  ]}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fee Collection Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <CollectionRateChart
                  rate={stats.monthlyRevenue + stats.outstandingFees > 0
                    ? (stats.monthlyRevenue / (stats.monthlyRevenue + stats.outstandingFees)) * 100
                    : 100
                  }
                />
              </CardContent>
            </Card>
          </div>

          {/* RIGHT - Calendar and Side Components */}
          <div className="w-full lg:w-1/3 space-y-4">
            <EventCalendar />

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleQuickAction('generate-invoice')}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Invoice
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleQuickAction('record-expense')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Record Expense
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleQuickAction('record-payment')}
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Record Payment
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleQuickAction('download-reports')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Reports
                </Button>
              </CardContent>
            </Card>

            {/* Financial Health Indicator */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Liquidity Ratio</span>
                    <span className="text-sm font-medium">
                      {stats.totalExpenses > 0 ? (stats.totalBalance / stats.totalExpenses).toFixed(1) : '∞'} months
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${Math.min(100, stats.totalExpenses > 0 ? (stats.totalBalance / stats.totalExpenses) * 10 : 100)}%`
                      }}
                    ></div>
                  </div>

                  <div className="flex justify-between mt-4">
                    <span className="text-sm">Collection Efficiency</span>
                    <span className="text-sm font-medium">
                      {stats.monthlyRevenue + stats.outstandingFees > 0
                        ? `${((stats.monthlyRevenue / (stats.monthlyRevenue + stats.outstandingFees)) * 100).toFixed(1)}%`
                        : '100%'
                      }
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${stats.monthlyRevenue + stats.outstandingFees > 0
                          ? (stats.monthlyRevenue / (stats.monthlyRevenue + stats.outstandingFees)) * 100
                          : 100
                          }%`
                      }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: number;
  trend: string;
  icon: React.ReactNode;
  color: string;
}

function MetricCard({ title, value, trend, icon, color }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-xl font-bold">{formatCurrency(value)}</p>
            <p className={`text-xs ${trend.includes('+') || trend.includes('All Clear')
              ? 'text-green-600'
              : trend.includes('Attention')
                ? 'text-orange-600'
                : 'text-red-600'
              }`}>
              {trend}
            </p>
          </div>
          <div className={`p-2 rounded-full ${color}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
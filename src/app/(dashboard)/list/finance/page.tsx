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
import { IncomeExpenseChart } from "@/components/finance/IncomeExpenseChart";
import { RecentTransactions } from "@/components/finance/RecentTransactions";
import { CollectionRateChart } from "@/components/finance/CollectionRateChart";

interface FinanceStats {
  totalBalance: number;
  monthlyRevenue: number;
  outstandingFees: number;
  totalExpenses: number;
}

export default function FinanceDashboard() {
  const [stats, setStats] = useState<FinanceStats>({
    totalBalance: 0,
    monthlyRevenue: 0,
    outstandingFees: 0,
    totalExpenses: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinanceStats();
  }, []);

  const fetchFinanceStats = async () => {
    try {
      // Simulated data - replace with actual API call
      const mockStats: FinanceStats = {
        totalBalance: 45000,
        monthlyRevenue: 12000,
        outstandingFees: 8500,
        totalExpenses: 8000
      };
      setStats(mockStats);
    } catch (error) {
      console.error("Error fetching finance stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Finance Dashboard</h1>
        <div className="flex gap-4">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Transaction
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Balance"
          value={stats.totalBalance}
          trend="+12%"
          icon={<Wallet className="w-6 h-6" />}
          color="bg-green-100 text-green-600"
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
          trend="-5%"
          icon={<AlertCircle className="w-6 h-6" />}
          color="bg-orange-100 text-orange-600"
        />
        <MetricCard
          title="Total Expenses"
          value={stats.totalExpenses}
          trend="+3%"
          icon={<Receipt className="w-6 h-6" />}
          color="bg-red-100 text-red-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

        <Card>
          <CardHeader>
            <CardTitle>Income vs Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <IncomeExpenseChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fee Collection Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <CollectionRateChart />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentTransactions />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              <FileText className="w-4 h-4 mr-2" />
              Generate Invoice
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Plus className="w-4 h-4 mr-2" />
              Record Expense
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <DollarSign className="w-4 h-4 mr-2" />
              Record Payment
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Download className="w-4 h-4 mr-2" />
              Download Reports
            </Button>
          </CardContent>
        </Card>
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
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{formatCurrency(value)}</p>
            <p className="text-sm text-green-600">{trend}</p>
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
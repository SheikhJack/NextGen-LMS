"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { formatCurrency } from "@/lib/utils";

interface FinancialReportsProps {
  data: any;
  dateRange: { start: string; end: string };
}

export function FinancialReports({ data, dateRange }: FinancialReportsProps) {
  return (
    <div className="space-y-6">
      {/* Revenue vs Expenses Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue vs Expenses Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.revenueTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} />
              <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profit & Loss Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Revenue:</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(data.totalRevenue)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Expenses:</span>
                <span className="font-semibold text-red-600">
                  {formatCurrency(data.totalExpenses)}
                </span>
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="font-medium">Net Profit:</span>
                <span className={`font-bold ${data.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(data.netProfit)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Profit Margin:</span>
                <span className="font-semibold">
                  {((data.netProfit / data.totalRevenue) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Key Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Fee Collection Rate:</span>
                <span className="font-semibold">{data.feeCollectionRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Outstanding Fees:</span>
                <span className="font-semibold text-orange-600">
                  {formatCurrency(data.outstandingFees)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Average Revenue per Student:</span>
                <span className="font-semibold">
                  {formatCurrency(data.totalRevenue / (data.topStudents?.length || 1))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Report Period:</span>
                <span className="font-semibold">
                  {new Date(dateRange.start).toLocaleDateString()} - {new Date(dateRange.end).toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
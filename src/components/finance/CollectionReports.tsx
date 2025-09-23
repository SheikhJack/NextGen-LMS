"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatCurrency } from "@/lib/utils";

interface CollectionReportsProps {
  data: any;
  dateRange: { start: string; end: string };
}

const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6'];

export function CollectionReports({ data, dateRange }: CollectionReportsProps) {
  const collectionData = [
    { name: 'Paid', value: data.feeCollectionRate, amount: data.totalRevenue },
    { name: 'Outstanding', value: 100 - data.feeCollectionRate, amount: data.outstandingFees }
  ];

  return (
    <div className="space-y-6">
      {/* Collection Rate Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Collection Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={collectionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {collectionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? COLORS[0] : COLORS[2]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [
                  name === 'Paid' ? formatCurrency(data.totalRevenue) : formatCurrency(data.outstandingFees),
                  name
                ]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Collection Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Paid Fees</span>
                  <span className="text-sm font-semibold text-green-600">
                    {formatCurrency(data.totalRevenue)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${data.feeCollectionRate}%` }}
                  />
                </div>
                <span className="text-xs text-gray-600">{data.feeCollectionRate}% collected</span>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Outstanding Fees</span>
                  <span className="text-sm font-semibold text-orange-600">
                    {formatCurrency(data.outstandingFees)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full"
                    style={{ width: `${100 - data.feeCollectionRate}%` }}
                  />
                </div>
                <span className="text-xs text-gray-600">{100 - data.feeCollectionRate}% outstanding</span>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between">
                  <span className="font-medium">Total Fees:</span>
                  <span className="font-bold">
                    {formatCurrency(data.totalRevenue + data.outstandingFees)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Paying Students */}
      <Card>
        <CardHeader>
          <CardTitle>Top Paying Students</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.topStudents.map((student: any, index: number) => (
              <div key={index} className="flex justify-between items-center p-3 border rounded">
                <div>
                  <p className="font-medium">{student.name}</p>
                  <p className="text-sm text-gray-600">Grade {student.grade}</p>
                </div>
                <span className="font-semibold text-green-600">
                  {formatCurrency(student.paid)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
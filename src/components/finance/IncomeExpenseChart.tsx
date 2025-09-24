// @/components/finance/IncomeExpenseChart.tsx
"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartData {
  month: string;
  income: number;
  expenses: number;
}

interface IncomeExpenseChartProps {
  data: ChartData[];
}

export function IncomeExpenseChart({ data }: IncomeExpenseChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip 
          formatter={(value) => new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'BWP'
          }).format(Number(value))}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="income" 
          stroke="#8884d8" 
          strokeWidth={2}
          name="Income"
        />
        <Line 
          type="monotone" 
          dataKey="expenses" 
          stroke="#82ca9d" 
          strokeWidth={2}
          name="Expenses"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
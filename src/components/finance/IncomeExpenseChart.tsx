"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { month: 'Jan', income: 12000, expenses: 8000 },
  { month: 'Feb', income: 15000, expenses: 9000 },
  { month: 'Mar', income: 18000, expenses: 10000 },
  { month: 'Apr', income: 14000, expenses: 8500 },
  { month: 'May', income: 16000, expenses: 9500 },
  { month: 'Jun', income: 19000, expenses: 11000 },
];

export function IncomeExpenseChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="income" fill="#3B82F6" name="Income" />
        <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
      </BarChart>
    </ResponsiveContainer>
  );
}
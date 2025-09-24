// @/components/finance/CollectionRateChart.tsx
"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface CollectionRateChartProps {
  rate: number;
}

export function CollectionRateChart({ rate }: CollectionRateChartProps) {
  const data = [
    { name: 'Collected', value: rate },
    { name: 'Outstanding', value: 100 - rate }
  ];

  const COLORS = ['#00C49F', '#FF8042'];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
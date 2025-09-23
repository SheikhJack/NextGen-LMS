"use client";

import { formatCurrency }  from "@/lib/utils";

const transactions = [
  { id: 1, student: "John Doe", type: "income", amount: 500, date: "2024-01-15", status: "completed" },
  { id: 2, student: "Jane Smith", type: "income", amount: 750, date: "2024-01-14", status: "completed" },
  { id: 3, student: "School Supplies", type: "expense", amount: -250, date: "2024-01-13", status: "completed" },
  { id: 4, student: "Mike Johnson", type: "income", amount: 600, date: "2024-01-12", status: "pending" },
  { id: 5, student: "Utility Bill", type: "expense", amount: -350, date: "2024-01-11", status: "completed" },
];

export function RecentTransactions() {
  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${
              transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <div className={`w-4 h-4 rounded-full ${
                transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'
              }`} />
            </div>
            <div>
              <p className="font-medium">{transaction.student}</p>
              <p className="text-sm text-gray-500">{transaction.date}</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`font-semibold ${
              transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(transaction.amount)}
            </p>
            <p className="text-sm text-gray-500 capitalize">{transaction.status}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
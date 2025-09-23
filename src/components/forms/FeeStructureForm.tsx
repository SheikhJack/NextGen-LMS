"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface FeeCategory {
  id: string;
  name: string;
  description: string;
  amount: number;
  frequency: 'ONE_TIME' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  applicableGrades: number[];
  startDate: string;
  endDate?: string;
}

interface FeeStructureFormProps {
  fee?: FeeCategory | any;
  onSubmit: (data: Omit<FeeCategory, 'id'>) => void;
  onClose: () => void;
}

const frequencies = [
  { value: 'ONE_TIME', label: 'One Time' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'YEARLY', label: 'Yearly' }
];

const grades = [0,1];

export function FeeStructureForm({ fee, onSubmit, onClose }: FeeStructureFormProps) {
  const [formData, setFormData] = useState({
    name: fee?.name || "",
    description: fee?.description || "",
    amount: fee?.amount.toString() || "",
    frequency: fee?.frequency || "ONE_TIME",
    applicableGrades: fee?.applicableGrades || [],
    startDate: fee?.startDate || new Date().toISOString().split('T')[0],
    endDate: fee?.endDate || ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      description: formData.description,
      amount: parseFloat(formData.amount),
      frequency: formData.frequency as FeeCategory['frequency'],
      applicableGrades: formData.applicableGrades,
      startDate: formData.startDate,
      endDate: formData.endDate || undefined
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleGradeToggle = (grade: number) => {
    setFormData(prev => ({
      ...prev,
      applicableGrades: prev.applicableGrades.includes(grade)
        ? prev.applicableGrades.filter((g: number) => g !== grade)
        : [...prev.applicableGrades, grade]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {fee ? "Edit Fee Category" : "Add Fee Category"}
          </h2>
          <Button variant="ghost" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name *</label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Fee name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Amount *</label>
              <Input
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleChange}
                required
                placeholder="0.00"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Frequency *</label>
              <select
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
                required
              >
                {frequencies.map(freq => (
                  <option key={freq.value} value={freq.value}>
                    {freq.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Start Date *</label>
              <Input
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">End Date</label>
              <Input
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <Input
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Fee description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Applicable Grades *</label>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {grades.map(grade => (
                <label key={grade} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.applicableGrades.includes(grade)}
                    onChange={() => handleGradeToggle(grade)}
                    className="mr-2"
                  />
                  Grade {grade}
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {fee ? "Update Fee" : "Add Fee"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
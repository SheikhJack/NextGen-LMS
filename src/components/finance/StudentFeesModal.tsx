"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Search } from "lucide-react";

interface FeeCategory {
  id: string;
  name: string;
  amount: number;
}

interface Student {
  id: string;
  name: string;
  grade: number;
  className: string;
}

interface StudentFeesModalProps {
  feeCategories: FeeCategory[];
  onClose: () => void;
  onAssign: (assignments: any[]) => void;
}

// Mock students - replace with actual data
const mockStudents: Student[] = [
  { id: "1", name: "John Doe", grade: 5, className: "5A" },
  { id: "2", name: "Jane Smith", grade: 5, className: "5A" },
  { id: "3", name: "Mike Johnson", grade: 4, className: "4B" },
  { id: "4", name: "Sarah Wilson", grade: 4, className: "4B" }
];

export function StudentFeesModal({ feeCategories, onClose, onAssign }: StudentFeesModalProps) {
  const [selectedFee, setSelectedFee] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStudents = mockStudents.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.className.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = () => {
    if (!selectedFee || selectedStudents.length === 0 || !dueDate) {
      alert("Please select a fee, students, and due date");
      return;
    }

    const selectedFeeData = feeCategories.find(f => f.id === selectedFee);
    if (!selectedFeeData) return;

    const assignments = selectedStudents.map(studentId => {
      const student = mockStudents.find(s => s.id === studentId);
      return {
        studentId,
        studentName: student?.name,
        feeCategory: selectedFeeData.name,
        amount: selectedFeeData.amount,
        dueDate
      };
    });

    onAssign(assignments);
  };

  const toggleStudent = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Assign Fees to Students</h2>
          <Button variant="ghost" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fee Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Select Fee Category *</label>
            <select
              value={selectedFee}
              onChange={(e) => setSelectedFee(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
            >
              <option value="">Select fee category</option>
              {feeCategories.map(fee => (
                <option key={fee.id} value={fee.id}>
                  {fee.name} - {fee.amount}
                </option>
              ))}
            </select>

            <label className="block text-sm font-medium mb-2 mt-4">Due Date *</label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>

          {/* Student Selection */}
          <div>
            <div className="flex items-center mb-4">
              <Search className="text-gray-400 w-4 h-4 mr-2" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>

            <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
              {filteredStudents.map(student => (
                <label key={student.id} className="flex items-center p-2 hover:bg-gray-50 rounded">
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student.id)}
                    onChange={() => toggleStudent(student.id)}
                    className="mr-3"
                  />
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-gray-600">Grade {student.grade} - {student.className}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-6 mt-6 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Assign Fees
          </Button>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Users,
  CreditCard,
  DollarSign
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { FeeStructureForm } from "@/components/forms/FeeStructureForm";
import { StudentFeesModal } from "@/components/finance/StudentFeesModal";
import { toast } from "sonner";
import {
  createFeeCategory,
  updateFeeCategory,
  deleteFeeCategory,
  getFeeCategories,
  getStudentFees,
  updateStudentFeeStatus
} from "@/lib/actions";



export interface StudentFeeWithDetails {
  id: string;
  studentName: string;
  grade: number;
  className: string;
  feeCategory: string;
  amount: number;
  dueDate: string;
  paid: boolean;
  paidDate?: string;
}


interface FeeCategory {
  id: string;
  name: string;
  description: string | null;
  amount: number;
  frequency: 'ONE_TIME' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  applicableGrades: number[];
  startDate: string;
  endDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface StudentFee {
  id: string;
  studentName: string;
  grade: number;
  className: string;
  feeCategory: string;
  amount: number;
  dueDate: string;
  paid: boolean;
  paidDate?: string | null;
  studentId?: string;
  feeCategoryId?: string;
  studentFinanceId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export default function FeesPage() {
  const [activeTab, setActiveTab] = useState<'structure' | 'students'>('structure');
  const [feeCategories, setFeeCategories] = useState<FeeCategory[]>([]);
  const [studentFees, setStudentFees] = useState<StudentFee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<FeeCategory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [feeData, studentFeeData] = await Promise.all([
        getFeeCategories(),
        getStudentFees()
      ]);
      
      
      const transformedFeeData = feeData.map((fee: any) => ({
        id: fee.id,
        name: fee.name,
        description: fee.description || "",
        amount: fee.amount,
        frequency: fee.frequency,
        applicableGrades: fee.applicableGrades || [],
        startDate: fee.startDate,
        endDate: fee.endDate || undefined
      }));
      
      const transformedStudentFeeData = studentFeeData.map((fee: any) => ({
        id: fee.id,
        studentName: "Student Name",
        grade: 0, 
        className: "Class Name", 
        feeCategory: "Fee Category", 
        amount: fee.amount,
        dueDate: fee.dueDate,
        paid: fee.paid,
        paidDate: fee.paidDate || undefined,
        studentId: fee.studentId,
        feeCategoryId: fee.feeCategoryId
      }));
      
      setFeeCategories(transformedFeeData);
      setStudentFees(transformedStudentFeeData);
    } catch (error) {
      toast.error("Failed to load data");
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFeeCategories = feeCategories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredStudentFees = studentFees.filter(fee =>
    fee.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fee.feeCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fee.className.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRevenue = studentFees
    .filter(fee => fee.paid)
    .reduce((sum, fee) => sum + fee.amount, 0);

  const pendingFees = studentFees
    .filter(fee => !fee.paid)
    .reduce((sum, fee) => sum + fee.amount, 0);

  const totalStudents = new Set(studentFees.map(fee => fee.studentName)).size;

  const handleDeleteFee = async (id: string) => {
    if (confirm("Are you sure you want to delete this fee category?")) {
      const loadingToast = toast.loading("Deleting fee category...");
      const result = await deleteFeeCategory(id);
      
      if (result.success) {
        toast.success("Fee category deleted successfully", { id: loadingToast });
        setFeeCategories(feeCategories.filter(category => category.id !== id));
      } else {
        toast.error("Failed to delete fee category", { id: loadingToast });
      }
    }
  };

  const handleMarkPaid = async (id: string) => {
    const loadingToast = toast.loading("Updating payment status...");
    const result = await updateStudentFeeStatus(id, true);
    
    if (result.success) {
      toast.success("Fee marked as paid", { id: loadingToast });
      setStudentFees(studentFees.map(fee =>
        fee.id === id
          ? { ...fee, paid: true, paidDate: new Date().toISOString() }
          : fee
      ));
    } else {
      toast.error("Failed to update payment status", { id: loadingToast });
    }
  };

  const handleFormSubmit = async (feeData: Omit<FeeCategory, 'id'>) => {
    const loadingToast = toast.loading(editingFee ? "Updating fee..." : "Creating fee...");
    
    try {
      const formData = new FormData();
      Object.entries(feeData).forEach(([key, value]) => {
        if (key === 'applicableGrades') {
          formData.append(key, JSON.stringify(value));
        } else if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      let result;
      if (editingFee) {
        formData.append('id', editingFee.id);
        result = await updateFeeCategory({ success: false, error: false, message: '' }, formData);
      } else {
        result = await createFeeCategory({ success: false, error: false, message: '' }, formData);
      }

      if (result.success) {
        toast.success(result.message, { id: loadingToast });
        await fetchData(); // Refresh data
      } else {
        toast.error(result.message, { id: loadingToast });
      }
    } catch (error) {
      toast.error("An error occurred", { id: loadingToast });
    } finally {
      setIsFormOpen(false);
      setEditingFee(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Fee Management</h1>
        <div className="flex gap-4">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          {activeTab === 'structure' ? (
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Fee Category
            </Button>
          ) : (
            <Button onClick={() => setIsStudentModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Assign Fees
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Fees</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(pendingFees)}</p>
              </div>
              <div className="p-3 rounded-full bg-orange-100">
                <CreditCard className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold">{totalStudents}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'structure'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('structure')}
        >
          Fee Structure
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'students'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('students')}
        >
          Student Fees
        </button>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center">
            <Search className="text-gray-400 w-4 h-4 mr-3" />
            <Input
              placeholder={`Search ${activeTab === 'structure' ? 'fee categories' : 'student fees'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button variant="outline" className="ml-4">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Content based on active tab */}
      {activeTab === 'structure' ? (
        <Card>
          <CardHeader>
            <CardTitle>Fee Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFeeCategories.map((category) => (
                <Card key={category.id} className="relative">
                  <CardContent className="p-6">
                    <div className="absolute top-4 right-4 flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingFee(category);
                          setIsFormOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteFee(category.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-semibold">{formatCurrency(category.amount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Frequency:</span>
                        <span className="capitalize">{category.frequency.toLowerCase()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Grades:</span>
                        <span>{category.applicableGrades.join(', ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Start Date:</span>
                        <span>{new Date(category.startDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Student Fee Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Student</th>
                    <th className="text-left p-4">Grade/Class</th>
                    <th className="text-left p-4">Fee Type</th>
                    <th className="text-left p-4">Amount</th>
                    <th className="text-left p-4">Due Date</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudentFees.map((fee) => (
                    <tr key={fee.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">{fee.studentName}</td>
                      <td className="p-4">Grade {fee.grade} - {fee.className}</td>
                      <td className="p-4">{fee.feeCategory}</td>
                      <td className="p-4 font-semibold">{formatCurrency(fee.amount)}</td>
                      <td className="p-4">{new Date(fee.dueDate).toLocaleDateString()}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          fee.paid 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {fee.paid ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                      <td className="p-4">
                        {!fee.paid && (
                          <Button
                            size="sm"
                            onClick={() => handleMarkPaid(fee.id)}
                          >
                            Mark Paid
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      {isFormOpen && (
        <FeeStructureForm
          fee={editingFee}
          onSubmit={handleFormSubmit}
          onClose={() => {
            setIsFormOpen(false);
            setEditingFee(null);
          }}
        />
      )}

      {isStudentModalOpen && (
        <StudentFeesModal
          feeCategories={feeCategories}
          onClose={() => setIsStudentModalOpen(false)}
          onAssign={(assignments: any) => {
            console.log("Assign fees:", assignments);
            setIsStudentModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
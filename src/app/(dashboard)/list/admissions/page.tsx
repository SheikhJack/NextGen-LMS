"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
    Plus,
    Search,
    Filter,
    Download,
    Eye,
    Edit,
    Trash2,
    User,
    Calendar,
    Phone,
    Mail,
    Heart,
    AlertCircle,
    Stethoscope,
    Users,
    XCircle,
    CheckCircle,
    Clock
} from "lucide-react";
import { AdmissionForm } from "@/components/forms/AdmissionForm";
import { ViewAdmissionModal } from "@/components/ViewAdmissionModal";
import { createAdmission, deleteAdmission, getAdmissions, updateAdmission, updateAdmissionFee, updateAdmissionStatus } from "@/lib/actions";
import { AdmissionFeeUpdate } from "@/lib/types";
import { Admission, AdmissionFormData } from "@/lib/types";





export default function AdmissionsPage() {
    const [admissions, setAdmissions] = useState<Admission[]>([]);
    const [filteredAdmissions, setFilteredAdmissions] = useState<Admission[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(null);
    const [editingAdmission, setEditingAdmission] = useState<Admission | null>(null);

    useEffect(() => {
        const fetchAdmissions = async () => {
            const admissionsData = await getAdmissions();
            setAdmissions(admissionsData);
            setFilteredAdmissions(admissionsData);
        };
        fetchAdmissions();
    }, []);

    const stats = {
        total: admissions.length,
        pending: admissions.filter(a => a.status === 'PENDING').length,
        approved: admissions.filter(a => a.status === 'APPROVED').length,
        rejected: admissions.filter(a => a.status === 'REJECTED').length,
        waitlisted: admissions.filter(a => a.status === 'WAITLISTED').length
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'bg-green-100 text-green-800';
            case 'PENDING': return 'bg-orange-100 text-orange-800';
            case 'REJECTED': return 'bg-red-100 text-red-800';
            case 'WAITLISTED': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleStatusChange = async (admissionId: string, newStatus: string) => {
        const statusToast = toast.loading("Updating admission status...");
        const result = await updateAdmissionStatus(admissionId, newStatus as any);
        if (result.success) {
            toast.success(`Admission status updated to ${newStatus.toLowerCase()}`, { id: statusToast });
            setAdmissions(admissions.map(admission =>
                admission.id === admissionId
                    ? { ...admission, status: newStatus as Admission['status'] }
                    : admission
            ));
        } else {
            toast.error("Failed to update admission status", { id: statusToast });
        }
    };

    const handleFeeUpdate = async (admissionId: string, feeData: AdmissionFeeUpdate) => {
        const feeToast = toast.loading("Updating fee information...");
        const result = await updateAdmissionFee(admissionId, feeData);
        if (result.success) {
            toast.success("Fee information updated successfully!", { id: feeToast });
            setAdmissions(admissions.map(admission =>
                admission.id === admissionId
                    ? { ...admission, ...feeData }
                    : admission
            ));
        } else {
            toast.error("Failed to update fee information", { id: feeToast });
        }
    };

    const handleViewAdmission = (admission: Admission) => {
        setSelectedAdmission(admission);
        setIsViewModalOpen(true);
    };

    const handleEditAdmission = (admission: Admission) => {
        setEditingAdmission(admission);
        setIsFormOpen(true);
    };

    const handleDeleteAdmission = async (id: string) => {
        if (confirm("Are you sure you want to delete this admission application?")) {
            const deleteToast = toast.loading("Deleting admission application...");

            const result = await deleteAdmission(id);

            if (result.success) {
                toast.success("Admission application deleted successfully!", { id: deleteToast });
                setAdmissions(admissions.filter(admission => admission.id !== id));
            } else {
                toast.error("Failed to delete admission application", { id: deleteToast });
            }
        }
    };

    const handleFormSubmit = async (admissionData: Omit<Admission, 'id'>) => {
        const formData = new FormData();
        Object.entries(admissionData).forEach(([key, value]) => {
            if (key === 'allergies') {
                formData.append(key, JSON.stringify(value));
            } else if (typeof value === 'boolean') {
                formData.append(key, value.toString());
            } else if (value !== undefined && value !== null) {
                formData.append(key, value.toString());
            }
        });

        const initialState = { success: false, error: false, message: '' };

        if (editingAdmission) {
            formData.append('id', editingAdmission.id);
            const updateToast = toast.loading("Updating admission application...");
            const result = await updateAdmission(initialState, formData);
            if (result.success) {
                toast.success("Admission application updated successfully!", { id: updateToast });
                setAdmissions(admissions.map(admission =>
                    admission.id === editingAdmission.id
                        ? { ...admissionData, id: editingAdmission.id }
                        : admission
                ));
            } else {
                toast.error(result.message || "Failed to update admission application", { id: updateToast });
            }
        } else {
            const createToast = toast.loading("Submitting admission application...");
            const result = await createAdmission(initialState, formData);
            if (result.success) {
                toast.success("Admission application submitted successfully!", { id: createToast });
                const admissionsData = await getAdmissions();
                setAdmissions(admissionsData);
            } else {
                toast.error(result.message || "Failed to submit admission application", { id: createToast });
            }
        }
        setIsFormOpen(false);
        setEditingAdmission(null);
    };


    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Admissions Management</h1>
                <Button onClick={() => setIsFormOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Application
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                            <div className="p-3 rounded-full bg-blue-100">
                                <User className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Pending</p>
                                <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
                            </div>
                            <div className="p-3 rounded-full bg-orange-100">
                                <Clock className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Approved</p>
                                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                            </div>
                            <div className="p-3 rounded-full bg-green-100">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Waitlisted</p>
                                <p className="text-2xl font-bold text-blue-600">{stats.waitlisted}</p>
                            </div>
                            <div className="p-3 rounded-full bg-blue-100">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Rejected</p>
                                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                            </div>
                            <div className="p-3 rounded-full bg-red-100">
                                <XCircle className="w-6 h-6 text-red-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                placeholder="Search applications..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 border rounded-md"
                        >
                            <option value="all">All Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                            <option value="WAITLISTED">Waitlisted</option>
                        </select>
                        <Button variant="outline">
                            <Filter className="w-4 h-4 mr-2" />
                            More Filters
                        </Button>
                        <Button variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Admissions Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Admission Applications</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-4">Student</th>
                                    <th className="text-left p-4">Parent</th>
                                    <th className="text-left p-4">Age</th>
                                    <th className="text-left p-4">Grade</th>
                                    <th className="text-left p-4">Application Date</th>
                                    <th className="text-left p-4">Status</th>
                                    <th className="text-left p-4">Fee Status</th>
                                    <th className="text-left p-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {admissions.map((admission) => (
                                    <tr key={admission.id} className="border-b hover:bg-gray-50">
                                        <td className="p-4 font-medium">{admission.studentName}</td>
                                        <td className="p-4">{admission.parentName}</td>
                                        <td className="p-4">{admission.age} years</td>
                                        <td className="p-4">{admission.grade}</td>
                                        <td className="p-4">{new Date(admission.applicationDate).toLocaleDateString()}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(admission.status)}`}>
                                                {admission.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs ${admission.feeStatus === 'PAID' ? 'bg-green-100 text-green-800' :
                                                admission.feeStatus === 'WAIVED' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-orange-100 text-orange-800'
                                                }`}>
                                                {admission.feeStatus || 'PENDING'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleViewAdmission(admission)}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEditAdmission(admission)}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDeleteAdmission(admission.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Modals */}
            {isFormOpen && (
                <AdmissionForm
                    admission={editingAdmission}
                    onSubmit={handleFormSubmit}
                    onClose={() => {
                        setIsFormOpen(false);
                        setEditingAdmission(null);
                    }}
                />
            )}

            {isViewModalOpen && selectedAdmission && (
                <ViewAdmissionModal
                    admission={selectedAdmission}
                    onClose={() => {
                        setIsViewModalOpen(false);
                        setSelectedAdmission(null);
                    }}
                    onStatusChange={(status) => handleStatusChange(selectedAdmission.id, status)}
                    onFeeUpdate={handleFeeUpdate}
                />
            )}
        </div>
    );
}
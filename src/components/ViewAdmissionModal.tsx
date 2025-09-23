'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateAdmissionFee } from "@/lib/actions";
import { FeeStatus } from "@/lib/types/types";
import { Admission, AdmissionFeeUpdate, PaymentMethod } from "@/lib/types/index";
import { X, Phone, Mail, Heart, AlertCircle, Stethoscope, Users, Car, CreditCard, DollarSign } from "lucide-react";
import { useState } from "react";

interface ViewAdmissionModalProps {
    admission: Admission;
    onClose: () => void;
    onStatusChange: (status: string) => void;
    onFeeUpdate: (admissionId: string, feeData: AdmissionFeeUpdate) => void;
}

export function ViewAdmissionModal({ admission, onClose, onStatusChange, onFeeUpdate }: ViewAdmissionModalProps) {
    const [isEditingFee, setIsEditingFee] = useState(false);
    const [feeAmount, setFeeAmount] = useState(admission.registrationFee?.toString() || "500");
    const [feeStatus, setFeeStatus] = useState<FeeStatus>(admission.feeStatus || 'PENDING');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>(admission.paymentMethod || '');

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'bg-green-100 text-green-800';
            case 'PENDING': return 'bg-orange-100 text-orange-800';
            case 'REJECTED': return 'bg-red-100 text-red-800';
            case 'WAITLISTED': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getFeeStatusColor = (status: string) => {
        switch (status) {
            case 'PAID': return 'bg-green-100 text-green-800';
            case 'PENDING': return 'bg-orange-100 text-orange-800';
            case 'WAIVED': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleSaveFee = () => {
        const feeData: AdmissionFeeUpdate = {
            registrationFee: feeAmount ? parseFloat(feeAmount) : undefined,
            feeStatus,
            paymentMethod: paymentMethod || undefined,
            paymentDate: feeStatus === 'PAID' ? new Date().toISOString() : undefined
        };

        onFeeUpdate(admission.id, feeData);
        setIsEditingFee(false);
    };

    const handleMarkAsPaid = () => {
        onFeeUpdate(admission.id, {
            feeStatus: 'PAID',
            paymentDate: new Date().toISOString(),
            paymentMethod: paymentMethod || 'CASH'
        });
    };

    const handleFeeStatusChange = (value: string) => {
        if (value === 'PENDING' || value === 'PAID' || value === 'WAIVED') {
            setFeeStatus(value);
        }
    };

    const handlePaymentMethodChange = (value: string) => {
        if (value === 'CASH' || value === 'BANK_TRANSFER' || value === 'CARD' || value === 'MOBILE_MONEY') {
            setPaymentMethod(value);
        } else if (value === '') {
            setPaymentMethod('');
        }
    };

    const gradeFeeStructure = {
        "Nursery": 300,
        "Pre-K": 400,
        "Kindergarten": 500,
        "Grade 1": 600
    };

    const suggestedFee = gradeFeeStructure[admission.grade as keyof typeof gradeFeeStructure] || 500;



    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Admission Application Details</h2>
                    <Button variant="ghost" onClick={onClose}>
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                <div className="space-y-6">
                    {/* Header */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold mb-2">Student Information</h3>
                            <p><strong>Name:</strong> {admission.studentName}</p>
                            <p><strong>Age:</strong> {admission.age} years</p>
                            <p><strong>Grade:</strong> {admission.grade}</p>
                            <p><strong>Birth Date:</strong> {new Date(admission.birthDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">Application Details</h3>
                            <p><strong>Application Date:</strong> {new Date(admission.applicationDate).toLocaleDateString()}</p>
                            <p><strong>Status:</strong>
                                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(admission.status)}`}>
                                    {admission.status}
                                </span>
                            </p>
                            <p><strong>Parent:</strong> {admission.parentName}</p>
                        </div>
                    </div>

                    {/* Registration Fee Section */}
                    <div className="border-t pt-6">
                        <h3 className="font-semibold mb-4 flex items-center">
                            <DollarSign className="w-5 h-5 mr-2" />
                            Registration Fee
                        </h3>

                        {isEditingFee ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Amount (P)</label>
                                    <Input
                                        type="number"
                                        value={feeAmount}
                                        onChange={(e) => setFeeAmount(e.target.value)}
                                        placeholder="Enter amount"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Status</label>
                                    <select
                                        value={feeStatus}
                                        onChange={(e) => handleFeeStatusChange(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md"
                                    >
                                        <option value="PENDING">Pending</option>
                                        <option value="PAID">Paid</option>
                                        <option value="WAIVED">Waived</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Payment Method</label>
                                    <select
                                        value={paymentMethod}
                                        onChange={(e) => handlePaymentMethodChange(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md"
                                    >
                                        <option value="">Select method</option>
                                        <option value="CASH">Cash</option>
                                        <option value="BANK_TRANSFER">Bank Transfer</option>
                                        <option value="CARD">Credit Card</option>
                                        <option value="MOBILE_MONEY">Mobile Money</option>
                                    </select>
                                </div>
                                <div className="md:col-span-3 flex gap-2">
                                    <Button onClick={handleSaveFee} size="sm">
                                        Save
                                    </Button>
                                    <Button variant="outline" onClick={() => setIsEditingFee(false)} size="sm">
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-600">Amount</p>
                                    <p className="font-semibold text-lg">
                                        P{admission.registrationFee || suggestedFee}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Status</p>
                                    <span className={`px-2 py-1 rounded-full text-xs ${getFeeStatusColor(admission.feeStatus || 'PENDING')}`}>
                                        {admission.feeStatus || 'PENDING'}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Payment Method</p>
                                    <p className="font-medium">{admission.paymentMethod || 'Not specified'}</p>
                                </div>
                                {admission.paymentDate && (
                                    <div>
                                        <p className="text-sm text-gray-600">Payment Date</p>
                                        <p className="font-medium">
                                            {new Date(admission.paymentDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}
                                <div className="md:col-span-3 flex gap-2">
                                    <Button onClick={() => setIsEditingFee(true)} variant="outline" size="sm">
                                        <CreditCard className="w-4 h-4 mr-1" />
                                        Edit Fee
                                    </Button>
                                    {admission.feeStatus !== 'PAID' && (
                                        <Button onClick={handleMarkAsPaid} size="sm">
                                            <DollarSign className="w-4 h-4 mr-1" />
                                            Mark as Paid
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Medical Information */}
                    <div>
                        <h3 className="font-semibold mb-2 flex items-center">
                            <Heart className="w-4 h-4 mr-2" />
                            Medical Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p><strong>Blood Group:</strong> {admission.bloodGroup || "Not specified"}</p>
                                <p><strong>Dietary Restrictions:</strong> {admission.dietaryRestrictions || "None"}</p>
                            </div>
                            <div>
                                <p><strong>Allergies:</strong> {admission.allergies.length > 0 ? admission.allergies.join(", ") : "None"}</p>
                                <p><strong>Transportation:</strong> {admission.transportationNeeded ? "Needed" : "Not needed"}</p>
                            </div>
                        </div>
                        {admission.medicalConditions && (
                            <div className="mt-2">
                                <p><strong>Medical Conditions:</strong></p>
                                <p className="text-gray-600">{admission.medicalConditions}</p>
                            </div>
                        )}
                    </div>

                    {/* Special Needs */}
                    {admission.specialNeeds && (
                        <div>
                            <h3 className="font-semibold mb-2 flex items-center">
                                <Stethoscope className="w-4 h-4 mr-2" />
                                Special Needs
                            </h3>
                            <p className="text-gray-600">{admission.specialNeeds}</p>
                        </div>
                    )}

                    {/* Previous School */}
                    {admission.previousSchool && (
                        <div>
                            <h3 className="font-semibold mb-2 flex items-center">
                                <Users className="w-4 h-4 mr-2" />
                                Previous School
                            </h3>
                            <p>{admission.previousSchool}</p>
                        </div>
                    )}

                    {/* Emergency Contact */}
                    <div>
                        <h3 className="font-semibold mb-2 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-2" />
                            Emergency Contact
                        </h3>
                        <p className="flex items-center">
                            <Phone className="w-4 h-4 mr-2" />
                            {admission.emergencyContact}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between items-center pt-6 border-t">
                        <div className="flex gap-2">
                            {admission.feeStatus === 'PAID' && admission.status === 'APPROVED' && (
                                <Button className="bg-green-600 hover:bg-green-700">
                                    <CreditCard className="w-4 h-4 mr-2" />
                                    Generate Receipt
                                </Button>
                            )}
                        </div>

                        <div className="flex gap-2">
                            {admission.status === 'PENDING' && (
                                <>
                                    <Button
                                        onClick={() => onStatusChange('APPROVED')}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        Approve
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => onStatusChange('WAITLISTED')}
                                    >
                                        Waitlist
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => onStatusChange('REJECTED')}
                                        className="text-red-600 border-red-600 hover:bg-red-50"
                                    >
                                        Reject
                                    </Button>
                                </>
                            )}
                            <Button variant="outline" onClick={onClose}>
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
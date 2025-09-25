"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus, Minus } from "lucide-react";
import { Admission, AdmissionFormData, PaymentMethod, FeeStatus, toPaymentMethod } from "@/lib/types/index";
import { AdmissionStatus } from "@/lib/types";

interface AdmissionFormProps {
  admission?: Admission | null;
  onSubmit: (data: AdmissionFormData) => void;
  onClose: () => void;
}

const grades = ["Nursery", "Pre-K", "Kindergarten", "Grade 1"];
const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const statusOptions: AdmissionStatus[] = ["PENDING", "APPROVED", "REJECTED", "WAITLISTED"];
const feeStatusOptions: FeeStatus[] = ["PENDING", "PAID", "WAIVED"];
const paymentMethods: PaymentMethod[] = ["CASH", "BANK_TRANSFER", "CARD", "MOBILE_MONEY"];

// Grade-based fee structure
const gradeFeeStructure = {
  "Nursery": 3000,
  "Pre-K": 3000,
  "Kindergarten": 3000,
  "Grade 1": 3000
};

export function AdmissionForm({ admission, onSubmit, onClose }: AdmissionFormProps) {
  const [formData, setFormData] = useState({
    studentName: admission?.studentName || "",
    parentName: admission?.parentName || "",
    age: admission?.age.toString() || "",
    grade: admission?.grade || "",
    status: admission?.status || "PENDING",
    applicationDate: admission?.applicationDate || new Date().toISOString().split('T')[0],
    birthDate: admission?.birthDate || "",
    bloodGroup: admission?.bloodGroup || "",
    allergies: admission?.allergies || [] as string[],
    specialNeeds: admission?.specialNeeds || "",
    emergencyContact: admission?.emergencyContact || "",
    medicalConditions: admission?.medicalConditions || "",
    previousSchool: admission?.previousSchool || "",
    transportationNeeded: admission?.transportationNeeded || false,
    dietaryRestrictions: admission?.dietaryRestrictions || "",
    registrationFee: admission?.registrationFee?.toString() || "",
    feeStatus: admission?.feeStatus || "PENDING",
    paymentDate: admission?.paymentDate || "",
    paymentMethod: admission?.paymentMethod || "",
    currentAllergy: ""
  });

  const suggestedFee = formData.grade ? gradeFeeStructure[formData.grade as keyof typeof gradeFeeStructure] || 500 : 500;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert paymentMethod string to the correct type
    const paymentMethod = toPaymentMethod(formData.paymentMethod);
    
    onSubmit({
      studentName: formData.studentName,
      parentName: formData.parentName,
      age: parseInt(formData.age),
      grade: formData.grade,
      status: formData.status as Admission['status'],
      applicationDate: formData.applicationDate,
      birthDate: formData.birthDate,
      bloodGroup: formData.bloodGroup,
      allergies: formData.allergies,
      specialNeeds: formData.specialNeeds,
      emergencyContact: formData.emergencyContact,
      medicalConditions: formData.medicalConditions,
      previousSchool: formData.previousSchool,
      transportationNeeded: formData.transportationNeeded,
      dietaryRestrictions: formData.dietaryRestrictions,
      registrationFee: formData.registrationFee ? parseFloat(formData.registrationFee) : suggestedFee,
      feeStatus: formData.feeStatus as FeeStatus,
      paymentDate: formData.paymentDate || undefined,
      paymentMethod: paymentMethod // This is now properly typed
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-set registration fee based on grade selection
    if (name === "grade" && value && !formData.registrationFee) {
      const fee = gradeFeeStructure[value as keyof typeof gradeFeeStructure] || 500;
      setFormData(prev => ({
        ...prev,
        registrationFee: fee.toString()
      }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.checked
    }));
  };

  const addAllergy = () => {
    if (formData.currentAllergy.trim()) {
      setFormData(prev => ({
        ...prev,
        allergies: [...prev.allergies, prev.currentAllergy.trim()],
        currentAllergy: ""
      }));
    }
  };

  const removeAllergy = (index: number) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {admission ? "Edit Admission" : "New Admission Application"}
          </h2>
          <Button variant="ghost" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Student Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Student Name *</label>
              <Input
                name="studentName"
                value={formData.studentName}
                onChange={handleChange}
                required
                placeholder="Student's full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Parent/Guardian Name *</label>
              <Input
                name="parentName"
                value={formData.parentName}
                onChange={handleChange}
                required
                placeholder="Parent's full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Age *</label>
              <Input
                name="age"
                type="number"
                value={formData.age}
                onChange={handleChange}
                required
                min="2"
                max="6"
                placeholder="Age"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Grade *</label>
              <select
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
                required
              >
                <option value="">Select grade</option>
                {grades.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Birth Date *</label>
              <Input
                name="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Application Date *</label>
              <Input
                name="applicationDate"
                type="date"
                value={formData.applicationDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Registration Fee Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Registration Fee</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Amount (P)</label>
                <Input
                  name="registrationFee"
                  type="number"
                  value={formData.registrationFee}
                  onChange={handleChange}
                  placeholder="Enter amount"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Suggested: P{suggestedFee} for {formData.grade || "selected grade"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Fee Status</label>
                <select
                  name="feeStatus"
                  value={formData.feeStatus}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  {feeStatusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              {formData.feeStatus === "PAID" && (
                <div>
                  <label className="block text-sm font-medium mb-2">Payment Date</label>
                  <Input
                    name="paymentDate"
                    type="date"
                    value={formData.paymentDate}
                    onChange={handleChange}
                  />
                </div>
              )}
            </div>

            {formData.feeStatus === "PAID" && (
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">Payment Method</label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Select method</option>
                  {paymentMethods.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Medical Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Blood Group</label>
              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Select blood group</option>
                {bloodGroups.map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Allergies</label>
              <div className="flex gap-2">
                <Input
                  value={formData.currentAllergy}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentAllergy: e.target.value }))}
                  placeholder="Add allergy"
                />
                <Button type="button" onClick={addAllergy}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="mt-2 space-y-1">
                {formData.allergies.map((allergy, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-100 px-3 py-1 rounded">
                    <span>{allergy}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAllergy(index)}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Dietary Restrictions</label>
              <Input
                name="dietaryRestrictions"
                value={formData.dietaryRestrictions}
                onChange={handleChange}
                placeholder="e.g., Vegetarian, Vegan, etc."
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="transportationNeeded"
                checked={formData.transportationNeeded}
                onChange={handleCheckboxChange}
                className="mr-2"
              />
              <label className="text-sm font-medium">Transportation Needed</label>
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <label className="block text-sm font-medium mb-2">Medical Conditions</label>
            <textarea
              name="medicalConditions"
              value={formData.medicalConditions}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Any existing medical conditions"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Special Needs/Requirements</label>
            <textarea
              name="specialNeeds"
              value={formData.specialNeeds}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Any special needs or requirements"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Previous School (if any)</label>
            <Input
              name="previousSchool"
              value={formData.previousSchool}
              onChange={handleChange}
              placeholder="Previous school name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Emergency Contact *</label>
            <Input
              name="emergencyContact"
              value={formData.emergencyContact}
              onChange={handleChange}
              required
              placeholder="Emergency phone number"
            />
          </div>

          {admission && (
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {admission ? "Update Application" : "Submit Application"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
import { z } from "zod";

export const subjectSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Subject name is required!" }),
  teachers: z.array(z.string()), //teacher ids
});

export type SubjectSchema = z.infer<typeof subjectSchema>;

export const classSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Subject name is required!" }),
  capacity: z.coerce.number().min(1, { message: "Capacity name is required!" }),
  gradeId: z.coerce.number().min(1, { message: "Grade name is required!" }),
  supervisorId: z.coerce.string().optional(),
});

export type ClassSchema = z.infer<typeof classSchema>;

export const teacherSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  address: z.string(),
  img: z.string().optional(),
  bloodType: z.string().min(1, { message: "Blood Type is required!" }),
  birthday: z.coerce.date({ message: "Birthday is required!" }),
  sex: z.enum(["MALE", "FEMALE"], { message: "Sex is required!" }),
  subjects: z.array(z.string()).optional(), // subject ids
});

export type TeacherSchema = z.infer<typeof teacherSchema>;

export const studentSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(8, "Password must be at least 8 characters").optional().or(z.literal('')),
  name: z.string().min(1, "Name is required"),
  surname: z.string().min(1, "Surname is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  bloodType: z.string().min(1, "Blood type is required"),
  sex: z.enum(["MALE", "FEMALE"]),
  birthday: z.string().min(1, "Birthday is required"), 
  gradeId: z.string().min(1, "Grade is required"), 
  classId: z.string().min(1, "Class is required"), 
  parentId: z.string().optional(), 
  img: z.string().optional(),
   id: z.string().optional(),
});

export type StudentSchema = z.infer<typeof studentSchema>;

export const examSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title name is required!" }),
  startTime: z.coerce.date({ message: "Start time is required!" }),
  endTime: z.coerce.date({ message: "End time is required!" }),
  lessonId: z.coerce.number({ message: "Lesson is required!" }),
});

export type ExamSchema = z.infer<typeof examSchema>;


export const AnnouncementSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  priority: z.enum(["low", "normal", "high"]).default("normal"),
  classId: z.string().optional().nullable(), 
});

export type AnnouncementSchema = z.infer<typeof examSchema>;


export const eventSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  classId: z.union([z.number(), z.string()]).optional().nullable(),
}).refine((data) => new Date(data.startTime) < new Date(data.endTime), {
  message: "End time must be after start time",
  path: ["endTime"],
});

export type EventSchema = z.infer<typeof eventSchema>;


export const AdmissionSchema = z.object({
  id: z.string().optional(),
  studentName: z.string().min(1, "Student name is required"),
  parentName: z.string().min(1, "Parent name is required"),
  age: z.number().min(2).max(6, "Age must be between 2 and 6"),
  grade: z.string().min(1, "Grade is required"),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'WAITLISTED']),
  applicationDate: z.string().min(1, "Application date is required"),
  birthDate: z.string().min(1, "Birth date is required"),
  bloodGroup: z.string().optional().nullable(),
  allergies: z.array(z.string()).default([]),
  specialNeeds: z.string().optional().nullable(),
  emergencyContact: z.string().min(1, "Emergency contact is required"),
  medicalConditions: z.string().optional().nullable(),
  previousSchool: z.string().optional().nullable(),
  transportationNeeded: z.boolean().default(false),
  dietaryRestrictions: z.string().optional().nullable(),
  registrationFee: z.number().min(0, "Fee cannot be negative").optional().nullable(),
  feeStatus: z.enum(['PENDING', 'PAID', 'WAIVED']).default('PENDING'),
  paymentDate: z.string().optional().nullable(), // Make optional and nullable
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'CARD', 'MOBILE_MONEY']).optional().nullable(), // Make optional and nullable
});

export type AdmissionFormData = z.infer<typeof AdmissionSchema>;


export const FeeCategorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Fee category name is required"),
  description: z.string().optional(),
  amount: z.number().min(0, "Amount must be positive"),
  frequency: z.enum(['ONE_TIME', 'MONTHLY', 'QUARTERLY', 'YEARLY']),
  applicableGrades: z.array(z.number()),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional().nullable(),
});

export type FeeCategorySchemaType = z.infer<typeof FeeCategorySchema>;

export const StudentFeeSchema = z.object({
  id: z.string().optional(),
  studentId: z.string().min(1, "Student is required"),
  feeCategoryId: z.string().min(1, "Fee category is required"),
  amount: z.number().min(0, "Amount must be positive"),
  dueDate: z.string().min(1, "Due date is required"),
  paid: z.boolean().default(false),
  paidDate: z.string().optional().nullable(),
});

export type StudentFeeSchemaType = z.infer<typeof StudentFeeSchema>;


export const PostSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required").max(200),
  slug: z.string().min(1, "Slug is required").max(200).regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().max(300).optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  imagePublicId: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
  authorId: z.string(),
});

export type PostFormData = z.infer<typeof PostSchema>;
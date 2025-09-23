"use server";

import { revalidatePath } from "next/cache";
import {
  ClassSchema,
  ExamSchema,
  StudentSchema,
  SubjectSchema,
  TeacherSchema,
  AnnouncementSchema,
  EventSchema,
  AdmissionSchema, type AdmissionFormData,
  StudentFeeSchema,
  FeeCategorySchema
} from "./formValidationSchemas";

import prisma from "./prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { ActionState } from "./types/index";
import { AdmissionFeeUpdate } from "./types";
import { convertToAdmission, Admission, Expense } from "./types/index";
import { FeeCategory, StudentFee, TransactionStatus } from "@prisma/client";
import { InvoiceStatus, PaymentMethod } from "@prisma/client";
import { StudentFeeWithDetails } from "@/app/(dashboard)/list/finance/fees/page";
import { uploadImage, deleteImage } from './cloudinary';


type CurrentState = { success: boolean; error: boolean };

interface FinancialReportData {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  feeCollectionRate: number;
  outstandingFees: number;
  expenseBreakdown: { category: string; amount: number; percentage: number }[];
  revenueTrends: { month: string; revenue: number; expenses: number }[];
  topStudents: { name: string; grade: string; paid: number }[];
}

interface ReportFilters {
  startDate?: Date;
  endDate?: Date;
  category?: string;
  studentId?: string;
  classId?: number;
  gradeId?: number;
}

const getClerkClient = async () => {
  return await clerkClient();
};


export const getParents = async (params: {
  page: number;
  search?: string;
  itemPerPage?: number;
}) => {
  try {
    const { page = 1, search = '', itemPerPage = 10 } = params;

    const query: any = {};
    
    if (search) {
      query.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    const [data, count] = await prisma.$transaction([
      prisma.parent.findMany({
        where: query,
        include: {
          students: true,
        },
        take: itemPerPage,
        skip: itemPerPage * (page - 1),
      }),
      prisma.parent.count({ where: query }),
    ]);

    return {
      success: true,
      data,
      count,
    };
  } catch (error) {
    console.error('Error fetching parents:', error);
    return {
      success: false,
      error: 'Failed to fetch parents',
      data: [],
      count: 0,
    };
  }
};

export const createSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    await prisma.subject.create({
      data: {
        name: data.name,
        teachers: {
          connect: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    await prisma.subject.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        teachers: {
          set: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteSubject = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.subject.delete({
      where: {
        id: parseInt(id),
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createClass = async (
  currentState: CurrentState,
  data: ClassSchema
) => {
  try {
    await prisma.class.create({
      data,
    });

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateClass = async (
  currentState: CurrentState,
  data: ClassSchema
) => {
  try {
    await prisma.class.update({
      where: {
        id: data.id,
      },
      data,
    });

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteClass = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.class.delete({
      where: {
        id: parseInt(id),
      },
    });

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};



export const createTeacher = async (
  prevState: { success: boolean; error: boolean; message?: string },
  formData: FormData
): Promise<{ success: boolean; error: boolean; message?: string }> => {
  try {
    const data = {
      username: formData.get('username') as string,
      password: formData.get('password') as string,
      name: formData.get('name') as string,
      surname: formData.get('surname') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      bloodType: formData.get('bloodType') as string,
      sex: formData.get('sex') as "MALE" | "FEMALE",
      birthday: formData.get('birthday') as string,
      img: formData.get('img') as File | null,
      subjects: formData.get('subjects') as string,
      classes: formData.get('classes') as string,
    };

    console.log('Received form data:', {
      username: data.username,
      hasPassword: !!data.password,
      name: data.name,
      surname: data.surname,
      email: data.email,
      sex: data.sex,
      birthday: data.birthday
    });

    const requiredFields = ['username', 'password', 'name', 'surname', 'bloodType', 'birthday', 'sex'];
    const missingFields = requiredFields.filter(field => !data[field as keyof typeof data]);
    
    if (missingFields.length > 0) {
      return {
        success: false,
        error: true,
        message: `Missing required fields: ${missingFields.join(', ')}`
      };
    }

    if (data.email && !/\S+@\S+\.\S+/.test(data.email)) {
      return {
        success: false,
        error: true,
        message: "Invalid email format"
      };
    }

    if (data.password.length < 8) {
      return {
        success: false,
        error: true,
        message: "Password must be at least 8 characters long"
      };
    }

    const client = await getClerkClient();
    
    const userData: any = {
      username: data.username.trim(),
      password: data.password,
      first_name: data.name.substring(0, 50).trim(), 
      last_name: data.surname.substring(0, 50).trim(), 
      public_metadata: { role: "teacher" }, 
    };

    if (data.email && data.email.trim()) {
      userData.email_address = data.email.trim(); 
    }

    console.log('Creating Clerk user with data:', {
      username: userData.username,
      first_name: userData.first_name,
      last_name: userData.last_name,
      hasEmail: !!userData.email_address,
      email: userData.email_address
    });

    let user;
    try {
      user = await client.users.createUser(userData);
      console.log('Clerk user created successfully:', user.id);
    } catch (clerkError: any) {
      console.error('Clerk user creation failed:', clerkError);
      
      if (clerkError.errors) {
        clerkError.errors.forEach((error: any, index: number) => {
          console.error(`Clerk error ${index + 1}:`, {
            code: error.code,
            message: error.message,
            longMessage: error.long_message,
            meta: error.meta
          });
        });
      }
      
      if (clerkError.errors?.[0]?.code === 'form_identifier_exists') {
        return { 
          success: false, 
          error: true,
          message: "Username or email already exists" 
        };
      }
      
      if (clerkError.errors?.[0]?.code === 'form_password_pwned') {
        return { 
          success: false, 
          error: true,
          message: "Password is too common. Please choose a stronger password." 
        };
      }
      
      if (clerkError.errors?.[0]?.code === 'form_password_length_too_short') {
        return { 
          success: false, 
          error: true,
          message: "Password is too short. Must be at least 8 characters." 
        };
      }
      
      const errorMessage = clerkError.errors?.[0]?.message || 'User creation failed';
      return { 
        success: false, 
        error: true,
        message: `Registration failed: ${errorMessage}` 
      };
    }

    const subjectIds = data.subjects ? data.subjects.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)) : [];
    const classIds = data.classes ? data.classes.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)) : [];

    let imageUrl = null;
    if (data.img && data.img.size > 0) {
      try {
        const uploadResult = await uploadImage(data.img);
        imageUrl = uploadResult.url;
      } catch (uploadError) {
        console.error('Image upload failed:', uploadError);
        // Continue without image if upload fails
      }
    }

    await prisma.teacher.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: imageUrl,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: new Date(data.birthday),
        subjects: {
          connect: subjectIds.map(subjectId => ({ id: subjectId }))
        },
        classes: {
          connect: classIds.map(classId => ({ id: classId }))
        }
      },
    });

    revalidatePath("/list/teachers");
    return { 
      success: true, 
      error: false, 
      message: "Teacher created successfully" 
    };
    
  } catch (err: any) {
    console.error('Error creating teacher:', err);
    
    if (err.code === 'P2002') {
      return { 
        success: false, 
        error: true,
        message: "Username or email already exists" 
      };
    }
    
    return { 
      success: false, 
      error: true,
      message: err.message || "Failed to create teacher" 
    };
  }
};



export const updateTeacher = async (
  prevState: { success: boolean; error: boolean; message?: string },
  formData: FormData
): Promise<{ success: boolean; error: boolean; message?: string }> => {
  try {
    const id = formData.get('id') as string;
    if (!id) {
      return { 
        success: false, 
        error: true,
        message: "Teacher ID is required for update" 
      };
    }

    // Extract data from FormData
    const data = {
      username: formData.get('username') as string,
      password: formData.get('password') as string,
      name: formData.get('name') as string,
      surname: formData.get('surname') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      bloodType: formData.get('bloodType') as string,
      sex: formData.get('sex') as "MALE" | "FEMALE",
      birthday: new Date(formData.get('birthday') as string),
      img: formData.get('img') as File | null,
      existingImageUrl: formData.get('existingImageUrl') as string,
      subjects: formData.get('subjects') as string,
      classes: formData.get('classes') as string,
    };

    // Validate required fields
    const requiredFields = ['username', 'name', 'surname', 'bloodType', 'birthday', 'sex'];
    const missingFields = requiredFields.filter(field => !data[field as keyof typeof data]);
    
    if (missingFields.length > 0) {
      return {
        success: false,
        error: true,
        message: `Missing required fields: ${missingFields.join(', ')}`
      };
    }

    const client = await getClerkClient();
    
    // Update user in Clerk
    const updateData: any = {
      username: data.username,
      firstName: data.name,
      lastName: data.surname,
    };

    // Only update password if provided
    if (data.password && data.password !== "") {
      updateData.password = data.password;
    }

    // Update email if provided
    if (data.email) {
      updateData.emailAddress = [data.email];
    }

    await client.users.updateUser(id, updateData);

    // Parse subjects and classes
    const subjectIds = data.subjects ? data.subjects.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)) : [];
    const classIds = data.classes ? data.classes.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)) : [];

    // Handle image upload if a new image is provided
    let imageUrl = data.existingImageUrl;
    if (data.img && data.img.size > 0) {
      try {
        // Delete old image if exists
        if (data.existingImageUrl) {
          // You might want to extract public_id from the URL or store it separately
          // await deleteImage(publicId);
        }
        
        const uploadResult = await uploadImage(data.img);
        imageUrl = uploadResult.url;
      } catch (uploadError) {
        console.error('Image upload failed:', uploadError);
        return {
          success: false,
          error: true,
          message: "Failed to upload profile image"
        };
      }
    }

    // Update teacher in database
    await prisma.teacher.update({
      where: {
        id: id,
      },
      data: {
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: imageUrl,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        subjects: {
          set: subjectIds.map(subjectId => ({ id: subjectId }))
        },
        classes: {
          set: classIds.map(classId => ({ id: classId }))
        }
      },
    });

    revalidatePath("/list/teachers");
    return { 
      success: true, 
      error: false,
      message: "Teacher updated successfully" 
    };
    
  } catch (err: any) {
    console.error('Error updating teacher:', err);
    
    if (err.code === 'P2002') {
      return {
        success: false,
        error: true,
        message: "Username or email already exists"
      };
    }
    
    if (err.code === 'P2025') {
      return {
        success: false,
        error: true,
        message: "Teacher not found"
      };
    }
    
    return {
      success: false,
      error: true,
      message: err.message || "Failed to update teacher"
    };
  }
};




export const deleteTeacher = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    const client = await getClerkClient();
    await client.users.deleteUser(id);

    await prisma.teacher.delete({
      where: {
        id: id,
      },
    });

    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createStudent = async (
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> => {
  try {
    const data = {
      username: formData.get('username') as string,
      password: formData.get('password') as string,
      name: formData.get('name') as string,
      surname: formData.get('surname') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      bloodType: formData.get('bloodType') as string,
      sex: formData.get('sex') as "MALE" | "FEMALE",
      birthday: new Date(formData.get('birthday') as string),
      gradeId: Number(formData.get('gradeId')),
      classId: Number(formData.get('classId')),
      parentId: formData.get('parentId') as string,
      img: formData.get('img') as string,
    };

    console.log('Creating student with data:', data);

    const requiredFields = ['username', 'password', 'name', 'surname'];
    const missingFields = requiredFields.filter(field => !data[field as keyof typeof data]);
    
    if (missingFields.length > 0) {
      return {
        success: false,
        error: true,
        message: `Missing required fields: ${missingFields.join(', ')}`
      };
    }

    if (data.email && !/\S+@\S+\.\S+/.test(data.email)) {
      return {
        success: false,
        error: true,
        message: "Invalid email format"
      };
    }

    if (data.password.length < 8) {
      return {
        success: false,
        error: true,
        message: "Password must be at least 8 characters long"
      };
    }

    const classItem = await prisma.class.findUnique({
      where: { id: data.classId },
      include: { _count: { select: { students: true } } },
    });

    if (classItem && classItem.capacity === classItem._count.students) {
      return { 
        success: false, 
        error: true,
        message: "Class is at full capacity" 
      };
    }

    const client = await getClerkClient();
    
    const userData: any = {
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata: { role: "student" },
      skipPasswordChecks: true
    };

    if (data.email) {
      userData.emailAddress = [data.email];
    }

    console.log('Creating Clerk user with:', userData);

    let user;
    try {
      user = await client.users.createUser(userData);
      console.log('Clerk user created successfully:', user.id);
    } catch (clerkError: any) {
      console.error('Clerk user creation failed:', clerkError);
      
      if (clerkError.errors) {
        const errorMessages = clerkError.errors.map((error: any) => 
          `${error.message} (code: ${error.code})`
        ).join(', ');
        
        return { 
          success: false, 
          error: true,
          message: `User creation failed: ${errorMessages}` 
        };
      }
      
      throw clerkError;
    }

    await prisma.student.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        gradeId: data.gradeId,
        classId: data.classId,
        parentId: data.parentId,
      },
    });

    return { 
      success: true, 
      error: false,
      message: "Student created successfully" 
    };
    
  } catch (err: any) {
    console.error('Error creating student:', err);
    
    if (err.clerkError && err.errors) {
      const errorMessages = err.errors.map((error: any) => 
        `${error.message} (code: ${error.code})`
      ).join(', ');
      
      return { 
        success: false, 
        error: true,
        message: `Registration failed: ${errorMessages}` 
      };
    }
    
    if (err.code === 'P2002') {
      return { 
        success: false, 
        error: true,
        message: "Username or email already exists" 
      };
    }
    
    return { 
      success: false, 
      error: true,
      message: err.message || "Failed to create student" 
    };
  }
};


export const getStudents = async () => {
  try {
    const students = await prisma.student.findMany({
      include: {
        grade: {
          select: { level: true }
        },
        class: {
          select: { name: true }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return students.map(student => ({
      id: student.id,
      name: student.name,
      surname: student.surname,
      grade: student.grade,
      class: student.class
    }));
  } catch (err) {
    console.error('Error fetching students:', err);
    return [];
  }
};


export const updateStudent = async (
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> => {
  try {
    const data = {
      id: formData.get('id') as string,
      username: formData.get('username') as string,
      password: formData.get('password') as string,
      name: formData.get('name') as string,
      surname: formData.get('surname') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      bloodType: formData.get('bloodType') as string,
      sex: formData.get('sex') as "MALE" | "FEMALE",
      birthday: new Date(formData.get('birthday') as string),
      gradeId: Number(formData.get('gradeId')),
      classId: Number(formData.get('classId')),
      parentId: formData.get('parentId') as string,
      img: formData.get('img') as string,
    };

    if (!data.id) {
      return { 
        success: false, 
        error: true,
        message: "Student ID is required for update" 
      };
    }

    const classItem = await prisma.class.findUnique({
      where: { id: data.classId },
      include: { _count: { select: { students: true } } },
    });

    if (classItem && classItem.capacity === classItem._count.students) {
      const currentStudent = await prisma.student.findUnique({
        where: { id: data.id },
        select: { classId: true }
      });
      
      if (!currentStudent || currentStudent.classId !== data.classId) {
        return { 
          success: false, 
          error: true,
          message: "Class is at full capacity" 
        };
      }
    }

    const client = await getClerkClient();
    
    await client.users.updateUser(data.id, {
      username: data.username,
      ...(data.password && data.password !== "" && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });

    await prisma.student.update({
      where: {
        id: data.id,
      },
      data: {
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        gradeId: data.gradeId,
        classId: data.classId,
        parentId: data.parentId,
      },
    });

    return { 
      success: true, 
      error: false,
      message: "Student updated successfully" 
    };
    
  } catch (err: any) {
    console.error('Error updating student:', err);
    
    if (err.clerkError && err.errors) {
      const errorMessages = err.errors.map((error: any) => 
        `${error.message}`
      ).join(', ');
      
      return { 
        success: false, 
        error: true,
        message: `Update failed: ${errorMessages}` 
      };
    }
    
    return { 
      success: false, 
      error: true,
      message: err.message || "Failed to update student" 
    };
  }
};

export const deleteStudent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    const client = await getClerkClient();
    await client.users.deleteUser(id);

    await prisma.student.delete({
      where: {
        id: id,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createExam = async (
  currentState: CurrentState,
  data: ExamSchema
) => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    if (role === "teacher") {
      const teacherLesson = await prisma.lesson.findFirst({
        where: {
          teacherId: userId!,
          id: data.lessonId,
        },
      });

      if (!teacherLesson) {
        return { success: false, error: true };
      }
    }

    await prisma.exam.create({
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateExam = async (
  currentState: CurrentState,
  data: ExamSchema
) => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    if (role === "teacher") {
      const teacherLesson = await prisma.lesson.findFirst({
        where: {
          teacherId: userId!,
          id: data.lessonId,
        },
      });

      if (!teacherLesson) {
        return { success: false, error: true };
      }
    }

    await prisma.exam.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteExam = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;

  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    await prisma.exam.delete({
      where: {
        id: parseInt(id),
        ...(role === "teacher" ? { lesson: { teacherId: userId! } } : {}),
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};


export const createAnnouncement = async (
  currentState: CurrentState,
  data: any
) => {
  try {
    await prisma.announcement.create({
      data: {
        title: data.title,
        description: data.title,
        content: data.content,
        date: new Date(),
        classId: data.classId ? parseInt(data.classId) : null,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/announcements");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateAnnouncement = async (
  currentState: CurrentState,
  data: any
) => {
  try {
    await prisma.announcement.update({
      where: {
        id: parseInt(data.id),
      },
      data: {
        title: data.title,
        description: data.title,
        content: data.content,
        classId: data.classId ? parseInt(data.classId) : null,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/announcements");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};


export const deleteAnnouncement = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return { success: false, error: true };
    }

    const announcement = await prisma.announcement.findUnique({
      where: { id: parseInt(id) },
    });

    if (!announcement ) {
      return { success: false, error: true };
    }

    await prisma.announcement.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/announcements");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createEvent = async (
  currentState: CurrentState,
  data: EventSchema
) => {
  try {
    await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        classId: data.classId ? Number(data.classId) : null,
      },
    });

    revalidatePath("/events");
    revalidatePath("/dashboard");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateEvent = async (
  currentState: CurrentState,
  data: EventSchema
) => {
  try {
    await prisma.event.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        description: data.description,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        classId: data.classId ? Number(data.classId) : null,
      },
    });

    revalidatePath("/events");
    revalidatePath("/dashboard");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteEvent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  
  try {
    await prisma.event.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/events");
    revalidatePath("/dashboard");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};



export const createAdmission = async (
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> => {
  try {
    const rawData = {
      studentName: formData.get('studentName') as string,
      parentName: formData.get('parentName') as string,
      age: Number(formData.get('age')),
      grade: formData.get('grade') as string,
      status: formData.get('status') as 'PENDING' | 'APPROVED' | 'REJECTED' | 'WAITLISTED',
      applicationDate: formData.get('applicationDate') as string,
      birthDate: formData.get('birthDate') as string,
      bloodGroup: formData.get('bloodGroup') as string,
      allergies: JSON.parse(formData.get('allergies') as string || '[]'),
      specialNeeds: formData.get('specialNeeds') as string,
      emergencyContact: formData.get('emergencyContact') as string,
      medicalConditions: formData.get('medicalConditions') as string,
      previousSchool: formData.get('previousSchool') as string,
      transportationNeeded: formData.get('transportationNeeded') === 'true',
      dietaryRestrictions: formData.get('dietaryRestrictions') as string,
      registrationFee: formData.get('registrationFee') ? Number(formData.get('registrationFee')) : null,
      feeStatus: formData.get('feeStatus') as 'PENDING' | 'PAID' | 'WAIVED',
      paymentDate: formData.get('paymentDate') as string || null, // Handle empty values
      paymentMethod: formData.get('paymentMethod') as 'CASH' | 'BANK_TRANSFER' | 'CARD' | 'MOBILE_MONEY' || null, // Handle empty values
    };

    const validatedData = AdmissionSchema.parse(rawData);

    await prisma.admission.create({
      data: {
        studentName: validatedData.studentName,
        parentName: validatedData.parentName,
        age: validatedData.age,
        grade: validatedData.grade,
        status: validatedData.status,
        applicationDate: new Date(validatedData.applicationDate),
        birthDate: new Date(validatedData.birthDate),
        bloodGroup: validatedData.bloodGroup || null,
        allergies: validatedData.allergies,
        specialNeeds: validatedData.specialNeeds || null,
        emergencyContact: validatedData.emergencyContact,
        medicalConditions: validatedData.medicalConditions || null,
        previousSchool: validatedData.previousSchool || null,
        transportationNeeded: validatedData.transportationNeeded,
        dietaryRestrictions: validatedData.dietaryRestrictions || null,
        registrationFee: validatedData.registrationFee || null,
        feeStatus: validatedData.feeStatus,
        paymentDate: validatedData.paymentDate ? new Date(validatedData.paymentDate) : null,
        paymentMethod: validatedData.paymentMethod || null,
      },
    });

    return { 
      success: true, 
      error: false,
      message: "Admission application submitted successfully" 
    };
  } catch (err: any) {
    console.error('Error creating admission:', err);
    return { 
      success: false, 
      error: true,
      message: err.message || "Failed to submit admission application" 
    };
  }
};



export const updateAdmission = async (
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> => {
  try {
    const id = formData.get('id') as string;
    if (!id) {
      return { 
        success: false, 
        error: true,
        message: "Admission ID is required" 
      };
    }

    const rawData = {
      studentName: formData.get('studentName') as string,
      parentName: formData.get('parentName') as string,
      age: Number(formData.get('age')),
      grade: formData.get('grade') as string,
      status: formData.get('status') as 'PENDING' | 'APPROVED' | 'REJECTED' | 'WAITLISTED',
      applicationDate: formData.get('applicationDate') as string,
      birthDate: formData.get('birthDate') as string,
      bloodGroup: formData.get('bloodGroup') as string,
      allergies: JSON.parse(formData.get('allergies') as string || '[]'),
      specialNeeds: formData.get('specialNeeds') as string,
      emergencyContact: formData.get('emergencyContact') as string,
      medicalConditions: formData.get('medicalConditions') as string,
      previousSchool: formData.get('previousSchool') as string,
      transportationNeeded: formData.get('transportationNeeded') === 'true',
      dietaryRestrictions: formData.get('dietaryRestrictions') as string,
      registrationFee: formData.get('registrationFee') ? Number(formData.get('registrationFee')) : null,
      feeStatus: formData.get('feeStatus') as 'PENDING' | 'PAID' | 'WAIVED',
      paymentDate: formData.get('paymentDate') as string || null,
      paymentMethod: formData.get('paymentMethod') as 'CASH' | 'BANK_TRANSFER' | 'CARD' | 'MOBILE_MONEY' || null,
    };

    const validatedData = AdmissionSchema.parse(rawData);

    await prisma.admission.update({
      where: { id },
      data: {
        studentName: validatedData.studentName,
        parentName: validatedData.parentName,
        age: validatedData.age,
        grade: validatedData.grade,
        status: validatedData.status,
        applicationDate: new Date(validatedData.applicationDate),
        birthDate: new Date(validatedData.birthDate),
        bloodGroup: validatedData.bloodGroup || null,
        allergies: validatedData.allergies,
        specialNeeds: validatedData.specialNeeds || null,
        emergencyContact: validatedData.emergencyContact,
        medicalConditions: validatedData.medicalConditions || null,
        previousSchool: validatedData.previousSchool || null,
        transportationNeeded: validatedData.transportationNeeded,
        dietaryRestrictions: validatedData.dietaryRestrictions || null,
        registrationFee: validatedData.registrationFee || null,
        feeStatus: validatedData.feeStatus,
        paymentDate: validatedData.paymentDate ? new Date(validatedData.paymentDate) : null,
        paymentMethod: validatedData.paymentMethod || null,
      },
    });

    return { 
      success: true, 
      error: false,
      message: "Admission application updated successfully" 
    };
  } catch (err: any) {
    console.error('Error updating admission:', err);
    return { 
      success: false, 
      error: true,
      message: err.message || "Failed to update admission application" 
    };
  }
};



export const deleteAdmission = async (id: string) => {
  try {
    await prisma.admission.delete({
      where: { id }
    });
    return { success: true, error: false };
  } catch (err) {
    console.error('Error deleting admission:', err);
    return { success: false, error: true };
  }
};

export const getAdmissions = async (): Promise<Admission[]> => {
  try {
    const admissions = await prisma.admission.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return admissions.map(convertToAdmission);
  } catch (err) {
    console.error('Error fetching admissions:', err);
    return [];
  }
};

export const updateAdmissionStatus = async (
  admissionId: string,
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'WAITLISTED'
) => {
  try {
    await prisma.admission.update({
      where: { id: admissionId },
      data: { status }
    });
    return { success: true, error: false };
  } catch (err) {
    console.error('Error updating admission status:', err);
    return { success: false, error: true };
  }
};

export const updateAdmissionFee = async (
  admissionId: string,
  feeData: AdmissionFeeUpdate
) => {
  try {
    const data: any = { ...feeData };
    if (feeData.paymentDate) {
      data.paymentDate = new Date(feeData.paymentDate);
    }

    await prisma.admission.update({
      where: { id: admissionId },
      data
    });
    return { success: true, error: false };
  } catch (err) {
    console.error('Error updating admission fee:', err);
    return { success: false, error: true };
  }
};

export const createFeeCategory = async (
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> => {
  try {
    const rawData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      amount: Number(formData.get('amount')),
      frequency: formData.get('frequency') as 'ONE_TIME' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY',
      applicableGrades: JSON.parse(formData.get('applicableGrades') as string || '[]'),
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string || null,
    };

    const validatedData = FeeCategorySchema.parse(rawData);

    await prisma.feeCategory.create({
      data: {
        name: validatedData.name,
        description: validatedData.description || null,
        amount: validatedData.amount,
        frequency: validatedData.frequency,
        applicableGrades: {
          connect: validatedData.applicableGrades.map(gradeId => ({ id: gradeId }))
        },
        startDate: new Date(validatedData.startDate),
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
      },
    });

    revalidatePath("/list/finance/fees");
    return { 
      success: true, 
      error: false,
      message: "Fee category created successfully" 
    };
  } catch (err: any) {
    console.error('Error creating fee category:', err);
    return { 
      success: false, 
      error: true,
      message: err.message || "Failed to create fee category" 
    };
  }
};

export const updateFeeCategory = async (
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> => {
  try {
    const id = formData.get('id') as string;
    if (!id) {
      return { 
        success: false, 
        error: true,
        message: "Fee category ID is required" 
      };
    }

    const rawData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      amount: Number(formData.get('amount')),
      frequency: formData.get('frequency') as 'ONE_TIME' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY',
      applicableGrades: JSON.parse(formData.get('applicableGrades') as string || '[]'),
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string || null,
    };

    const validatedData = FeeCategorySchema.parse(rawData);

    await prisma.feeCategory.update({
      where: { id },
      data: {
        name: validatedData.name,
        description: validatedData.description || null,
        amount: validatedData.amount,
        frequency: validatedData.frequency,
        applicableGrades: {
          set: validatedData.applicableGrades.map(gradeId => ({ id: gradeId }))
        },
        startDate: new Date(validatedData.startDate),
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
      },
    });

    revalidatePath("/list/finance/fees");
    return { 
      success: true, 
      error: false,
      message: "Fee category updated successfully" 
    };
  } catch (err: any) {
    console.error('Error updating fee category:', err);
    return { 
      success: false, 
      error: true,
      message: err.message || "Failed to update fee category" 
    };
  }
};

export const deleteFeeCategory = async (id: string) => {
  try {
    await prisma.feeCategory.delete({
      where: { id }
    });
    revalidatePath("/list/finance/fees");
    return { success: true, error: false };
  } catch (err) {
    console.error('Error deleting fee category:', err);
    return { success: false, error: true };
  }
};

export const getFeeCategories = async (): Promise<FeeCategory[]> => {
  try {
    const feeCategories = await prisma.feeCategory.findMany({
      include: {
        applicableGrades: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return feeCategories;
  } catch (err) {
    console.error('Error fetching fee categories:', err);
    return [];
  }
};

export const createStudentFee = async (
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> => {
  try {
    const rawData = {
      studentId: formData.get('studentId') as string,
      feeCategoryId: formData.get('feeCategoryId') as string,
      amount: Number(formData.get('amount')),
      dueDate: formData.get('dueDate') as string,
    };

    const validatedData = StudentFeeSchema.parse({
      ...rawData,
      paid: false
    });

    await prisma.studentFee.create({
      data: {
        amount: validatedData.amount,
        dueDate: new Date(validatedData.dueDate),
        student: {
          connect: { id: validatedData.studentId }
        },
        feeCategory: {
          connect: { id: validatedData.feeCategoryId }
        },
      },
    });

    revalidatePath("/list/finance/fees");
    return { 
      success: true, 
      error: false,
      message: "Student fee assigned successfully" 
    };
  } catch (err: any) {
    console.error('Error creating student fee:', err);
    return { 
      success: false, 
      error: true,
      message: err.message || "Failed to assign student fee" 
    };
  }
};

export const updateStudentFeeStatus = async (
  studentFeeId: string,
  paid: boolean
) => {
  try {
    await prisma.studentFee.update({
      where: { id: studentFeeId },
      data: {
        paid,
        paidDate: paid ? new Date() : null,
      },
    });

    revalidatePath("/list/finance/fees");
    return { success: true, error: false };
  } catch (err) {
    console.error('Error updating student fee status:', err);
    return { success: false, error: true };
  }
};

export const getStudentFees = async (): Promise<StudentFeeWithDetails[]> => {
  try {
    const studentFees = await prisma.studentFee.findMany({
      include: {
        student: {
          select: {
            name: true,
            surname: true,
            grade: {
              select: { level: true }
            },
            class: {
              select: { name: true }
            }
          }
        },
        feeCategory: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        dueDate: 'asc'
      }
    });

    return studentFees.map(fee => ({
      id: fee.id,
      studentName: `${fee.student.name} ${fee.student.surname}`,
      grade: fee.student.grade.level,
      className: fee.student.class.name,
      feeCategory: fee.feeCategory.name,
      amount: fee.amount,
      dueDate: fee.dueDate.toISOString(),
      paid: fee.paid,
      paidDate: fee.paidDate?.toISOString(),
    }));
  } catch (err) {
    console.error('Error fetching student fees:', err);
    return [];
  }
};




export const createInvoice = async (
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> => {
  try {
    const rawData = {
      studentId: formData.get('studentId') as string,
      items: JSON.parse(formData.get('items') as string),
      dueDate: formData.get('dueDate') as string,
      issueDate: formData.get('issueDate') as string,
    };

    const totalAmount = rawData.items.reduce((sum: number, item: any) => 
      sum + (item.amount * item.quantity), 0);

    const latestInvoice = await prisma.invoice.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { invoiceNumber: true }
    });

    let invoiceNumber = "INV-2024-001";
    if (latestInvoice?.invoiceNumber) {
      const match = latestInvoice.invoiceNumber.match(/\d+$/);
      if (match) {
        const num = parseInt(match[0]) + 1;
        invoiceNumber = `INV-2024-${num.toString().padStart(3, '0')}`;
      }
    }

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        totalAmount,
        dueDate: new Date(rawData.dueDate),
        status: 'PENDING' as InvoiceStatus,
        student: {
          connect: { id: rawData.studentId }
        },
        items: {
          create: rawData.items.map((item: any) => ({
            description: item.description,
            amount: item.amount,
            quantity: item.quantity
          }))
        }
      },
      include: {
        student: {
          include: {
            grade: true,
            class: true
          }
        },
        items: true
      }
    });

    await prisma.studentFinance.upsert({
      where: { studentId: rawData.studentId },
      update: {
        totalDue: { increment: totalAmount }
      },
      create: {
        studentId: rawData.studentId,
        totalDue: totalAmount,
        balance: -totalAmount
      }
    });

    await updateSchoolBalance(totalAmount, 'INCOME');

    revalidatePath("/finance/invoices");
    return { 
      success: true, 
      error: false,
      message: "Invoice created successfully",
      data: invoice
    };
  } catch (err: any) {
    console.error('Error creating invoice:', err);
    return { 
      success: false, 
      error: true,
      message: err.message || "Failed to create invoice" 
    };
  }
};


export const getInvoices = async (): Promise<any[]> => {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        student: {
          select: {
            id: true, 
            name: true,
            surname: true,
            grade: {
              select: { level: true }
            },
            class: {
              select: { name: true }
            }
          }
        },
        items: true,
        transactions: {
          where: {
            status: 'COMPLETED'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return invoices.map(invoice => ({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      studentName: `${invoice.student.name} ${invoice.student.surname}`,
      studentId: invoice.student.id,
      grade: invoice.student.grade.level,
      className: invoice.student.class.name,
      totalAmount: invoice.totalAmount,
      dueDate: invoice.dueDate.toISOString(),
      issueDate: invoice.createdAt.toISOString(),
      status: invoice.status, 
      items: invoice.items,
      paidAmount: invoice.transactions.reduce((sum, t) => sum + t.amount, 0)
    }));
  } catch (err) {
    console.error('Error fetching invoices:', err);
    return [];
  }
};



export const updateInvoiceStatus = async (invoiceId: string, status: InvoiceStatus): Promise<ActionState> => {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: true, message: "Unauthorized" };
    }

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status }
    });

    revalidatePath("/finance/invoices");
    return { success: true, error: false, message: "Invoice status updated successfully" };
  } catch (error: any) {
    console.error('Error updating invoice status:', error);
    return { 
      success: false, 
      error: true,
      message: error.message || "Failed to update invoice status" 
    };
  }
};




export const recordPayment = async (
  invoiceId: string,
  amount: number,
  method: PaymentMethod,
  reference: string
) => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { transactions: true }
    });

    if (!invoice) {
      return { success: false, error: true, message: "Invoice not found" };
    }

    const totalPaid = invoice.transactions
      .filter(t => t.status === 'COMPLETED')
      .reduce((sum, t) => sum + t.amount, 0);

    if (totalPaid + amount > invoice.totalAmount) {
      return { success: false, error: true, message: "Payment exceeds invoice amount" };
    }

    const transaction = await prisma.transaction.create({
      data: {
        type: 'INCOME',
        category: 'TUITION_PAYMENT',
        amount,
        paymentMethod: method,
        reference,
        status: 'COMPLETED',
        invoice: { connect: { id: invoiceId } },
        student: { connect: { id: invoice.studentId } }
      }
    });

    await prisma.studentFinance.upsert({
      where: { studentId: invoice.studentId },
      update: {
        totalPaid: { increment: amount },
        totalDue: { decrement: amount },
        balance: { increment: amount }
      },
      create: {
        studentId: invoice.studentId,
        totalPaid: amount,
        totalDue: invoice.totalAmount - amount,
        balance: amount - invoice.totalAmount
      }
    });

    if (totalPaid + amount >= invoice.totalAmount) {
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: 'PAID' }
      });
    }

     await updateSchoolBalance(amount, 'INCOME');

    revalidatePath("/finance/invoices");
    return { 
      success: true, 
      error: false,
      message: "Payment recorded successfully",
      data: transaction
    };
  } catch (err: any) {
    console.error('Error recording payment:', err);
    return { 
      success: false, 
      error: true,
      message: err.message || "Failed to record payment" 
    };
  }
};





export const createExpense = async (
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> => {
  try {
    const rawData = {
      description: formData.get('description') as string,
      amount: Number(formData.get('amount')),
      category: formData.get('category') as string,
      date: formData.get('date') as string,
      vendor: formData.get('vendor') as string,
      paymentMethod: formData.get('paymentMethod') as PaymentMethod,
      status: formData.get('status') as TransactionStatus,
      receiptUrl: formData.get('receiptUrl') as string || null,
    };

    const existingVendor = await prisma.vendor.findFirst({
      where: {
        name: rawData.vendor
      }
    });

    let vendorConnect;
    
    if (existingVendor) {
      vendorConnect = {
        connect: { id: existingVendor.id }
      };
    } else {
      vendorConnect = {
        create: {
          name: rawData.vendor,
          category: rawData.category,
        }
      };
    }

    const transaction = await prisma.transaction.create({
      data: {
        type: 'EXPENSE',
        category: rawData.category,
        amount: rawData.amount,
        date: new Date(rawData.date),
        description: rawData.description,
        paymentMethod: rawData.paymentMethod,
        status: rawData.status,
        reference: `EXP-${Date.now()}`,
        vendor: vendorConnect
      },
      include: {
        vendor: true
      }
    });

    await updateSchoolBalance(rawData.amount, 'EXPENSE');

    revalidatePath("/finance/expenses");
    revalidatePath("/admin");
    return { 
      success: true, 
      error: false,
      message: "Expense created successfully",
      data: transaction
    };
  } catch (err: any) {
    console.error('Error creating expense:', err);
    return { 
      success: false, 
      error: true,
      message: err.message || "Failed to create expense" 
    };
  }
};

export const updateExpense = async (
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> => {
  try {
    const id = formData.get('id') as string;
    if (!id) {
      return { 
        success: false, 
        error: true,
        message: "Expense ID is required" 
      };
    }

    const rawData = {
      description: formData.get('description') as string,
      amount: Number(formData.get('amount')),
      category: formData.get('category') as string,
      date: formData.get('date') as string,
      vendor: formData.get('vendor') as string,
      paymentMethod: formData.get('paymentMethod') as PaymentMethod,
      status: formData.get('status') as TransactionStatus,
      receiptUrl: formData.get('receiptUrl') as string || null,
    };

    const oldExpense = await prisma.transaction.findUnique({
      where: { id },
      include: { vendor: true }
    });

    const existingVendor = await prisma.vendor.findFirst({
      where: {
        name: rawData.vendor
      }
    });

    let vendorConnect;
    
    if (existingVendor) {
      vendorConnect = {
        connect: { id: existingVendor.id }
      };
    } else {
      vendorConnect = {
        create: {
          name: rawData.vendor,
          category: rawData.category,
        }
      };
    }

    const expense = await prisma.transaction.update({
      where: { id },
      data: {
        category: rawData.category,
        amount: rawData.amount,
        date: new Date(rawData.date),
        description: rawData.description,
        paymentMethod: rawData.paymentMethod,
        status: rawData.status,
        vendor: vendorConnect
      },
      include: {
        vendor: true
      }
    });

    if (oldExpense) {
      await updateSchoolBalance(-oldExpense.amount, 'EXPENSE');
      await updateSchoolBalance(rawData.amount, 'EXPENSE');
    } else {
      await updateSchoolBalance(rawData.amount, 'EXPENSE');
    }

    revalidatePath("/finance/expenses");
    revalidatePath("/admin");
    return { 
      success: true, 
      error: false,
      message: "Expense updated successfully",
      data: expense
    };
  } catch (err: any) {
    console.error('Error updating expense:', err);
    return { 
      success: false, 
      error: true,
      message: err.message || "Failed to update expense" 
    };
  }
};






export const getExpenses = async (): Promise<Expense[]> => {
  try {
    const expenses = await prisma.transaction.findMany({
      where: {
        type: 'EXPENSE'
      },
      include: {
        vendor: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    return expenses.map(expense => ({
      id: expense.id,
      description: expense.description || "No description",
      amount: expense.amount,
      category: expense.category,
      date: expense.date.toISOString(),
      vendor: expense.vendor?.name || 'Unknown Vendor',
      paymentMethod: expense.paymentMethod,
      status: expense.status,
      receiptUrl: expense.receiptUrl || undefined 
    }));
  } catch (err) {
    console.error('Error fetching expenses:', err);
    return [];
  }
};





export const deleteExpense = async (id: string) => {
  try {

     const expense = await prisma.transaction.findUnique({
      where: { id }
    });

    if (expense) {
      await updateSchoolBalance(-expense.amount, 'EXPENSE');
    }

    await prisma.transaction.delete({
      where: { id }
    });

    revalidatePath("/finance/expenses");
    revalidatePath("/admin");
    return { success: true, error: false };
  } catch (err) {
    console.error('Error deleting expense:', err);
    return { success: false, error: true };
  }
};



export const getExpenseStats = async () => {
  try {
    const expenses = await prisma.transaction.findMany({
      where: {
        type: 'EXPENSE'
      }
    });

    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const completedExpenses = expenses
      .filter(e => e.status === 'COMPLETED')
      .reduce((sum, e) => sum + e.amount, 0);
    const pendingExpenses = expenses
      .filter(e => e.status === 'PENDING')
      .reduce((sum, e) => sum + e.amount, 0);

    const expensesByCategory = await prisma.transaction.groupBy({
      by: ['category'],
      where: {
        type: 'EXPENSE'
      },
      _sum: {
        amount: true
      },
      orderBy: {
        _sum: {
          amount: 'desc'
        }
      }
    });

    return {
      totalExpenses,
      completedExpenses,
      pendingExpenses,
      expensesByCategory: expensesByCategory.map(item => ({
        category: item.category,
        amount: item._sum.amount || 0
      }))
    };
  } catch (err) {
    console.error('Error fetching expense stats:', err);
    return {
      totalExpenses: 0,
      completedExpenses: 0,
      pendingExpenses: 0,
      expensesByCategory: []
    };
  }
};

export const getSchoolFinance = async () => {
  try {
    let schoolFinance = await prisma.schoolFinance.findUnique({
      where: { id: 'school-general' }
    });

    if (!schoolFinance) {
      schoolFinance = await prisma.schoolFinance.create({
        data: {
          id: 'school-general',
          balance: 0,
          totalIncome: 0,
          totalExpenses: 0
        }
      });
    }

    return schoolFinance;
  } catch (err) {
    console.error('Error getting school finance:', err);
    return null;
  }
};

export const updateSchoolBalance = async (amount: number, type: 'INCOME' | 'EXPENSE') => {
  try {
    const updateData = type === 'INCOME' 
      ? {
          balance: { increment: amount },
          totalIncome: { increment: amount }
        }
      : {
          balance: { decrement: amount },
          totalExpenses: { increment: amount }
        };

    const schoolFinance = await prisma.schoolFinance.upsert({
      where: { id: 'school-general' },
      update: updateData,
      create: {
        id: 'school-general',
        balance: type === 'INCOME' ? amount : -amount,
        totalIncome: type === 'INCOME' ? amount : 0,
        totalExpenses: type === 'EXPENSE' ? amount : 0
      }
    });

    return schoolFinance;
  } catch (err) {
    console.error('Error updating school balance:', err);
    throw new Error('Failed to update school balance');
  }
};

export const getFinancialOverview = async () => {
  try {
    const schoolFinance = await getSchoolFinance();
    
    if (!schoolFinance) {
      return {
        balance: 0,
        totalIncome: 0,
        totalExpenses: 0
      };
    }

    return {
      balance: schoolFinance.balance,
      totalIncome: schoolFinance.totalIncome,
      totalExpenses: schoolFinance.totalExpenses
    };
  } catch (err) {
    console.error('Error getting financial overview:', err);
    return {
      balance: 0,
      totalIncome: 0,
      totalExpenses: 0
    };
  }
};




export const getPayments = async () => {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const payments = await prisma.transaction.findMany({
      where: {
        type: 'INCOME'
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            surname: true,
            grade: {
              select: { level: true }
            },
            class: {
              select: { name: true }
            }
          }
        },
        invoice: {
          select: {
            invoiceNumber: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    return payments.map(payment => ({
      id: payment.id,
      invoiceNumber: payment.invoice?.invoiceNumber || `TRX-${payment.reference}`,
      studentName: payment.student ? `${payment.student.name} ${payment.student.surname}` : 'Unknown Student',
      studentId: payment.studentId || '',
      amount: payment.amount,
      date: payment.date.toISOString(),
      method: payment.paymentMethod,
      reference: payment.reference || '',
      status: payment.status,
      description: payment.description || '',
      invoiceId: payment.invoiceId || ''
    }));
  } catch (error) {
    console.error('Error fetching payments:', error);
    return [];
  }
};



export const createDirectPayment = async (
  studentId: string,
  amount: number,
  method: PaymentMethod,
  reference: string,
  description?: string
): Promise<ActionState> => {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: true, message: "Unauthorized" };
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId }
    });

    if (!student) {
      return { success: false, error: true, message: "Student not found" };
    }

    const payment = await prisma.transaction.create({
      data: {
        type: 'INCOME',
        category: 'DIRECT_PAYMENT',
        amount,
        paymentMethod: method,
        reference,
        description,
        status: 'COMPLETED',
        student: { connect: { id: studentId } }
      }
    });

    await prisma.studentFinance.upsert({
      where: { studentId },
      update: {
        totalPaid: { increment: amount },
        balance: { increment: amount }
      },
      create: {
        studentId,
        totalPaid: amount,
        totalDue: 0,
        balance: amount
      }
    });

    await updateSchoolBalance(amount, 'INCOME');

    return { 
      success: true, 
      error: false,
      message: "Direct payment recorded successfully"
    };
  } catch (error: any) {
    console.error('Error creating direct payment:', error);
    return { 
      success: false, 
      error: true,
      message: error.message || "Failed to record direct payment" 
    };
  }
};


export const updatePaymentStatus = async (
  paymentId: string,
  status: TransactionStatus
) => {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: true, message: "Unauthorized" };
    }

    const payment = await prisma.transaction.findUnique({
      where: { id: paymentId },
      include: { student: true }
    });

    if (!payment) {
      return { success: false, error: true, message: "Payment not found" };
    }

    if (payment.status === 'COMPLETED' && status !== 'COMPLETED') {
      await prisma.studentFinance.upsert({
        where: { studentId: payment.studentId || '' },
        update: {
          totalPaid: { decrement: payment.amount },
          balance: { decrement: payment.amount }
        },
        create: {
          studentId: payment.studentId || '',
          totalPaid: -payment.amount,
          totalDue: 0,
          balance: -payment.amount
        }
      });

      await updateSchoolBalance(-payment.amount, 'INCOME');
    }

    if (status === 'COMPLETED' && payment.status !== 'COMPLETED') {
      await prisma.studentFinance.upsert({
        where: { studentId: payment.studentId || '' },
        update: {
          totalPaid: { increment: payment.amount },
          balance: { increment: payment.amount }
        },
        create: {
          studentId: payment.studentId || '',
          totalPaid: payment.amount,
          totalDue: 0,
          balance: payment.amount
        }
      });

      await updateSchoolBalance(payment.amount, 'INCOME');
    }

    const updatedPayment = await prisma.transaction.update({
      where: { id: paymentId },
      data: { status }
    });

    revalidatePath("/finance/payments");
    return { 
      success: true, 
      error: false,
      message: "Payment status updated successfully",
      data: updatedPayment
    };
  } catch (error: any) {
    console.error('Error updating payment status:', error);
    return { 
      success: false, 
      error: true,
      message: error.message || "Failed to update payment status" 
    };
  }
};

export const deletePayment = async (paymentId: string) => {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: true, message: "Unauthorized" };
    }

    const payment = await prisma.transaction.findUnique({
      where: { id: paymentId }
    });

    if (!payment) {
      return { success: false, error: true, message: "Payment not found" };
    }

    if (payment.status === 'COMPLETED') {
      await prisma.studentFinance.upsert({
        where: { studentId: payment.studentId || '' },
        update: {
          totalPaid: { decrement: payment.amount },
          balance: { decrement: payment.amount }
        },
        create: {
          studentId: payment.studentId || '',
          totalPaid: -payment.amount,
          totalDue: 0,
          balance: -payment.amount
        }
      });

      await updateSchoolBalance(-payment.amount, 'INCOME');
    }

    await prisma.transaction.delete({
      where: { id: paymentId }
    });

    revalidatePath("/finance/payments");
    return { success: true, error: false, message: "Payment deleted successfully" };
  } catch (error: any) {
    console.error('Error deleting payment:', error);
    return { 
      success: false, 
      error: true,
      message: error.message || "Failed to delete payment" 
    };
  }
};

export const getPaymentStatistics = async () => {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const payments = await prisma.transaction.findMany({
      where: {
        type: 'INCOME'
      }
    });

    const completedPayments = payments.filter(p => p.status === 'COMPLETED');
    const pendingPayments = payments.filter(p => p.status === 'PENDING');
    const failedPayments = payments.filter(p => p.status === 'FAILED' || p.status === 'REFUNDED');

    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    const completedAmount = completedPayments.reduce((sum, p) => sum + p.amount, 0);
    const pendingAmount = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

    return {
      total: payments.length,
      completed: completedPayments.length,
      pending: pendingPayments.length,
      failed: failedPayments.length,
      totalAmount,
      completedAmount,
      pendingAmount
    };
  } catch (error) {
    console.error('Error fetching payment statistics:', error);
    throw error;
  }
};
    

export const exportPayments = async (format: 'csv' | 'json' = 'csv'): Promise<string> => {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const payments = await prisma.transaction.findMany({
      where: {
        type: 'INCOME'
      },
      include: {
        student: {
          select: {
            name: true,
            surname: true
          }
        },
        invoice: {
          select: {
            invoiceNumber: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    if (format === 'json') {
      return JSON.stringify(payments, null, 2);
    }

    const headers = ['Date', 'Student', 'Amount', 'Method', 'Reference', 'Status', 'Category', 'Description', 'Invoice Number'];
    const rows = payments.map(payment => [
      payment.date.toISOString().split('T')[0],
      payment.student ? `${payment.student.name} ${payment.student.surname}` : 'N/A',
      payment.amount.toString(),
      payment.paymentMethod,
      payment.reference || 'N/A',
      payment.status,
      payment.category,
      payment.description || '',
      payment.invoice?.invoiceNumber || 'N/A'
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field?.toString().replace(/"/g, '""')}"`).join(','))
      .join('\n');

    return csvContent;
  } catch (error) {
    console.error('Error exporting payments:', error);
    throw new Error('Failed to export payments');
  }
};

export const getStudentPayments = async (studentId: string) => {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const payments = await prisma.transaction.findMany({
      where: {
        type: 'INCOME',
        studentId
      },
      include: {
        invoice: {
          select: {
            invoiceNumber: true,
            items: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    return payments.map(payment => ({
      id: payment.id,
      invoiceNumber: payment.invoice?.invoiceNumber || `TRX-${payment.reference}`,
      amount: payment.amount,
      date: payment.date.toISOString(),
      method: payment.paymentMethod,
      reference: payment.reference || '',
      status: payment.status,
      description: payment.description || '',
      category: payment.category
    }));
  } catch (error) {
    console.error('Error fetching student payments:', error);
    return [];
  }
};



export const generateFinancialReport = async (filters: ReportFilters = {}): Promise<FinancialReportData> => {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const { startDate, endDate } = filters;

    const invoiceDateFilter = startDate && endDate ? {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    } : {};

    const transactionDateFilter = startDate && endDate ? {
      date: {
        gte: startDate,
        lte: endDate
      }
    } : {};

    const revenueData = await prisma.transaction.aggregate({
      where: {
        type: 'INCOME',
        status: 'COMPLETED',
        ...transactionDateFilter
      },
      _sum: {
        amount: true
      }
    });

    const totalRevenue = revenueData._sum.amount || 0;

    const expenseData = await prisma.transaction.aggregate({
      where: {
        type: 'EXPENSE',
        status: 'COMPLETED',
        ...transactionDateFilter
      },
      _sum: {
        amount: true
      }
    });

    const totalExpenses = expenseData._sum.amount || 0;
    const netProfit = totalRevenue - totalExpenses;

    const totalInvoices = await prisma.invoice.aggregate({
      where: {
        ...invoiceDateFilter
      },
      _sum: {
        totalAmount: true
      }
    });

    const totalPaid = await prisma.transaction.aggregate({
      where: {
        type: 'INCOME',
        status: 'COMPLETED',
        ...transactionDateFilter
      },
      _sum: {
        amount: true
      }
    });

    const feeCollectionRate = totalInvoices._sum.totalAmount ? 
      ((totalPaid._sum.amount || 0) / totalInvoices._sum.totalAmount) * 100 : 0;

    const outstandingFees = (totalInvoices._sum.totalAmount || 0) - (totalPaid._sum.amount || 0);

    const expenseBreakdown = await prisma.transaction.groupBy({
      by: ['category'],
      where: {
        type: 'EXPENSE',
        status: 'COMPLETED',
        ...transactionDateFilter
      },
      _sum: {
        amount: true
      },
      orderBy: {
        _sum: {
          amount: 'desc'
        }
      }
    });

    const expenseBreakdownWithPercentage = expenseBreakdown.map(item => ({
      category: item.category,
      amount: item._sum.amount || 0,
      percentage: totalExpenses ? ((item._sum.amount || 0) / totalExpenses) * 100 : 0
    }));

    const revenueTrends = await getMonthlyRevenueTrends(startDate, endDate);

    const topStudents = await getTopPayingStudents(startDate, endDate);

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      feeCollectionRate: Math.round(feeCollectionRate * 100) / 100, // Round to 2 decimal places
      outstandingFees,
      expenseBreakdown: expenseBreakdownWithPercentage,
      revenueTrends,
      topStudents
    };
  } catch (error) {
    console.error('Error generating financial report:', error);
    throw new Error('Failed to generate financial report');
  }
};

const getMonthlyRevenueTrends = async (startDate?: Date, endDate?: Date) => {
  const defaultStartDate = startDate || new Date(new Date().getFullYear(), 0, 1); // Start of current year
  const defaultEndDate = endDate || new Date();

  const revenueTrends = await prisma.transaction.groupBy({
    by: ['date'],
    where: {
      type: 'INCOME',
      status: 'COMPLETED',
      date: {
        gte: defaultStartDate,
        lte: defaultEndDate
      }
    },
    _sum: {
      amount: true
    },
    orderBy: {
      date: 'asc'
    }
  });

  const expenseTrends = await prisma.transaction.groupBy({
    by: ['date'],
    where: {
      type: 'EXPENSE',
      status: 'COMPLETED',
      date: {
        gte: defaultStartDate,
        lte: defaultEndDate
      }
    },
    _sum: {
      amount: true
    },
    orderBy: {
      date: 'asc'
    }
  });

  const monthlyData: { [key: string]: { revenue: number; expenses: number } } = {};

  revenueTrends.forEach(item => {
    const monthKey = item.date.toISOString().slice(0, 7); // YYYY-MM format
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { revenue: 0, expenses: 0 };
    }
    monthlyData[monthKey].revenue += item._sum.amount || 0;
  });

  expenseTrends.forEach(item => {
    const monthKey = item.date.toISOString().slice(0, 7);
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { revenue: 0, expenses: 0 };
    }
    monthlyData[monthKey].expenses += item._sum.amount || 0;
  });

  return Object.entries(monthlyData).map(([month, data]) => ({
    month: new Date(month + '-01').toLocaleString('default', { month: 'short' }),
    revenue: data.revenue,
    expenses: data.expenses
  })).slice(-6); // Last 6 months
};

const getTopPayingStudents = async (startDate?: Date, endDate?: Date) => {
  const transactionDateFilter = startDate && endDate ? {
    date: {
      gte: startDate,
      lte: endDate
    }
  } : {};

  const topPayers = await prisma.transaction.groupBy({
    by: ['studentId'],
    where: {
      type: 'INCOME',
      status: 'COMPLETED',
      ...transactionDateFilter,
      studentId: {
        not: null
      }
    },
    _sum: {
      amount: true
    },
    orderBy: {
      _sum: {
        amount: 'desc'
      }
    },
    take: 10 // Top 10 students
  });

  const studentDetails = await Promise.all(
    topPayers.map(async (payer) => {
      if (!payer.studentId) return null;
      
      const student = await prisma.student.findUnique({
        where: { id: payer.studentId },
        include: {
          grade: true,
          class: true
        }
      });

      if (!student) return null;

      return {
        name: `${student.name} ${student.surname}`,
        grade: student.grade?.level.toString() || 'N/A',
        paid: payer._sum.amount || 0
      };
    })
  );

  return studentDetails.filter(Boolean) as { name: string; grade: string; paid: number }[];
};

export const generateCollectionReport = async (filters: ReportFilters = {}) => {
  const financialData = await generateFinancialReport(filters);
  
  const transactionDateFilter = filters.startDate && filters.endDate ? {
    date: {
      gte: filters.startDate,
      lte: filters.endDate
    }
  } : {};

  const paymentMethods = await prisma.transaction.groupBy({
    by: ['paymentMethod'],
    where: {
      type: 'INCOME',
      status: 'COMPLETED',
      ...transactionDateFilter
    },
    _sum: {
      amount: true
    },
    _count: {
      id: true
    }
  });

  const overdueInvoices = await prisma.invoice.findMany({
    where: {
      status: 'OVERDUE',
      dueDate: {
        lt: new Date()
      },
      ...(filters.startDate && filters.endDate ? {
        createdAt: {
          gte: filters.startDate,
          lte: filters.endDate
        }
      } : {})
    },
    include: {
      student: {
        select: {
          name: true,
          surname: true
        }
      }
    }
  });

  return {
    ...financialData,
    paymentMethods: paymentMethods.map(method => ({
      method: method.paymentMethod,
      amount: method._sum.amount || 0,
      count: method._count.id
    })),
    overdueInvoices: overdueInvoices.map(invoice => ({
      invoiceNumber: invoice.invoiceNumber,
      studentName: `${invoice.student?.name || ''} ${invoice.student?.surname || ''}`.trim(),
      amount: invoice.totalAmount,
      dueDate: invoice.dueDate,
      daysOverdue: Math.floor((new Date().getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24))
    }))
  };
};


export const generateExpenseReport = async (filters: ReportFilters = {}) => {
  const financialData = await generateFinancialReport(filters);
  
  const transactionDateFilter = filters.startDate && filters.endDate ? {
    date: {
      gte: filters.startDate,
      lte: filters.endDate
    }
  } : {};

  const vendors = await prisma.transaction.groupBy({
    by: ['vendorId'],
    where: {
      type: 'EXPENSE',
      status: 'COMPLETED',
      ...transactionDateFilter
    },
    _sum: {
      amount: true
    },
    orderBy: {
      _sum: {
        amount: 'desc'
      }
    }
  });

  const vendorDetails = await Promise.all(
    vendors.map(async (vendor) => {
      if (!vendor.vendorId) return null;
      
      const vendorInfo = await prisma.vendor.findUnique({
        where: { id: vendor.vendorId }
      });

      return {
        name: vendorInfo?.name || 'Unknown Vendor',
        amount: vendor._sum.amount || 0,
        category: vendorInfo?.category || 'Unknown'
      };
    })
  );

  const pendingExpenses = await prisma.transaction.aggregate({
    where: {
      type: 'EXPENSE',
      status: 'PENDING',
      ...transactionDateFilter
    },
    _sum: {
      amount: true
    }
  });

  return {
    ...financialData,
    topVendors: vendorDetails.filter(Boolean).slice(0, 10), // Top 10 vendors
    pendingExpenses: pendingExpenses._sum.amount || 0,
    expenseCategories: financialData.expenseBreakdown
  };
};


export const exportReport = async (reportType: 'financial' | 'collection' | 'expense', format: 'csv' | 'json', filters: ReportFilters = {}) => {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    let reportData: any;

    switch (reportType) {
      case 'financial':
        reportData = await generateFinancialReport(filters);
        break;
      case 'collection':
        reportData = await generateCollectionReport(filters);
        break;
      case 'expense':
        reportData = await generateExpenseReport(filters);
        break;
      default:
        throw new Error('Invalid report type');
    }

    if (format === 'json') {
      return JSON.stringify(reportData, null, 2);
    }

    let csvContent = '';
    
    switch (reportType) {
      case 'financial':
        csvContent = exportFinancialReportToCSV(reportData);
        break;
      case 'collection':
        csvContent = exportCollectionReportToCSV(reportData);
        break;
      case 'expense':
        csvContent = exportExpenseReportToCSV(reportData);
        break;
    }

    return csvContent;
  } catch (error) {
    console.error('Error exporting report:', error);
    throw new Error('Failed to export report');
  }
};



const exportFinancialReportToCSV = (data: FinancialReportData): string => {
  const headers = ['Metric', 'Value'];
  const rows = [
    ['Total Revenue', data.totalRevenue.toString()],
    ['Total Expenses', data.totalExpenses.toString()],
    ['Net Profit', data.netProfit.toString()],
    ['Fee Collection Rate', `${data.feeCollectionRate}%`],
    ['Outstanding Fees', data.outstandingFees.toString()],
    ['', ''],
    ['Expense Breakdown', ''],
    ...data.expenseBreakdown.map(item => [item.category, item.amount.toString()]),
    ['', ''],
    ['Revenue Trends', ''],
    ...data.revenueTrends.map(item => [item.month, `Revenue: ${item.revenue}, Expenses: ${item.expenses}`]),
    ['', ''],
    ['Top Students', ''],
    ...data.topStudents.map(student => [student.name, `Grade: ${student.grade}, Paid: ${student.paid}`])
  ];

  return [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');
};



const exportCollectionReportToCSV = (data: any): string => {
  const headers = ['Metric', 'Value'];
  const rows = [
    ['Total Revenue', data.totalRevenue.toString()],
    ['Total Expenses', data.totalExpenses.toString()],
    ['Net Profit', data.netProfit.toString()],
    ['Fee Collection Rate', `${data.feeCollectionRate}%`],
    ['Outstanding Fees', data.outstandingFees.toString()],
    ['', ''],
    ['Payment Methods', ''],
    ...data.paymentMethods.map((method: any) => [method.method, `Amount: ${method.amount}, Transactions: ${method.count}`]),
    ['', ''],
    ['Overdue Invoices', ''],
    ...data.overdueInvoices.map((invoice: any) => [
      invoice.invoiceNumber, 
      `Student: ${invoice.studentName}, Amount: ${invoice.amount}, Days Overdue: ${invoice.daysOverdue}`
    ])
  ];

  return [headers, ...rows]
    .map(row => row.map((field: any) => `"${field}"`).join(','))
    .join('\n');
};


const exportExpenseReportToCSV = (data: any): string => {
  const headers = ['Metric', 'Value'];
  const rows = [
    ['Total Revenue', data.totalRevenue.toString()],
    ['Total Expenses', data.totalExpenses.toString()],
    ['Net Profit', data.netProfit.toString()],
    ['Pending Expenses', data.pendingExpenses.toString()],
    ['', ''],
    ['Top Vendors', ''],
    ...data.topVendors.map((vendor: any) => [vendor.name, `Amount: ${vendor.amount}, Category: ${vendor.category}`]),
    ['', ''],
    ['Expense Categories', ''],
    ...data.expenseCategories.map((category: any) => [category.category, `Amount: ${category.amount}, Percentage: ${category.percentage.toFixed(2)}%`])
  ];

  return [headers, ...rows]
    .map(row => row.map((field: any) => `"${field}"`).join(','))
    .join('\n');
};


export const createPost = async (
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> => {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { 
        success: false, 
        error: true,
        message: "Unauthorized" 
      };
    }

    const rawData = {
      title: formData.get('title') as string,
      slug: formData.get('slug') as string,
      content: formData.get('content') as string,
      excerpt: formData.get('excerpt') as string,
      status: formData.get('status') as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
      imageFile: formData.get('image') as File | null,
      existingImageUrl: formData.get('existingImageUrl') as string,
      existingImagePublicId: formData.get('existingImagePublicId') as string,
    };

    if (!rawData.title || !rawData.slug || !rawData.content) {
      return {
        success: false,
        error: true,
        message: "Title, slug, and content are required"
      };
    }

    let imageUrl = rawData.existingImageUrl;
    let imagePublicId = rawData.existingImagePublicId;

    if (rawData.imageFile && rawData.imageFile.size > 0) {
      if (imagePublicId) {
        await deleteImage(imagePublicId);
      }
      
      const uploadResult = await uploadImage(rawData.imageFile);
      imageUrl = uploadResult.url;
      imagePublicId = uploadResult.public_id;
    }

    const postData = {
      title: rawData.title,
      slug: rawData.slug,
      content: rawData.content,
      excerpt: rawData.excerpt || null,
      imageUrl: imageUrl || null,
      imagePublicId: imagePublicId || null,
      status: rawData.status,
      authorId: userId,
      ...(rawData.status === 'PUBLISHED' && { publishedAt: new Date() })
    };

    await prisma.post.create({
      data: postData
    });

    revalidatePath("/posts");
    revalidatePath("/list/posts");
    return {
      success: true,
      error: false,
      message: "Post created successfully"
    };
  } catch (err: any) {
    console.error('Error creating post:', err);
    
    if (err.code === 'P2002') {
      return {
        success: false,
        error: true,
        message: "A post with this slug already exists"
      };
    }
    
    return {
      success: false,
      error: true,
      message: err.message || "Failed to create post"
    };
  }
};

export const updatePost = async (
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> => {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { 
        success: false, 
        error: true,
        message: "Unauthorized" 
      };
    }

    const id = formData.get('id') as string;
    if (!id) {
      return {
        success: false,
        error: true,
        message: "Post ID is required"
      };
    }

    const rawData = {
      title: formData.get('title') as string,
      slug: formData.get('slug') as string,
      content: formData.get('content') as string,
      excerpt: formData.get('excerpt') as string,
      status: formData.get('status') as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
      imageFile: formData.get('image') as File | null,
      existingImageUrl: formData.get('existingImageUrl') as string,
      existingImagePublicId: formData.get('existingImagePublicId') as string,
    };

    let imageUrl = rawData.existingImageUrl;
    let imagePublicId = rawData.existingImagePublicId;

    if (rawData.imageFile && rawData.imageFile.size > 0) {
      if (imagePublicId) {
        await deleteImage(imagePublicId);
      }
      
      const uploadResult = await uploadImage(rawData.imageFile);
      imageUrl = uploadResult.url;
      imagePublicId = uploadResult.public_id;
    }

    const postData = {
      title: rawData.title,
      slug: rawData.slug,
      content: rawData.content,
      excerpt: rawData.excerpt || null,
      imageUrl: imageUrl || null,
      imagePublicId: imagePublicId || null,
      status: rawData.status,
      ...(rawData.status === 'PUBLISHED' && { publishedAt: new Date() })
    };

    await prisma.post.update({
      where: { id },
      data: postData
    });

    revalidatePath("/posts");
    revalidatePath("/list/posts");
    revalidatePath(`/posts/${rawData.slug}`);
    return {
      success: true,
      error: false,
      message: "Post updated successfully"
    };
  } catch (err: any) {
    console.error('Error updating post:', err);
    
    if (err.code === 'P2002') {
      return {
        success: false,
        error: true,
        message: "A post with this slug already exists"
      };
    }
    
    return {
      success: false,
      error: true,
        message: err.message || "Failed to update post"
    };
  }
};

export const deletePost = async (id: string): Promise<ActionState> => {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { 
        success: false, 
        error: true,
        message: "Unauthorized" 
      };
    }

    const post = await prisma.post.findUnique({
      where: { id }
    });

    if (!post) {
      return {
        success: false,
        error: true,
        message: "Post not found"
      };
    }

    // Delete image from Cloudinary
    if (post.imagePublicId) {
      await deleteImage(post.imagePublicId);
    }

    await prisma.post.delete({
      where: { id }
    });

    revalidatePath("/posts");
    revalidatePath("/list/posts");
    return {
      success: true,
      error: false,
      message: "Post deleted successfully"
    };
  } catch (err: any) {
    console.error('Error deleting post:', err);
    return {
      success: false,
      error: true,
      message: err.message || "Failed to delete post"
    };
  }
};

export const getPosts = async (page: number = 1, limit: number = 6, status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED') => {
  try {
    const skip = (page - 1) * limit;
    
    const where = status ? { status } : {};
    
    const [posts, totalCount] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: {
            select: {
              username: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.post.count({ where })
    ]);

    return {
      posts: posts.map(post => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt,
        imageUrl: post.imageUrl,
        status: post.status,
        author: post.author.username,
        createdAt: post.createdAt.toISOString(),
        publishedAt: post.publishedAt?.toISOString(),
      })),
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit)
    };
  } catch (err) {
    console.error('Error fetching posts:', err);
    return { posts: [], totalCount: 0, currentPage: 1, totalPages: 0 };
  }
};

export const getPostBySlug = async (slug: string) => {
  try {
    const post = await prisma.post.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            username: true
          }
        }
      }
    });

    if (!post) {
      return null;
    }

    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt,
      imageUrl: post.imageUrl,
      status: post.status,
      author: post.author.username,
      createdAt: post.createdAt.toISOString(),
      publishedAt: post.publishedAt?.toISOString(),
    };
  } catch (err) {
    console.error('Error fetching post:', err);
    return null;
  }
};
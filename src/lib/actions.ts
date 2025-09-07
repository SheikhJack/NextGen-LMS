"use server";

import { revalidatePath } from "next/cache";
import {
  ClassSchema,
  ExamSchema,
  StudentSchema,
  SubjectSchema,
  TeacherSchema,
  AnnouncementSchema,
  EventSchema 
} from "./formValidationSchemas";
import prisma from "./prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { ActionState } from "./types";

type CurrentState = { success: boolean; error: boolean };

const getClerkClient = async () => {
  return await clerkClient();
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
  currentState: CurrentState,
  data: TeacherSchema
) => {
  try {
    const client = await getClerkClient();
    const user = await client.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata: { role: "teacher" }
    });

    await prisma.teacher.create({
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
        subjects: {
          connect: data.subjects?.map((subjectId: string) => ({
            id: parseInt(subjectId),
          })),
        },
      },
    });

    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    const client = await getClerkClient();
    const user = await client.users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== "" && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });

    await prisma.teacher.update({
      where: {
        id: data.id,
      },
      data: {
        ...(data.password !== "" && { password: data.password }),
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
        subjects: {
          set: data.subjects?.map((subjectId: string) => ({
            id: parseInt(subjectId),
          })),
        },
      },
    });
    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
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
  const { userId, sessionClaims } = auth();
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
  const { userId, sessionClaims } = auth();
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

  const { userId, sessionClaims } = auth();
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
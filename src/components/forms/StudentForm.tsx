"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import Image from "next/image";
import { useEffect, useState, useActionState } from "react";
import { studentSchema, StudentSchema } from "@/lib/formValidationSchemas";
import { createStudent, updateStudent } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { CldUploadWidget } from "next-cloudinary";
import { ActionState } from '@/lib/types/types';

const StudentForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: (open: boolean) => void; 
  relatedData?: any;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StudentSchema>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      username: data?.username || "",
      email: data?.email || "",
      password: type === "create" ? "" : "********",
      name: data?.name || "",
      surname: data?.surname || "",
      phone: data?.phone || "",
      address: data?.address || "",
      bloodType: data?.bloodType || "",
      sex: data?.sex || "MALE",
      birthday: data?.birthday ? new Date(data.birthday).toISOString().split('T')[0] : "",
      gradeId: data?.gradeId ? String(data.gradeId) : "",
      classId: data?.classId ? String(data.classId) : "",
      parentId: data?.parentId || "",
      id: data?.id ? String(data.id) : undefined,
    },
  });

  const [img, setImg] = useState<any>();
  const router = useRouter();

  const [state, formAction, isPending] = useActionState(
    type === "create" ? createStudent : updateStudent,
    {
      success: false,
      error: false,
      message: "",
    } as ActionState
  );

  const onSubmit = handleSubmit((formData) => {
    const submitData = new FormData();
    
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        if (key === "password" && value === "********") {
          return; // Skip password placeholder on update
        }
        submitData.append(key, value.toString());
      }
    });
    
    if (img?.secure_url) {
      submitData.append('img', img.secure_url);
    }
    
    formAction(submitData);
  });

  useEffect(() => {
    if (state.success) {
      toast.success(`Student has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    } else if (state.message && !state.success) {
      toast.error(state.message);
    }
  }, [state, router, type, setOpen]);

  const { grades, classes } = relatedData;

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new student" : "Update the student"}
      </h1>

      <span className="text-xs text-gray-400 font-medium">
        Authentication Information
      </span>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Username"
          name="username"
          register={register}
          error={errors?.username}
        />
        <InputField
          label="Email"
          name="email"
          type="email"
          register={register}
          error={errors?.email}
        />
        <InputField
          label={type === "create" ? "Password" : "Password (leave blank to keep current)"}
          name="password"
          type="password"
          register={register}
          error={errors?.password}
        />
      </div>

      <span className="text-xs text-gray-400 font-medium">
        Personal Information
      </span>

      <CldUploadWidget
        uploadPreset="school"
        onSuccess={(result, { widget }) => {
          setImg(result.info);
          widget.close();
        }}
      >
        {({ open }) => (
          <div
            className="text-xs text-gray-500 flex items-center gap-2 cursor-pointer"
            onClick={() => open()}
          >
            <Image src="/upload.png" alt="" width={28} height={28} />
            <span>Upload a photo</span>
          </div>
        )}
      </CldUploadWidget>

      {img?.secure_url && (
        <div className="flex items-center gap-2">
          <Image src={img.secure_url} alt="Preview" width={50} height={50} className="rounded-full" />
          <span className="text-xs text-green-600">Photo uploaded</span>
        </div>
      )}

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="First Name"
          name="name"
          register={register}
          error={errors.name}
        />
        <InputField
          label="Last Name"
          name="surname"
          register={register}
          error={errors.surname}
        />
        <InputField
          label="Phone"
          name="phone"
          register={register}
          error={errors.phone}
        />
        <InputField
          label="Address"
          name="address"
          register={register}
          error={errors.address}
        />
        <InputField
          label="Blood Type"
          name="bloodType"
          register={register}
          error={errors.bloodType}
        />
        <InputField
          label="Birthday"
          name="birthday"
          type="date"
          register={register}
          error={errors.birthday}
        />
        <InputField
          label="Parent Id (Optional)"
          name="parentId"
          register={register}
          error={errors.parentId}
        />

        {type === "update" && data?.id && (
          <input type="hidden" {...register("id")} />
        )}

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Sex</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("sex")}
          >
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
          {errors.sex?.message && (
            <p className="text-xs text-red-400">{errors.sex.message.toString()}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Grade</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("gradeId")}
          >
            <option value="">Select Grade</option>
            {grades.map((grade: { id: number; level: number }) => (
              <option value={String(grade.id)} key={grade.id}>
                Grade {grade.level}
              </option>
            ))}
          </select>
          {errors.gradeId?.message && (
            <p className="text-xs text-red-400">{errors.gradeId.message.toString()}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Class</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("classId")}
          >
            <option value="">Select Class</option>
            {classes.map((classItem: {
              id: number;
              name: string;
              capacity: number;
              _count: { students: number };
            }) => (
              <option value={String(classItem.id)} key={classItem.id}>
                {classItem.name} ({classItem._count.students}/{classItem.capacity})
              </option>
            ))}
          </select>
          {errors.classId?.message && (
            <p className="text-xs text-red-400">{errors.classId.message.toString()}</p>
          )}
        </div>
      </div>

      {state.error && state.message && (
        <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
          {state.message}
        </div>
      )}

      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          disabled={isPending}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-400 text-white rounded-md hover:bg-blue-500 disabled:bg-gray-400"
          disabled={isPending}
        >
          {isPending ? "Processing..." : type === "create" ? "Create Student" : "Update Student"}
        </button>
      </div>
    </form>
  );
};

export default StudentForm;
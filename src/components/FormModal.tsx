"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { FormContainerProps } from "./FormContainer";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";

import {
  deleteAnnouncement,
  deleteClass,
  deleteExam,
  deleteStudent,
  deleteSubject,
  deleteTeacher,
  deleteEvent
} from "@/lib/actions";


const deleteActionMap = {
  subject: deleteSubject,
  class: deleteClass,
  teacher: deleteTeacher,
  student: deleteStudent,
  exam: deleteExam,
  parent: deleteSubject,
  lesson: deleteSubject,
  assignment: deleteSubject,
  result: deleteSubject,
  attendance: deleteSubject,
  announcement: deleteAnnouncement,
  event: deleteEvent,
};
const TeacherForm = dynamic(() => import("./forms/TeacherForm"), {
  loading: () => <Loader2 className="h-6 w-6 animate-spin" />,
});
const StudentForm = dynamic(() => import("./forms/StudentForm"), {
  loading: () => <Loader2 className="h-6 w-6 animate-spin" />,
});
const SubjectForm = dynamic(() => import("./forms/SubjectForm"), {
  loading: () => <Loader2 className="h-6 w-6 animate-spin" />,
});
const ClassForm = dynamic(() => import("./forms/ClassForm"), {
  loading: () => <Loader2 className="h-6 w-6 animate-spin" />,
});
const ExamForm = dynamic(() => import("./forms/ExamForm"), {
  loading: () => <Loader2 className="h-6 w-6 animate-spin" />,
});
const AnnouncementForm = dynamic(() => import("./forms/AnnouncementForm"), {
  loading: () => <Loader2 className="h-6 w-6 animate-spin" />,
});
const EventForm = dynamic(() => import("./forms/EventForm"), {
  loading: () => <Loader2 className="h-6 w-6 animate-spin" />,
});



const forms: {
  [key: string]: (
    setOpen: (open: boolean) => void,
    type: "create" | "update",
    data?: any,
    relatedData?: any
  ) => JSX.Element;
} = {
  subject: (setOpen, type, data, relatedData) => (
    <SubjectForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  class: (setOpen, type, data, relatedData) => (
    <ClassForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  teacher: (setOpen, type, data, relatedData) => (
    <TeacherForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  student: (setOpen, type, data, relatedData) => (
    <StudentForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  exam: (setOpen, type, data, relatedData) => (
    <ExamForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  announcement: (setOpen, type, data, relatedData) => (
    <AnnouncementForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  event: (setOpen, type, data, relatedData) => (
    <EventForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
};

const FormModal = ({
  table,
  type,
  data,
  id,
  relatedData,
}: FormContainerProps & { relatedData?: any }) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async (formData: FormData) => {
    setIsLoading(true);
    try {
      const deleteAction = deleteActionMap[table as keyof typeof deleteActionMap];
      if (!deleteAction) {
        throw new Error(`No delete action found for ${table}`);
      }

      const result = await deleteAction(
        { success: false, error: false },
        formData
      );

      if (result.success) {
        toast.success(`${table} has been deleted successfully!`);
        router.refresh();
      } else {
        toast.error(`Failed to delete ${table}`);
      }
    } catch (error) {
      toast.error(`Failed to delete ${table}`);
    } finally {
      setIsLoading(false);
    }
  };

  const FormContent = () => {
    if (type === "delete" && id) {
      return (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this {table}? This action cannot be undone.
          </p>
          <form action={handleDelete} className="space-y-4">
            <input type="hidden" name="id" value={id} />
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
              </Button>
            </div>
          </form>
        </div>
      );
    } else if (type === "create" || type === "update") {
      const FormComponent = forms[table];
      if (FormComponent) {
        const closeForm = () => router.back();
        return FormComponent(closeForm, type, data, relatedData);
      } else {
        return (
          <div className="p-4 text-center">
            <p className="text-destructive">Form for {table} is not implemented yet.</p>
          </div>
        );
      }
    } else {
      return (
        <div className="p-4 text-center">
          <p className="text-destructive">Form not found!</p>
        </div>
      );
    }
  };

  return <FormContent />;
};

export default FormModal;

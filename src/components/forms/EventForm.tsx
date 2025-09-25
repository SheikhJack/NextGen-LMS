"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { eventSchema, EventSchema } from "@/lib/formValidationSchemas";
import { createEvent, updateEvent } from "@/lib/actions";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const EventForm = ({
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EventSchema>({
    resolver: zodResolver(eventSchema),
  });

  const router = useRouter();
  const { classes } = relatedData || {};

  const formatDateForInput = (date: Date | string) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().slice(0, 16);
  };

  useEffect(() => {
    if (data) {
      reset({
        title: data.title || "",
        description: data.description || "",
        startTime: data.startTime ? formatDateForInput(data.startTime) : "",
        endTime: data.endTime ? formatDateForInput(data.endTime) : "",
        classId: data.classId || "",
        id: data.id || undefined,
      });
    }
  }, [data, reset]);

  const onSubmit = handleSubmit(async (formData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = type === "create" 
        ? await createEvent({ success: false, error: false }, formData)
        : await updateEvent({ success: false, error: false }, formData);

      if (result.success) {
        toast(`Event has been ${type === "create" ? "created" : "updated"}!`);
        setOpen(false);
        router.refresh();
      } else {
        setSubmitError("Something went wrong!");
      }
    } catch (error) {
      setSubmitError("Something went wrong!");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <form className="flex flex-col gap-6 p-4" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create New Event" : "Update Event"}
      </h1>

      <div className="flex flex-col gap-4">
        <InputField
          label="Event Title"
          name="title"
          register={register}
          error={errors?.title}
          placeholder="Enter event title"
        />

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Description</label>
          <textarea
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full min-h-[80px]"
            {...register("description")}
            placeholder="Enter event description"
          />
          {errors.description?.message && (
            <p className="text-xs text-red-400">
              {errors.description.message.toString()}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Start Time"
            name="startTime"
            type="datetime-local"
            register={register}
            error={errors?.startTime}
          />

          <InputField
            label="End Time"
            name="endTime"
            type="datetime-local"
            register={register}
            error={errors?.endTime}
          />
        </div>

        {classes && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Class (Optional)</label>
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register("classId")}
            >
              <option value="">Select a class (optional)</option>
              {classes.map((classItem: { id: number; name: string }) => (
                <option value={classItem.id} key={classItem.id}>
                  {classItem.name}
                </option>
              ))}
            </select>
            {errors.classId?.message && (
              <p className="text-xs text-red-400">
                {errors.classId.message.toString()}
              </p>
            )}
          </div>
        )}

        {data?.id && (
          <input type="hidden" {...register("id")} />
        )}
      </div>

      {submitError && (
        <span className="text-red-500 text-sm">{submitError}</span>
      )}

      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-lamaSky text-white rounded-md hover:bg-lamaSkyDark disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Processing..." : (type === "create" ? "Create Event" : "Update Event")}
        </button>
      </div>
    </form>
  );
};

export default EventForm;
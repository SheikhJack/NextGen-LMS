"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { eventSchema, EventSchema } from "@/lib/formValidationSchemas";
import { createEvent, updateEvent } from "@/lib/actions";
import { useFormState } from "react-dom"; // Use from 'react-dom' not 'react'
import { Dispatch, SetStateAction, useEffect } from "react";
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
  setOpen:  (open: boolean) => void; 
  relatedData?: any;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventSchema>({
    resolver: zodResolver(eventSchema),
  });

  // Use useFormState from react-dom
  const [state, formAction] = useFormState(
    type === "create" ? createEvent : updateEvent,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((formData) => {
    // Convert date strings to Date objects for Prisma
    const processedData = {
      ...formData,
      startTime: new Date(formData.startTime),
      endTime: new Date(formData.endTime),
    };
    formAction(processedData);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Event has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const { classes } = relatedData || {};

  // Format dates for datetime-local input
  const formatDateForInput = (date: Date | string) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().slice(0, 16);
  };

  return (
    <form action={formAction} className="flex flex-col gap-6 p-4" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create New Event" : "Update Event"}
      </h1>

      <div className="flex flex-col gap-4">
        <InputField
          label="Event Title"
          name="title"
          defaultValue={data?.title}
          register={register}
          error={errors?.title}
          placeholder="Enter event title"
        />

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Description</label>
          <textarea
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full min-h-[80px]"
            {...register("description")}
            defaultValue={data?.description}
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
            defaultValue={formatDateForInput(data?.startTime)}
            register={register}
            error={errors?.startTime}
          />

          <InputField
            label="End Time"
            name="endTime"
            type="datetime-local"
            defaultValue={formatDateForInput(data?.endTime)}
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
              defaultValue={data?.classId || ''}
            >
              <option value="">Select a class (optional)</option>
              {classes.map((classItem: { id: number; name: string }) => (
                <option
                  value={classItem.id}
                  key={classItem.id}
                >
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

        {data && (
          <InputField
            label="Id"
            name="id"
            type="hidden"
            defaultValue={data?.id}
            register={register}
            error={errors?.id}
          />
        )}
      </div>

      {state.error && (
        <span className="text-red-500 text-sm">Something went wrong!</span>
      )}

      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-lamaSky text-white rounded-md hover:bg-lamaSkyDark"
        >
          {type === "create" ? "Create Event" : "Update Event"}
        </button>
      </div>
    </form>
  );
};

export default EventForm;
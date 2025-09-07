"use client";

import { useState } from "react";
import { createAnnouncement, updateAnnouncement } from "@/lib/actions";
import { Dispatch, SetStateAction } from "react";
import { toast } from "react-toastify";

interface AnnouncementFormProps {
    type: "create" | "update";
    data?: any;
    setOpen: Dispatch<SetStateAction<boolean>>;
    relatedData?: any;
}

const AnnouncementForm = ({
    type,
    data,
    setOpen,
    relatedData,
}: AnnouncementFormProps) => {
    const [formData, setFormData] = useState({
        title: data?.title || "",
        description: data?.description || "",
        content: data?.content || "",
        classId: data?.classId || "",
        date: data?.date || new Date(),
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (type === "create") {
                const result = await createAnnouncement(
                    { success: false, error: false },
                    formData
                );

                if (result.success) {
                    toast.success("Announcement created successfully!");
                    setOpen(false);
                } else {
                    toast.error("Failed to create announcement");
                }
            } else if (type === "update" && data?.id) {
                const result = await updateAnnouncement(
                    { success: false, error: false },
                    { ...formData, id: data.id }
                );

                if (result.success) {
                    toast.success("Announcement updated successfully!");
                    setOpen(false);
                } else {
                    toast.error("Failed to update announcement");
                }
            }
        } catch (error) {
            toast.error("Failed to save announcement");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <label htmlFor="title" className="font-medium">
                    Title
                </label>
                <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="p-2 border border-gray-300 rounded-md"
                    required
                />
            </div>

            <div className="flex flex-col gap-2">
                <label htmlFor="description" className="font-medium">
                    Description (Short Summary)
                </label>
                <input
                    type="text"
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="p-2 border border-gray-300 rounded-md"
                    required
                />
            </div>

            <div className="flex flex-col gap-2">
                <label htmlFor="content" className="font-medium">
                    Content (Detailed Information)
                </label>
                <textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="p-2 border border-gray-300 rounded-md min-h-[100px]"
                    required
                />
            </div>

            <div className="flex flex-col gap-2">
                <label htmlFor="date" className="font-medium">
                    Date
                </label>
                <input
                    type="datetime-local"
                    id="date"
                    value={formData.date ? new Date(formData.date).toISOString().slice(0, 16) : ""}
                    onChange={(e) => setFormData({ ...formData, date: new Date(e.target.value) })}
                    className="p-2 border border-gray-300 rounded-md"
                    required
                />
            </div>

            {relatedData?.classes && (
                <div className="flex flex-col gap-2">
                    <label htmlFor="classId" className="font-medium">
                        Class (Optional)
                    </label>
                    <select
                        id="classId"
                        value={formData.classId}
                        onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                        className="p-2 border border-gray-300 rounded-md"
                    >
                        <option value="">Select a class (optional)</option>
                        {relatedData.classes.map((classItem: any) => (
                            <option key={classItem.id} value={classItem.id}>
                                {classItem.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <button
                type="submit"
                className="bg-lamaSky text-white py-2 px-4 rounded-md border-none w-max self-end"
            >
                {type === "create" ? "Create" : "Update"}
            </button>
        </form>
    );
};

export default AnnouncementForm;
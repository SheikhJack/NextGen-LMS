"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import FormModal from "./FormModal";

export type FormContainerClientProps = {
  table:
    | "teacher"
    | "student"
    | "parent"
    | "subject"
    | "class"
    | "lesson"
    | "exam"
    | "assignment"
    | "result"
    | "attendance"
    | "event"
    | "announcement";
  type: "create" | "update" | "delete";
  data?: any;
  id?: number | string;
  relatedData?: any;
};

const FormContainerClient = ({ table, type, data, id, relatedData }: FormContainerClientProps) => {
  const getButtonProps = () => {
    switch (type) {
      case "create":
        return {
          variant: "default" as const,
          icon: Plus,
          className: "bg-lamaYellow hover:bg-lamaYellow/90",
          title: "Create New",
        };
      case "update":
        return {
          variant: "ghost" as const,
          icon: Pencil,
          className: "text-lamaSky hover:text-lamaSky/90",
          title: "Edit",
        };
      case "delete":
        return {
          variant: "ghost" as const,
          icon: Trash2,
          className: "text-lamaPurple hover:text-lamaPurple/90",
          title: "Delete",
        };
    }
  };

  const buttonProps = getButtonProps();
  const dialogTitle = type === "delete" 
    ? `Delete ${table.charAt(0).toUpperCase() + table.slice(1)}` 
    : `${type.charAt(0).toUpperCase() + type.slice(1)} ${table.charAt(0).toUpperCase() + table.slice(1)}`;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={buttonProps.variant}
          size={type === "create" ? "default" : "icon"}
          className={buttonProps.className}
        >
          <buttonProps.icon className="h-4 w-4" />
          {type === "create" && buttonProps.title}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            {type === "delete" 
              ? `This action cannot be undone. This will permanently delete the ${table}.`
              : `Fill in the details to ${type} a ${table}.`
            }
          </DialogDescription>
        </DialogHeader>
        <FormModal
          table={table}
          type={type}
          data={data}
          id={id}
          relatedData={relatedData}
        />
      </DialogContent>
    </Dialog>
  );
};

export default FormContainerClient;
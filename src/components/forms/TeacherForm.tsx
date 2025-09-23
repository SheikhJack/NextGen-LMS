"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { createTeacher, updateTeacher } from "@/lib/actions";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";



const schema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  email: z.string().email({ message: "Invalid email address!" }).optional().or(z.literal('')),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" }),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  phone: z.string().min(1, { message: "Phone is required!" }),
  address: z.string().min(1, { message: "Address is required!" }),
  bloodType: z.string().min(1, { message: "Blood Type is required!" }),
  birthday: z.string().min(1, { message: "Birthday is required!" }),
  sex: z.enum(["MALE", "FEMALE"], { message: "Sex is required!" }),
  img: z.instanceof(File).optional().nullable(),
  classes: z.array(z.string()).optional().default([]),
  subjects: z.array(z.string()).optional().default([]),
});

type FormValues = z.infer<typeof schema>;


const TeacherForm = ({
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
  const [selectedClasses, setSelectedClasses] = useState<string[]>(data?.classes?.map((c: any) => c.id) || []);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(data?.subjects?.map((s: any) => s.id) || []);

  const [state, formAction, pending] = useActionState(
    type === "create" ? createTeacher : updateTeacher,
    { success: false, error: false, message: '' }
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: data?.username || "",
      email: data?.email || "",
      password: "",
      name: data?.name || "",
      surname: data?.surname || "",
      phone: data?.phone || "",
      address: data?.address || "",
      bloodType: data?.bloodType || "",
      birthday: data?.birthday ? new Date(data.birthday).toISOString().split('T')[0] : "",
      sex: data?.sex || undefined,
      classes: data?.classes?.map((c: any) => c.id) || [],
      subjects: data?.subjects?.map((s: any) => s.id) || [],
    },
  });

  useEffect(() => {
    if (state.success) {
      toast.success(state.message || (type === "create" ? "Teacher created successfully!" : "Teacher updated successfully!"));
      setOpen(false);
    } else if (state.error) {
      toast.error(state.message || `Failed to ${type} teacher`);
    }
  }, [state, type, setOpen]);



  const toggleClass = (classId: string) => {
    setSelectedClasses(prev =>
      prev.includes(classId)
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    );
  };

  const toggleSubject = (subjectId: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const sexValue = form.watch("sex");


  return (
    <Card>
      <CardHeader>
        <CardTitle>{type === "create" ? "Create New Teacher" : "Edit Teacher"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          {/* Remove onSubmit from form and use action prop instead */}
          <form action={formAction} className="space-y-6">
            {/* Add hidden fields for classes and subjects */}
            <input type="hidden" name="classes" value={selectedClasses.join(',')} />
            <input type="hidden" name="subjects" value={selectedSubjects.join(',')} />

            {/* Add ID for update */}
            {type === "update" && data?.id && (
              <input type="hidden" name="id" value={data.id} />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input {...field} name="username" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} name="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password{type === "update" && " (leave blank to keep current)"}</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} name="password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Add name attribute to all your form fields */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} name="name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="surname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} name="surname" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bloodType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Blood Type</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="birthday"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Birthday</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sex"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      >
                        <option value="">Select gender</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {/* Classes Selection */}
            <div className="space-y-4">
              <FormLabel>Classes</FormLabel>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {relatedData?.classes?.map((classItem: any) => (
                  <div key={classItem.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedClasses.includes(classItem.id.toString())}
                      onChange={() => toggleClass(classItem.id.toString())}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <label className="text-sm">
                      {classItem.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Subjects Selection */}
            <div className="space-y-4">
              <FormLabel>Subjects</FormLabel>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {relatedData?.subjects?.map((subject: any) => (
                  <div key={subject.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedSubjects.includes(subject.id.toString())}
                      onChange={() => toggleSubject(subject.id.toString())}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <label className="text-sm">
                      {subject.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Profile Image */}
            <FormField
              control={form.control}
              name="img"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>Profile Image</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => onChange(e.target.files?.[0] || null)}
                      name="img"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Processing..." : type === "create" ? "Create" : "Update"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default TeacherForm;
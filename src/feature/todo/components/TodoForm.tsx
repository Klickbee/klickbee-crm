"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import { Button } from "@/components/ui/Button"
import UploadButton from "@/components/ui/UploadButton"
import { useUserStore } from "@/feature/user/store/userStore"
import SearchableDropdown from "@/components/ui/SearchableDropdown"
import toast from "react-hot-toast"
import { TaskData } from "../types/types"
import CalendarDropDown from "@/components/ui/CalendarDropDown"
import CustomDropdown from "@/components/ui/CustomDropdown"

type TodoFormValues = {
    taskName: string
    linkedTo: string
    assignedId: string
    status: string
    priority: string
    dueDate: string
    notes: string
    files: File[]
}


const schema = Yup.object({
    taskName: Yup.string().trim().required("Task name is required"),
    linkedTo: Yup.string().trim(),
    assignedTo: Yup.string().trim(),
    status: Yup.string().required("Status is required"),
    priority: Yup.string().required("Priority is required"),
    dueDate: Yup.string().nullable(),
    notes: Yup.string(),
    files: Yup.array().of(Yup.mixed<File>()),
})


const initialValues: TodoFormValues = {
    taskName: "",
    linkedTo: "",
    assignedId: "",
    status: "",
    priority: "",
    dueDate: "",
    notes: "",
    files: [],
}

export default function TodoForm({
    onSubmit,
    onCancel,
    mode = 'add',
    initialData,
    usersLoading,
    userOptions,
}: {
    onSubmit: (values: TodoFormValues) => void
    onCancel: () => void
    mode?: 'add' | 'edit'
    initialData?: TaskData
    usersLoading: boolean
    userOptions: { id: string; value: string; label: string }[]
        }) {
    const [uploading, setUploading] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        const form = new FormData();
        for (let i = 0; i < files.length; i++) form.append("file", files[i]);

        setUploading(true);
        try {
            const res = await fetch("/api/uploadFile", { method: "POST", body: form });
            if (res.ok) {
                const json = await res.json();
                setUploadedFiles(prev => [...prev, ...json.files]);
                toast.success("Files uploaded successfully!");
            } else {
                toast.error("Upload failed. Please try again.");
            }
        } catch (error) {
            toast.error("Upload failed. Please check your connection and try again.");
        } finally {
            setUploading(false);
        }
    };

    // Get initial values based on mode and initial data
    const getInitialValues = (): TodoFormValues => {
        if (mode === 'edit' && initialData) {
            const initialVals: TodoFormValues = {
                taskName: initialData.taskName || '',
                linkedTo: typeof initialData.linkedTo === 'string'
                    ? initialData.linkedTo
                    : (initialData.linkedTo as { id: string })?.id || '',
                assignedId: typeof initialData.assignedTo === 'string'
                    ? initialData.assignedTo
                    : (() => {
                        // Find user by name from userOptions
                        const assignedToObj = initialData.assignedTo as { name: string; assignedImage?: string } | undefined;
                        if (assignedToObj?.name) {
                            const userOption = userOptions.find(option => option.label === assignedToObj.name);
                            return userOption ? userOption.value : '';
                        }
                        return '';
                    })(),
                status: initialData.status === 'Todo' ? 'to-do'
                    : initialData.status === 'InProgress' ? 'in-progress'
                    : initialData.status === 'OnHold' ? 'on-hold'
                    : initialData.status.toLowerCase(),
                priority: initialData.priority.toLowerCase(),
                dueDate: initialData.dueDate
                    ? new Date(initialData.dueDate).toISOString().split('T')[0]
                    : '',
                notes: initialData.notes || '',
                files: [], // Files are not pre-populated in edit mode for now
            };
            return initialVals;
        }
        return initialValues;
    };

    return (
        <Formik<TodoFormValues>
            enableReinitialize
            initialValues={getInitialValues()}
            validationSchema={schema}
            onSubmit={async (vals, { setSubmitting, resetForm }) => {
                try {
                    const payload = {
                        ...vals,
                        files: uploadedFiles
                    };

                    onSubmit(payload);
                    toast.success("Task saved successfully!");

                    // Only reset form in add mode, not in edit mode
                    if (mode === 'add') {
                        resetForm();
                    }
                } catch (error: any) {
                    toast.error("Failed to save task. Please try again.");
                } finally {
                    setSubmitting(false);
                }
            }}
        >
            {({ isSubmitting, isValid, dirty, values, setFieldValue, resetForm }) => (
                <Form className="flex min-h-full flex-col gap-4">
                    {/* Fields container */}
                    <div className="px-4 py-4 flex flex-col gap-4 ">
                        <FieldBlock name="taskName" label="Task Name">
                            <Field
                                id="taskName"
                                name="taskName"
                                placeholder="Add a name"
                                className="w-full text-sm rounded-md shadow-sm border border-[var(--border-gray)] bg-background px-3 py-2 outline-none focus:ring-1 focus:ring-gray-400 focus:outline-none"
                            />
                        </FieldBlock>

                        <FieldBlock name="linkedTo" label="Linked To">
                            <Field name="linkedTo">
                                {({ field, form }: any) => (
                                    <SearchableDropdown
                                        name="linkedTo"
                                        value={field.value || ""}
                                        options={userOptions}
                                        onChange={(val) => {
                                            form.setFieldValue("linkedTo", val);
                                            form.setFieldTouched("linkedTo", true);
                                        }}
                                        placeholder="Select Linked TO"
                                        showIcon={false}
                                        maxOptions={20}
                                    />
                                )}
                            </Field>
                        </FieldBlock>

                        <FieldBlock name="assignedId" label="Assigned To">
                            <Field name="assignedId">
                                {({ field, form }: any) => (
                                    <SearchableDropdown
                                        name="assignedId"
                                        value={field.value || ""}
                                        options={userOptions}
                                        onChange={(val) => {
                                            form.setFieldValue("assignedId", val);
                                            form.setFieldTouched("assignedId", true);
                                        }}
                                        placeholder="Select User"
                                        showIcon={false}
                                        maxOptions={20}
                                    />
                                )}
                            </Field>
                        </FieldBlock>

                        <div className="grid grid-cols-2 gap-3">
                            <FieldBlock name="status" label="Status">
                                <CustomDropdown
                                name="status"
                                value={values.status}
                                onChange={(val) => setFieldValue("status", val)}
                                placeholder="Select Status"
                                options={[
                                    { value: "to-do", label: "Todo" },
                                    { value: "in-progress", label: "In Progress" },
                                    { value: "on-hold", label: "On Hold" },
                                    { value: "done", label: "Done" },
                                ]}
                                />

                            </FieldBlock>

                            <FieldBlock name="priority" label="Priority">
                               <CustomDropdown
                                name="priority"
                                value={values.priority}
                                onChange={(val) => setFieldValue("priority", val)}
                                placeholder="Select Priority"
                                options={[
                                    { value: "urgent", label: "Urgent" },
                                    { value: "high", label: "High" },
                                    { value: "medium", label: "Medium" },
                                    { value: "low", label: "Low" },
                                ]}
                                />

                            </FieldBlock>
                        </div>

                        <FieldBlock name="dueDate" label="Due Date">
        
                        
                     <CalendarDropDown
                                label={values.dueDate ? new Date(values.dueDate).toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                }) : "Select due Date"}
                                value={values.dueDate ? new Date(values.dueDate) : null}
                                buttonClassName="min-w-[360px] bg-blue-50 hover:bg-blue-100"
                                onChange={(date) => setFieldValue("dueDate", date.toISOString().split('T')[0])}
                                          triggerIcon="calendar"

                            />
                        </FieldBlock>
                        <FieldBlock name="notes" label="Notes">
                            <Field
                                as="textarea"
                                id="notes"
                                name="notes"
                                rows={4}
                                placeholder="Add any internal notes or context..."
                                className="w-full text-sm resize-y shadow-sm rounded-md border  border-[var(--border-gray)] bg-background px-3 py-2 outline-none focus:ring-1 focus:ring-gray-400 focus:outline-none"
                            />
                        </FieldBlock>
                        <UploadButton values={values.files} setValue={(values) => setFieldValue('files', values)} uploading={uploading} uploadFile={(e) => handleFileChange(e)} />
                    </div>

                    {/* Footer: sticky to panel bottom */}
                    <div className="mt-auto  border-t border-[var(--border-gray)] p-4 flex items-center gap-3">
                        <Button
                            type="button"
                            className="flex-1"
                            onClick={() => {
                                resetForm()
                                onCancel()
                            }}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1 bg-black text-white" >
                            {mode === 'edit' ? 'Update Task' : 'Save Task'}
                        </Button>
                    </div>
                </Form>
            )}
        </Formik>
    )
}

function FieldBlock({
    name,
    label,
    children,
}: {
    name: string
    label: string
    children: React.ReactNode
}) {
    return (
        <div className="flex flex-col gap-2">
            <label htmlFor={name} className="text-sm font-medium">
                {label}
            </label>
            {children}
            <ErrorMessage name={name} component="div" className="text-sm text-red-600" />
        </div>
    )
}


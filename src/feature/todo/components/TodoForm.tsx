"use client"

import type React from "react"

import {useEffect, useState} from "react"
import {useForm, Controller} from "react-hook-form"
import {z} from "zod"
import {zodResolver} from "@hookform/resolvers/zod"
import {Button} from "@/components/ui/Button"
import UploadButton from "@/components/ui/UploadButton"
import SearchableDropdown from "@/components/ui/SearchableDropdown"
import toast from "react-hot-toast"
import {TaskData} from "../types/types"
import CalendarDropDown from "@/components/ui/CalendarDropDown"
import CustomDropdown from "@/components/ui/CustomDropdown"

type Status = "to-do" | "in-progress" | "on-hold" | "done"
type Priority = "urgent" | "high" | "medium" | "low"

const statusValues = ["to-do", "in-progress", "on-hold", "done"] as Status[]
const priorityValues = ["urgent", "high", "medium", "low"] as Priority[]

const todoSchema = z.object({
    taskName: z.string().trim().min(1, "Task name is required"),
    linkedTo: z.string().trim().optional(),
    assignedId: z.string().trim().optional(),
    status: z.enum(statusValues, {message: "Status is required"}),
    priority: z.enum(priorityValues,
        {message: "Priority is required"},
    ),
    dueDate: z.string().optional(),
    notes: z.string().optional(),
    files: z.array(z.any()).optional(),
})

type TodoFormValues = z.infer<typeof todoSchema>

const initialValues: TodoFormValues = {
    taskName: "",
    linkedTo: "",
    assignedId: "",
    status: "to-do",
    priority: "low",
    dueDate: "",
    notes: "",
    files: [],
}

export default function TodoForm({
                                     onSubmit,
                                     onCancel,
                                     mode = "add",
                                     initialData,
                                     userOptions,
                                 }: {
    onSubmit: (values: TodoFormValues) => void
    onCancel: () => void
    mode?: "add" | "edit"
    initialData?: TaskData
    userOptions: { id: string; value: string; label: string }[]
}) {
    const [uploading, setUploading] = useState(false)

    const getInitialValues = (): TodoFormValues => {
        if (mode === "edit" && initialData) {
            return {
                taskName: initialData.taskName || "",
                linkedTo: typeof initialData.linkedTo === "string"
                    ? initialData.linkedTo
                    : (initialData.linkedTo as { id: string })?.id || "",
                assignedId:
                    typeof initialData.assignedTo === "string"
                        ? initialData.assignedTo
                        : (() => {
                            const assignedToObj = initialData.assignedTo as {
                                name: string;
                                assignedImage?: string
                            } | undefined
                            if (assignedToObj?.name) {
                                const userOption = userOptions.find((option) => option.label === assignedToObj.name)
                                return userOption ? userOption.value : ""
                            }
                            return ""
                        })(),
                status:
                    initialData.status === "Todo"
                        ? "to-do"
                        : initialData.status === "InProgress"
                            ? "in-progress"
                            : initialData.status === "OnHold"
                                ? "on-hold"
                                : initialData.status.toLowerCase() as "done",
                priority: initialData.priority.toLowerCase() as "urgent" | "high" | "medium" | "low",
                dueDate: initialData.dueDate ? new Date(initialData.dueDate).toISOString().split("T")[0] : "",
                notes: initialData.notes || "",
                files: [],
            }
        }
        return initialValues
    }

    const formMethods = useForm<TodoFormValues>({
        resolver: zodResolver(todoSchema),
        defaultValues: getInitialValues(),
    })

    const {
        control,
        register,
        handleSubmit,
        formState: {errors, isSubmitting},
        reset,
        setValue,
        getValues,
    } = formMethods

    useEffect(() => {
        reset(getInitialValues())
    }, [initialData, mode, userOptions, reset])

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return
        const form = new FormData()
        for (let i = 0; i < files.length; i++) form.append("file", files[i])

        setUploading(true)
        try {
            const res = await fetch("/api/uploadFile", {method: "POST", body: form})
            if (res.ok) {
                const json = await res.json()
                const updatedFiles = [...(getValues("files") || []), ...json.files]
                setValue("files", updatedFiles, {shouldValidate: true})
                toast.success("Files uploaded successfully!")
            } else {
                toast.error("Upload failed. Please try again.")
            }
        } catch (error) {
            toast.error("Upload failed. Please check your connection and try again.")
        } finally {
            setUploading(false)
        }
    }

    const submitHandler = (vals: TodoFormValues) => {
        onSubmit({...vals, files: vals.files || []})
        toast.success("Task saved successfully!")
        if (mode === "add") {
            reset(initialValues)
        }
    }

    return (
        <form onSubmit={handleSubmit(submitHandler)} className="flex min-h-full flex-col gap-4">
            <div className="px-4 py-4 flex flex-col gap-4 ">
                <FieldBlock name="taskName" label="Task Name" error={errors.taskName?.message}>
                    <input
                        id="taskName"
                        {...register("taskName")}
                        placeholder="Add a name"
                        className="w-full text-sm rounded-md shadow-sm border border-[var(--border-gray)] bg-background px-3 py-2 outline-none focus:ring-1 focus:ring-gray-400 focus:outline-none"
                    />
                </FieldBlock>

                <FieldBlock name="linkedTo" label="Linked To" error={errors.linkedTo?.message}>
                    <Controller
                        name="linkedTo"
                        control={control}
                        render={({field}) => (
                            <SearchableDropdown
                                name="linkedTo"
                                value={field.value || ""}
                                options={userOptions}
                                onChange={(val) => field.onChange(val)}
                                placeholder="Select Linked TO"
                                showIcon={false}
                                maxOptions={20}
                            />
                        )}
                    />
                </FieldBlock>

                <FieldBlock name="assignedId" label="Assigned To" error={errors.assignedId?.message}>
                    <Controller
                        name="assignedId"
                        control={control}
                        render={({field}) => (
                            <SearchableDropdown
                                name="assignedId"
                                value={field.value || ""}
                                options={userOptions}
                                onChange={(val) => field.onChange(val)}
                                placeholder="Select User"
                                showIcon={false}
                                maxOptions={20}
                            />
                        )}
                    />
                </FieldBlock>

                <div className="grid grid-cols-2 gap-3">
                    <FieldBlock name="status" label="Status" error={errors.status?.message}>
                        <CustomDropdown
                            name="status"
                            value={getValues("status")}
                            onChange={(val) => setValue("status", val as Status, {shouldValidate: true})}
                            placeholder="Select Status"
                            options={[
                                {value: "to-do", label: "Todo"},
                                {value: "in-progress", label: "In Progress"},
                                {value: "on-hold", label: "On Hold"},
                                {value: "done", label: "Done"},
                            ]}
                        />
                    </FieldBlock>

                    <FieldBlock name="priority" label="Priority" error={errors.priority?.message}>
                        <CustomDropdown
                            name="priority"
                            value={getValues("priority")}
                            onChange={(val) => setValue("priority", val as Priority, {shouldValidate: true})}
                            placeholder="Select Priority"
                            options={[
                                {value: "urgent", label: "Urgent"},
                                {value: "high", label: "High"},
                                {value: "medium", label: "Medium"},
                                {value: "low", label: "Low"},
                            ]}
                        />
                    </FieldBlock>
                </div>

                <FieldBlock name="dueDate" label="Due Date" error={errors.dueDate?.message}>
                    <Controller
                        name="dueDate"
                        control={control}
                        render={({field}) => (
                            <CalendarDropDown
                                label={field.value ? new Date(field.value).toLocaleDateString("en-US", {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric"
                                }) : "Select due Date"}
                                value={field.value ? new Date(field.value) : null}
                                buttonClassName="min-w-[360px] bg-blue-50 hover:bg-blue-100"
                                onChange={(date) => field.onChange(date?.toISOString().split("T")[0])}
                                triggerIcon="calendar"
                            />
                        )}
                    />
                </FieldBlock>

                <FieldBlock name="notes" label="Notes" error={errors.notes?.message}>
          <textarea
              id="notes"
              {...register("notes")}
              rows={4}
              placeholder="Add any internal notes or context..."
              className="w-full text-sm resize-y shadow-sm rounded-md border  border-[var(--border-gray)] bg-background px-3 py-2 outline-none focus:ring-1 focus:ring-gray-400 focus:outline-none"
          />
                </FieldBlock>

                <UploadButton values={getValues("files") || []}
                              setValue={(values) => setValue("files", values, {shouldValidate: true})}
                              uploading={uploading} uploadFile={(e) => handleFileChange(e)}/>
            </div>

            <div className="mt-auto  border-t border-[var(--border-gray)] p-4 flex items-center gap-3">
                <Button
                    type="button"
                    className="flex-1"
                    onClick={() => {
                        reset(getInitialValues())
                        onCancel()
                    }}
                >
                    Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-black text-white" disabled={isSubmitting}>
                    {mode === "edit" ? "Update Task" : "Save Task"}
                </Button>
            </div>
        </form>
    )
}

function FieldBlock({
                        name,
                        label,
                        children,
                        error,
                    }: {
    name: string
    label: string
    children: React.ReactNode
    error?: string
}) {
    return (
        <div className="flex flex-col gap-2">
            <label htmlFor={name} className="text-sm font-medium">
                {label}
            </label>
            {children}
            {error ? <div className="text-sm text-red-600">{error}</div> : null}
        </div>
    )
}

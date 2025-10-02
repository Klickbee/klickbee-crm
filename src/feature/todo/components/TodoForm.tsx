"use client"

import type React from "react"

import { useState, type KeyboardEvent } from "react"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import { Button } from "@/components/ui/Button"
import { AlertTriangle, ArrowUp, ChevronUp, Minus, Trash2, UploadCloud } from "lucide-react"
import SearchableDropdown from "@/components/ui/SearchableDropdown"
import TagInput from "@/components/ui/TagInput"
import UploadButton from "@/components/ui/UploadButton"
import InputWithDropDown from "@/components/ui/InputWithDropDown"
import { options } from "@/feature/deals/libs/currencyOptions"

type TodoFormValues = {
    taskName: string
    linkto: string
    assigned: string
    status: string
    priority: string
    owner: string
    dueDate: string
    tags: string[]
    notes: string
    files: File[]
}
const priorities = [
  { value: "high", label: "High", icon: ArrowUp },
  { value: "urgent", label: "Urgent", icon: AlertTriangle },
  { value: "medium", label: "Medium", icon: ChevronUp },
  { value: "low", label: "Low", icon: Minus },
];

const schema = Yup.object({
    taskName: Yup.string().trim().required(""),
    linkto: Yup.string().trim().required("Company is required"),
    assigned: Yup.string().trim(),
    status: Yup.string().oneOf(["todo", "inprogress",  "onhold", "done"]).required("status is required"),
    priority: Yup.string().oneOf(["high", "urgent",  "medium", "low"]).required("status is required"),
    owner: Yup.string().trim().required("Owner is required"),
    dueDate: Yup.string().nullable(),
    tags: Yup.array().of(Yup.string().trim().min(1)).max(10, "Up to 10 tags"),
    notes: Yup.string(),
    files: Yup.array().of(Yup.mixed<File>()),
})

const initialValues: TodoFormValues = {
    taskName: "",
    linkto: "",
    assigned: "",
    status: "todo",
    priority: "high",
    owner: "Claire Brunet",
    dueDate: "",
    tags: [],
    notes: "",
    files: [],
}

export default function TodoForm({
    onSubmit,
    onCancel,
}: {
    onSubmit: (values: TodoFormValues) => void
    onCancel: () => void
}) {
    const [tagInput, setTagInput] = useState("")

    return (
        <Formik<TodoFormValues>
            initialValues={initialValues}
            validationSchema={schema}
            onSubmit={(vals, { setSubmitting, resetForm }) => {
                const cleaned = {
                    ...vals,
                    tags: vals.tags.map((t) => t.trim()).filter(Boolean),
                }
                onSubmit(cleaned)
                setSubmitting(false)
                resetForm()
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
                                className="w-full font-medium rounded-md shadow-sm border border-[var(--border-gray)] bg-background px-3 py-2 outline-none focus:ring-1 focus:ring-gray-400 focus:outline-none"
                            />
                        </FieldBlock>

                        <FieldBlock name="linkto" label="Linked To">
                            <Field
                                as="select"
                                id="linkto"
                                name="linkto"
                                className="w-full text-sm rounded-md shadow-sm border  border-[var(--border-gray)] bg-background px-3 py-2 outline-none focus:ring-1 focus:ring-gray-400 focus:outline-none"
                            >
                                <option>Claire Brunet</option>
                                <option>Alex Kim</option>
                                <option>Jordan Lee</option>
                            </Field>
                        </FieldBlock>

                        <FieldBlock name="assigned" label="Assigned To">
                            <Field
                                as="select"
                                id="assigned"
                                name="linkto"
                                className="w-full text-sm rounded-md shadow-sm border  border-[var(--border-gray)] bg-background px-3 py-2 outline-none focus:ring-1 focus:ring-gray-400 focus:outline-none"
                            >
                                <option>Claire Brunet</option>
                                <option>Alex Kim</option>
                                <option>Jordan Lee</option>
                            </Field>
                        </FieldBlock>

                        <div className="grid grid-cols-2 gap-3">
                            <FieldBlock name="status" label="Status">
                                <Field
                                    as="select"
                                    id="status"
                                    name="status"
                                    className="w-full text-sm rounded-md shadow-sm border  border-[var(--border-gray)] bg-background px-3 py-2 outline-none focus:ring-1 focus:ring-gray-400 focus:outline-none"
                                >
                                    <option value="todo">Todo</option>
                                    <option value="inprogress">In Progress</option>
                                    <option value="onhold">On Hold</option>
                                    <option value="done">Done</option>
                                </Field>
                            </FieldBlock>

                            <FieldBlock name="priority" label="Priority">
                                <Field
                                    as="select"
                                    id="priority"
                                    name="priority"
                                    className="w-full text-sm rounded-md shadow-sm border  border-[var(--border-gray)] bg-background px-3 py-2 outline-none focus:ring-1 focus:ring-gray-400 focus:outline-none"
                                >
                                    <option value="high">High</option>
                                    <option value="urgent">Urgent</option>
                                    <option value="medium">Medium</option>
                                    <option value="low">Low</option>
                                </Field>
                            </FieldBlock>
                        </div>

                        <FieldBlock name="dueDate" label="Due Date">
                            <Field
                                id="dueDate"
                                name="dueDate"
                                type="date"
                                className="w-full rounded-md text-sm shadow-sm border  border-[var(--border-gray)] bg-background px-3 py-2 outline-none focus:ring-1 focus:ring-gray-400 focus:outline-none"
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
                        <UploadButton values={values.files} setValue={(values) => setFieldValue('files', values)} />
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
                        <Button type="submit" className="flex-1 bg-black text-white" disabled={isSubmitting || !isValid || !dirty}>
                            Save Task
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
            <Error name={name} />
        </div>
    )
}

function Error({ name }: { name: string }) {
    return (
        <ErrorMessage
            name={name}
            render={(msg) => (
                <p role="alert" className="text-sm text-destructive">
                    {msg}
                </p>
            )}
        />
    )
}

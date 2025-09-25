"use client"

import type React from "react"

import { useState, type KeyboardEvent } from "react"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import { Button } from "@/components/ui/Button"
import { Trash2, UploadCloud } from "lucide-react"
import SearchableDropdown from "@/components/ui/SearchableDropdown"
import { companyOptions, contactOptions } from "../libs/companyData"

type DealFormValues = {
    dealName: string
    company: string
    contact: string
    stage: string
    amount: number | ""
    currency: string
    owner: string
    closeDate: string
    tags: string[]
    notes: string
    files: File[]
}

const schema = Yup.object({
    dealName: Yup.string().trim().required("Deal name is required"),
    company: Yup.string().trim().required("Company is required"),
    contact: Yup.string().trim(),
    stage: Yup.string().oneOf(["New", "Qualified", "Proposal", "Won", "Lost"]).required("Stage is required"),
    amount: Yup.number()
        .typeError("Enter a valid number")
        .min(0, "Amount cannot be negative")
        .required("Amount is required"),
    currency: Yup.string().oneOf(["USD", "EUR", "GBP"]).required("Currency is required"),
    owner: Yup.string().trim().required("Owner is required"),
    closeDate: Yup.string().nullable(),
    tags: Yup.array().of(Yup.string().trim().min(1)).max(10, "Up to 10 tags"),
    notes: Yup.string(),
    files: Yup.array().of(Yup.mixed<File>()),
})

const initialValues: DealFormValues = {
    dealName: "",
    company: "",
    contact: "",
    stage: "New",
    amount: 0,
    currency: "EUR",
    owner: "Claire Brunet",
    closeDate: "",
    tags: [],
    notes: "",
    files: [],
}

export default function DealForm({
    onSubmit,
    onCancel,
}: {
    onSubmit: (values: DealFormValues) => void
    onCancel: () => void
}) {
    const [tagInput, setTagInput] = useState("")

    function handleTagKeyDown(
        e: KeyboardEvent<HTMLInputElement>,
        values: DealFormValues,
        setFieldValue: (field: string, value: any) => void,
    ) {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault()
            const v = tagInput.trim()
            if (!v) return
            if (!values.tags.includes(v)) {
                setFieldValue("tags", [...values.tags, v])
            }
            setTagInput("")
        }
    }

    return (
        <Formik<DealFormValues>
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
                <Form className="flex min-h-full flex-col">
                    {/* Fields container */}
                    <div className="px-4 py-4 space-y-4">
                        <FieldBlock name="dealName" label="Deal Name">
                            <Field
                                id="dealName"
                                name="dealName"
                                placeholder="Add a name"
                                className="w-full rounded-md border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
                            />
                        </FieldBlock>

                        <FieldBlock name="company" label="Company">
                            <SearchableDropdown
                                name="company"
                                value={values.company}
                                options={companyOptions}
                                onChange={(val) => setFieldValue("company", val)}
                                placeholder="Search or create a company"
                            />
                        </FieldBlock>

                        <FieldBlock name="contact" label="Contact">
                            <SearchableDropdown
                                name="contact"
                                value={values.contact}
                                options={contactOptions}
                                onChange={(val) => setFieldValue("contact", val)}
                                placeholder="Add Contact"
                                showIcon={false}
                            />
                        </FieldBlock>

                        <div className="grid grid-cols-2 gap-3">
                            <FieldBlock name="stage" label="Stage">
                                <Field
                                    as="select"
                                    id="stage"
                                    name="stage"
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="New">New</option>
                                    <option value="Qualified">Qualified</option>
                                    <option value="Proposal">Proposal</option>
                                    <option value="Won">Won</option>
                                    <option value="Lost">Lost</option>
                                </Field>
                            </FieldBlock>

                            <FieldBlock name="amount" label="Amount">
                                <div className="flex rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring">
                                    {/* Amount Input */}
                                    <Field
                                        id="amount"
                                        name="amount"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="flex-1 rounded-l-md px-3 py-2 outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [appearance:textfield] w-1/4"
                                    />

                                    {/* Currency Select */}
                                    <div className="flex items-center gap-1 px-2 border-l">
                                        <Field
                                            as="select"
                                            id="currency"
                                            name="currency"
                                            className="rounded-md bg-transparent outline-none pr-2"
                                        >
                                            <option value="EUR">€</option>
                                            <option value="USD">$</option>
                                            <option value="GBP">£</option>
                                        </Field>
                                    </div>
                                </div>

                                <Error name="amount" />
                            </FieldBlock>

                        </div>

                        <FieldBlock name="owner" label="Owner">
                            <Field
                                as="select"
                                id="owner"
                                name="owner"
                                className="w-full rounded-md border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
                            >
                                <option>Claire Brunet</option>
                                <option>Alex Kim</option>
                                <option>Jordan Lee</option>
                            </Field>
                        </FieldBlock>

                        <FieldBlock name="closeDate" label="Close Date">
                            <Field
                                id="closeDate"
                                name="closeDate"
                                type="date"
                                className="w-full rounded-md border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
                            />
                        </FieldBlock>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Tags</label>
                            <div className="flex flex-wrap gap-2 rounded-md border border-dashed border-border p-2">
                                {values.tags.map((t, idx) => (
                                    <span
                                        key={`${t}-${idx}`}
                                        className="inline-flex items-center gap-2 rounded-md bg-gray-200 px-2 py-1 text-xs"
                                    >
                                        {t}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setFieldValue(
                                                    "tags",
                                                    values.tags.filter((_, i) => i !== idx),
                                                )
                                            }
                                            className="text-muted-foreground hover:text-foreground"
                                            aria-label={`Remove ${t}`}
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}

                                <input
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={(e) => handleTagKeyDown(e, values, setFieldValue)}
                                    placeholder="Add tags"
                                    className="flex-1 min-w-24 px-2 py-1 outline-none bg-transparent"
                                />
                            </div>
                            <Error name="tags" />
                        </div>

                        <FieldBlock name="notes" label="Notes">
                            <Field
                                as="textarea"
                                id="notes"
                                name="notes"
                                rows={4}
                                placeholder="Add any internal notes or context..."
                                className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
                            />
                        </FieldBlock>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Attached Files</label>
                            <div className="rounded-md border border-dashed border-border p-4">
                                <label className="flex cursor-pointer items-center gap-3">
                                    <UploadCloud className="size-5 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">
                                        Choose a file or drag & drop it here. PDF/JPG/PNG max 10 MB.
                                    </span>
                                    <input
                                        type="file"
                                        className="sr-only"
                                        multiple
                                        onChange={(e) => {
                                            const files = Array.from(e.currentTarget.files ?? [])
                                            console.log("Selected files:", files)
                                            setFieldValue("files", [...values.files, ...files])
                                        }}
                                    />
                                </label>
                            </div>

                            <ul className="space-y-2">
                                {values.files.map((f, i) => (
                                    <li
                                        key={`${f.name}-${i}`}
                                        className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                                    >
                                        <span className="text-sm truncate">{f.name}</span>
                                        <Button
                                            type="button"
                                            className="text-red-500 cursor-pointer"
                                            onClick={() => {
                                                const next = [...values.files]
                                                next.splice(i, 1)
                                                console.log("Remaining files:", next)
                                                setFieldValue("files", next)
                                            }}
                                        >
                                            <Trash2 className="mr-1 size-4" />
                                            Delete
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Footer: sticky to panel bottom */}
                    <div className="mt-auto border-t border-border px-4 py-3 flex items-center gap-3">
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
                        <Button type="submit" className="flex-1" disabled={isSubmitting || !isValid || !dirty}>
                            Save Deal
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
        <div className="space-y-1.5">
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

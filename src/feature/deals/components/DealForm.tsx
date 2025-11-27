"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/Button"
import SearchableDropdown from "@/components/ui/SearchableDropdown"
import TagInput from "@/components/ui/TagInput"
import UploadButton from "@/components/ui/UploadButton"
import toast from "react-hot-toast"
import CalendarDropDown from "@/components/ui/CalendarDropDown"
import CustomDropdown from "@/components/ui/CustomDropdown"
import { getCompanyOptions, getContactOptions } from "../libs/companyData"
import { useCompaniesStore } from "@/feature/companies/stores/useCompaniesStore"
import { useCustomersStore } from "@/feature/customers/stores/useCustomersStore"
import { Deal } from "../types"
import { validateCompany, validateContact, validateOwner } from "@/feature/forms/lib/formValidation"

const dealSchema = z.object({
    dealName: z.string().trim().min(1, "Deal Name is required"),
    company: z
        .string()
        .trim()
        .refine(async (id) => !id || (await validateCompany(id)), { message: "Company does not exist" }),
    contact: z
        .string()
        .trim()
        .refine(async (id) => !id || (await validateContact(id)), { message: "Contact does not exist" }),
    stage: z
        .string()
        .trim()
        .refine((val) => ["New", "Contacted", "Proposal", "Negotiation", "Won", "Lost"].includes(val), {
            message: "Stage is required",
        }),
    amount: z
        .union([
            z.number({ error: "Enter a valid number" }),
            z.nan().transform(() => 0),
        ])
        .refine((val) => val >= 0, { message: "Amount cannot be negative" }),
    currency: z.enum(["USD", "EUR", "GBP"], { error: "Currency is required" }),
    owner: z
        .string()
        .trim()
        .refine(async (id) => !id || (await validateOwner(id)), { message: "User does not exist" }),
    closeDate: z.string().optional().or(z.literal("")),
    tags: z.array(z.string().trim().min(1)).max(10, "Up to 10 tags"),
    notes: z.string().optional().or(z.literal("")),
    files: z.array(z.instanceof(File)).optional(),
})

type DealFormValues = z.infer<typeof dealSchema>

const initialValues: DealFormValues = {
    dealName: "",
    company: "",
    contact: "",
    stage: "New",
    amount: 0,
    currency: "EUR",
    owner: "",
    closeDate: "",
    tags: [],
    notes: "",
    files: [],
}

export default function DealForm({
    onSubmit,
    onCancel,
    mode = "add",
    initialData,
    usersLoading: _usersLoading,
    userOptions,
    currentUserId,
    defaultStage,
}: {
    onSubmit: (values: DealFormValues) => void
    onCancel: () => void
    mode?: "add" | "edit"
    initialData?: Deal
    usersLoading: boolean
    userOptions: { id: string; value: string; label: string }[]
    currentUserId?: any
    defaultStage?: Deal["stage"]
}) {
    const [tagInput, setTagInput] = useState("")
    const [uploading, setUploading] = useState(false)
    const [uploadedFiles, setUploadedFiles] = useState<any[]>([])
    const { lastCompanyId } = useCompaniesStore()
    const { lastContactId } = useCustomersStore()

    useEffect(() => {
        useCompaniesStore.getState().fetchCompanies()
        useCustomersStore.getState().fetchCustomers()
    }, [])

    const getInitialValues = (): DealFormValues => {
        if (mode === "edit" && initialData) {
            const ownerValue = (() => {
                const o = (initialData as any).owner
                if (typeof o === "object" && o) {
                    return o.id ?? ""
                }
                if (typeof o === "string") {
                    return o
                }
                return ""
            })()

            const companyValue = (() => {
                const c = (initialData as any).company
                if (typeof c === "object" && c) {
                    return c.id ?? ""
                }
                if (typeof c === "string") {
                    return c
                }
                return ""
            })()

            const contactValue = (() => {
                const c = (initialData as any).contact
                if (typeof c === "object" && c) {
                    return c.id ?? ""
                }
                if (typeof c === "string") {
                    return c
                }
                return ""
            })()

            return {
                dealName: initialData.dealName || "",
                company: companyValue,
                contact: contactValue,
                stage: initialData.stage || "New",
                amount: initialData.amount || 0,
                currency: "EUR",
                owner:
                    typeof initialData.owner === "object" && initialData.owner
                        ? initialData.owner.id || ""
                        : typeof initialData.owner === "string"
                            ? initialData.owner
                            : "",
                closeDate: initialData.closeDate
                    ? new Date(initialData.closeDate).toISOString().split("T")[0]
                    : "",
                tags: initialData.tags
                    ? typeof initialData.tags === "string"
                        ? initialData.tags
                            .split(",")
                            .map((tag) => tag.trim())
                            .filter(Boolean)
                        : Array.isArray(initialData.tags)
                            ? (initialData.tags as string[]).filter(Boolean)
                            : []
                    : [],
                notes: initialData.notes || "",
                files: [],
            }
        }

        return {
            ...initialValues,
            stage: defaultStage || initialValues.stage,
            company: lastCompanyId || "",
            contact: lastContactId || "",
            owner: userOptions.find((u) => u.id === currentUserId)?.id || "",
        }
    }

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<DealFormValues>({
        resolver: zodResolver(dealSchema),
        defaultValues: getInitialValues(),
    })

    useEffect(() => {
        reset(getInitialValues())
    }, [initialData, mode, userOptions, currentUserId, lastCompanyId, lastContactId, defaultStage, reset])

    const values = watch()

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return
        const form = new FormData()
        for (let i = 0; i < files.length; i++) form.append("file", files[i])

        setUploading(true)
        const res = await fetch("/api/uploadFile", { method: "POST", body: form })
        setUploading(false)
        if (res.ok) {
            const json = await res.json()
            setUploadedFiles((prev) => [...prev, ...json.files])
        } else {
            toast.error("Upload failed")
        }
    }

    const onSubmitHandler = handleSubmit((vals) => {
        const payload = {
            ...vals,
            amount: Number(vals.amount) || 0,
            tags: vals.tags ? vals.tags.map((t) => t.trim()).filter(Boolean) : [],
            files: uploadedFiles,
        }
        onSubmit(payload)
        if (mode === "add") {
            reset(getInitialValues())
            setTagInput("")
            setUploadedFiles([])
        }
    })

    return (
        <form onSubmit={onSubmitHandler} className="flex min-h-full flex-col gap-4">
            <div className="px-4 py-4 flex flex-col gap-4 ">
                <FieldBlock name="dealName" label="Deal Name" error={errors.dealName?.message}>
                    <input
                        id="dealName"
                        {...register("dealName")}
                        placeholder="Add a name"
                        className="w-full font-medium rounded-md shadow-sm border border-[var(--border-gray)] bg-background px-3 py-2 outline-none focus:ring-1 focus:ring-gray-400 focus:outline-none"
                    />
                </FieldBlock>

                <FieldBlock name="company" label="Company" error={errors.company?.message}>
                    <SearchableDropdown
                        name="company"
                        value={values.company}
                        options={getCompanyOptions()}
                        onChange={(val) => setValue("company", val, { shouldValidate: true })}
                        placeholder="Search or create a company"
                    />
                </FieldBlock>

                <FieldBlock name="contact" label="Contact" error={errors.contact?.message}>
                    <SearchableDropdown
                        name="contact"
                        value={values.contact}
                        options={getContactOptions()}
                        onChange={(val) => setValue("contact", val, { shouldValidate: true })}
                        placeholder="Add Contact"
                        showIcon={false}
                    />
                </FieldBlock>

                <div className="grid grid-cols-2 gap-3">
                    <FieldBlock name="stage" label="Stage" error={errors.stage?.message}>
                        <CustomDropdown
                            name="stage"
                            value={values.stage}
                            onChange={(val) => setValue("stage", val, { shouldValidate: true })}
                            openByDefault={false}
                            options={[
                                { value: "New", label: "New" },
                                { value: "Contacted", label: "Contacted" },
                                { value: "Proposal", label: "Proposal Sent" },
                                { value: "Negotiation", label: "Negotiation" },
                                { value: "Won", label: "Won" },
                                { value: "Lost", label: "Lost" },
                            ]}
                        />
                    </FieldBlock>

                    <FieldBlock name="amount" label="Amount" error={errors.amount?.message}>
                        <div className="flex items-center">
                            <input
                                id="amount"
                                type="number"
                                {...register("amount", { valueAsNumber: true })}
                                placeholder="Enter amount"
                                className="flex-1 text-sm w-25 rounded-md shadow-sm border border-[var(--border-gray)] bg-background   px-2 py-2 outline-none focus:ring-1 focus:ring-gray-400 focus:outline-none"
                            />

                            <CustomDropdown
                                name="currency"
                                value={values.currency}
                                onChange={(val) => setValue("currency", val as DealFormValues["currency"], { shouldValidate: true })}
                                placeholder="Currency"
                                options={[
                                    { value: "USD", label: "$" },
                                    { value: "EUR", label: "€" },
                                    { value: "GBP", label: "£" },
                                ]}
                            />
                        </div>
                    </FieldBlock>
                </div>

                <FieldBlock name="owner" label="Owner" error={errors.owner?.message}>
                    <SearchableDropdown
                        name="owner"
                        value={values.owner}
                        options={userOptions}
                        onChange={(val) => setValue("owner", val, { shouldValidate: true })}
                        placeholder="Select Owner"
                        showIcon={false}
                        maxOptions={20}
                    />
                </FieldBlock>

                <FieldBlock name="closeDate" label="Close Date" error={errors.closeDate?.message}>
                    <CalendarDropDown
                        label={
                            values.closeDate
                                ? new Date(values.closeDate).toLocaleDateString("en-US", {
                                      month: "long",
                                      day: "numeric",
                                      year: "numeric",
                                  })
                                : "Select closed Date"
                        }
                        value={values.closeDate ? new Date(values.closeDate) : null}
                        buttonClassName="min-w-[360px] bg-blue-50 hover:bg-blue-100"
                        triggerIcon="calendar"
                        onChange={(date) => setValue("closeDate", date.toISOString().split("T")[0], { shouldValidate: true })}
                    />
                </FieldBlock>

                <TagInput
                    name="Tags"
                    values={values.tags}
                    setValue={(vals: string[]) => setValue("tags", vals, { shouldValidate: true })}
                    input={tagInput}
                    setInput={(value: string) => setTagInput(value)}
                />
                {errors.tags?.message && <p className="text-sm text-red-600">{errors.tags.message}</p>}

                <FieldBlock name="notes" label="Notes" error={errors.notes?.message}>
                    <textarea
                        id="notes"
                        {...register("notes")}
                        rows={4}
                        placeholder="Add any internal notes or context..."
                        className="w-full text-sm resize-y shadow-sm rounded-md border  border-[var(--border-gray)] bg-background px-3 py-2 outline-none focus:ring-1 focus:ring-gray-400 focus:outline-none"
                    />
                </FieldBlock>
                <UploadButton
                    values={values.files ?? []}
                    setValue={(vals) => setValue("files", vals, { shouldValidate: true })}
                    uploading={uploading}
                    uploadFile={(e) => handleFileChange(e)}
                />
                {errors.files && <p className="text-sm text-red-600">{errors.files.message as string}</p>}
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
                    {mode === "edit" ? "Update Deal" : "Save Deal"}
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
            {error && (
                <p className="text-sm text-red-600" role="alert">
                    {error}
                </p>
            )}
        </div>
    )
}

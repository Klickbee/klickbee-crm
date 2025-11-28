"use client"

import type React from "react"
import {useEffect, useState} from "react"
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {z} from "zod"
import {Button} from "@/components/ui/Button"
import SearchableDropdown from "@/components/ui/SearchableDropdown"
import {useCompaniesStore} from "@/feature/companies/stores/useCompaniesStore"
import {Prospect} from "../types/types"
import {getCompanyOptions} from "../libs/companyData"
import TagInput from "@/components/ui/TagInput"
import CustomDropdown from "@/components/ui/CustomDropdown"
import {validateCompany, validateOwner} from "@/feature/forms/lib/formValidation";
import {useSession} from "next-auth/react";

const prospectSchema = z.object({
    fullName: z.string().trim().min(1, "Full name is required"),
    company: z.string().refine(async (id) => {
        return await validateCompany(id);
    }, {
        message: "Company does not exist"
    }),
    email: z.email("Please enter a valid email address").trim(),
    phone: z.union([
        z
            .string()
            .trim()
            .regex(/^[+]?[0-9\s\-()]{10,}$/, "Please enter a valid phone number"),
        z.literal(""),
    ]),
    status: z
        .string()
        .trim()
        .refine(
            (val) => ["New", "Qualified", "Converted", "Cold", "Warmlead", "Notintrested"].includes(val),
            {message: "Status is required"}
        ),
    owner: z.string().refine(async (id) => {
        return await validateOwner(id);
    }, {
        message: "User does not exist"
    }), tags: z.array(z.string().trim().min(1)).max(10, "Up to 10 tags allowed"),
    notes: z.string().optional().or(z.literal("")),
})

type ProspectFormValues = z.infer<typeof prospectSchema>

const baseInitialValues: ProspectFormValues = {
    fullName: "",
    company: "",
    email: "",
    status: "",
    phone: "",
    owner: "",
    tags: [],
    notes: "",
}

export default function ProspectForm({
                                         onSubmit,
                                         onCancel,
                                         mode = "add",
                                         initialData,
                                         usersLoading: _usersLoading,
                                         userOptions,
                                     }: {
    onSubmit: (values: ProspectFormValues) => void
    onCancel: () => void
    mode?: "add" | "edit"
    initialData?: Prospect
    usersLoading: boolean
    userOptions: { id: string; value: string; label: string }[]
}) {
    const [tagInput, setTagInput] = useState("")
    const {lastCompanyId} = useCompaniesStore();
    const {data: userData} = useSession();

    useEffect(() => {
        useCompaniesStore.getState().fetchCompanies()
    }, [])

    const getInitialValues = (userData: { user: { id: string } | null } | null): ProspectFormValues => {
        if (mode === "edit" && initialData) {
            const {companies} = useCompaniesStore.getState()

            let companyValue = ""
            if (initialData.company) {
                const companyById = companies.find((c) => c.id === initialData.company)
                if (companyById) {
                    companyValue = companyById.id
                } else {
                    const companyByName = companies.find(
                        (c) => c.fullName?.toLowerCase() === initialData.company?.toLowerCase()
                    )
                    companyValue = companyByName ? companyByName.id : ""
                }
            }

            return {
                fullName: initialData.fullName || "",
                company: companyValue,
                email: initialData.email || "",
                status: initialData.status || "",
                phone: initialData.phone || "",
                owner:
                    typeof initialData.owner === "object" && initialData.owner
                        ? initialData.owner.id || ""
                        : (initialData.owner as string) || "",
                tags: (() => {
                    const tags = initialData.tags
                    if (!tags) return []
                    if (Array.isArray(tags)) {
                        return (tags as string[]).filter(Boolean)
                    }
                    if (typeof tags === "string") {
                        return (tags as string)
                            .split(",")
                            .map((tag) => tag.trim())
                            .filter(Boolean)
                    }
                    return []
                })(),
                notes: initialData.notes || "",
            }
        }

        return {
            ...baseInitialValues,
            company: lastCompanyId || "",
            owner: userData?.user?.id || "",
        }
    }

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        watch,
        formState: {errors, isSubmitting},
    } = useForm<ProspectFormValues>({
        resolver: zodResolver(prospectSchema),
        defaultValues: getInitialValues(userData),
    })

    useEffect(() => {
        reset(getInitialValues(userData))
    }, [initialData, mode, userOptions, reset])

    const values = watch()

    const onSubmitHandler = handleSubmit((vals) => {
        const payload = {
            ...vals,
            tags: vals.tags ? vals.tags.map((t) => t.trim()).filter(Boolean) : [],
        }

        onSubmit(payload)

        if (mode === "add") {
            reset(getInitialValues(userData))
            setTagInput("")
        }
    })

    return (
        <form onSubmit={onSubmitHandler} className="flex min-h-full flex-col gap-4">
            <div className="px-4 py-4 flex flex-col gap-4 ">
                <FieldBlock name="fullName" label="Full Name" error={errors.fullName?.message}>
                    <input
                        id="fullName"
                        {...register("fullName")}
                        placeholder="Add a name"
                        className="w-full font-medium rounded-md shadow-sm border border-[var(--border-gray)] bg-background px-3 py-2 outline-none focus:ring-1 focus:ring-gray-400 focus:outline-none"
                    />
                </FieldBlock>

                <FieldBlock name="company" label="Company" error={errors.company?.message}>
                    <SearchableDropdown
                        name="company"
                        value={values.company}
                        options={getCompanyOptions()}
                        onChange={(val) => setValue("company", val, {shouldValidate: true})}
                        placeholder="Search or create a company"
                    />
                </FieldBlock>

                <FieldBlock name="email" label="Email" error={errors.email?.message}>
                    <input
                        id="email"
                        {...register("email")}
                        placeholder="e.g. example@company.com"
                        className="w-full font-medium rounded-md shadow-sm border border-[var(--border-gray)] bg-background px-3 py-2 outline-none focus:ring-1 focus:ring-gray-400 focus:outline-none"
                    />
                </FieldBlock>

                <FieldBlock name="phone" label="Phone" error={errors.phone?.message}>
                    <input
                        id="phone"
                        {...register("phone")}
                        placeholder="+33 45832812"
                        className="w-full font-medium rounded-md shadow-sm border border-[var(--border-gray)] bg-background px-3 py-2 outline-none focus:ring-1 focus:ring-gray-400 focus:outline-none"
                    />
                </FieldBlock>

                <FieldBlock name="owner" label="Owner" error={errors.owner?.message}>
                    <SearchableDropdown
                        name="owner"
                        value={values.owner}
                        options={userOptions}
                        onChange={(val) => setValue("owner", val, {shouldValidate: true})}
                        placeholder="Select Owner"
                        showIcon={false}
                        maxOptions={20}
                    />
                </FieldBlock>

                <FieldBlock name="status" label="Status" error={errors.status?.message}>
                    <CustomDropdown
                        name="status"
                        value={values.status}
                        onChange={(val) => setValue("status", val, {shouldValidate: true})}
                        placeholder="Select Status"
                        options={[
                            {value: "New", label: "New"},
                            {value: "Cold", label: "Cold"},
                            {value: "Qualified", label: "Qualified"},
                            {value: "Warmlead", label: "Warm Lead"},
                            {value: "Converted", label: "Converted"},
                            {value: "Notintrested", label: "Not Interested"},
                        ]}
                    />
                </FieldBlock>

                <TagInput
                    name="Tags"
                    values={values.tags}
                    setValue={(vals: string[]) => setValue("tags", vals, {shouldValidate: true})}
                    input={tagInput}
                    setInput={(value: string) => setTagInput(value)}
                />
                {errors.tags?.message && <p className="text-sm text-red-600">{errors.tags.message}</p>}

                <FieldBlock name="notes" label="Notes" error={errors.notes?.message}>
                    <textarea
                        id="notes"
                        rows={4}
                        {...register("notes")}
                        placeholder="Add any internal notes or context..."
                        className="w-full text-sm resize-y shadow-sm rounded-md border  border-[var(--border-gray)] bg-background px-3 py-2 outline-none focus:ring-1 focus:ring-gray-400 focus:outline-none"
                    />
                </FieldBlock>
            </div>

            <div className="mt-auto  border-t border-[var(--border-gray)] p-4 flex items-center gap-3">
                <Button
                    type="button"
                    className="flex-1"
                    onClick={() => {
                        reset(getInitialValues(userData))
                        onCancel()
                    }}
                >
                    Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-black text-white" disabled={isSubmitting}>
                    Save Prospect
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
                <p role="alert" className="text-sm text-red-600">
                    {error}
                </p>
            )}
        </div>
    )
}

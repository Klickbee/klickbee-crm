"use client"

import React, {useEffect} from "react"
import {useState} from "react"
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import * as z from "zod"
import {Button} from "@/components/ui/Button"
import TagInput from "@/components/ui/TagInput"
import UploadButton from "@/components/ui/UploadButton"
import SearchableDropdown from "@/components/ui/SearchableDropdown"
import {Company} from "../types/types"
import CustomDropdown from "@/components/ui/CustomDropdown"
import {validateOwner} from "@/feature/forms/lib/formValidation"
import {getSession, useSession} from "next-auth/react";

type CompanyFormValues = z.infer<typeof zodSchema>;

const zodSchema = z.object({
    fullName: z.string().min(1, "Company name is required"),
    industry: z.string().min(1, "Industry is required"),
    email: z.email("Please enter a valid email address").optional(),
    website: z.hostname({error: "Please enter a valid website URL"}).or(z.url({error: "Please enter a valid website URL"})).optional(),
    status: z.enum(["Active", "FollowUp", "inactive"], {
        error: "Status is required",
    }),
    //phone regex
    phone: z
        .union([
            z.literal(""), // chaîne vide acceptée
            z.string().regex(/^\+?[0-9]{6,15}$/, {message: "Invalid phone number"})
        ])
        .optional(),
    owner: z
        .string()
        .trim()
        .refine(async (id) => await validateOwner(id), {message: "User does not exist"}),
    tags: z.array(z.string().min(1)).max(10, "Up to 10 tags allowed").optional(),
    assign: z.array(z.string().min(1)).max(10, "Up to 10 assignments allowed").optional(),
    notes: z.string().optional(),
    files: z.array(z.instanceof(File)).optional(),
})

const initialValues: CompanyFormValues = {
    fullName: "",
    industry: "",
    email: "",
    website: "",
    status: "Active",
    phone: "",
    owner: "",
    tags: [],
    assign: [],
    notes: "",
    files: [],
}

export default function CompaniesForm({
                                          onSubmit,
                                          onCancel,
                                          mode = "add",
                                          initialData,
                                          userOptions,
                                      }: {
    onSubmit: (values: CompanyFormValues) => void
    onCancel: () => void
    mode?: "add" | "edit"
    initialData?: Company
    usersLoading: boolean
    userOptions: { id: string; value: string; label: string }[]
}) {
    const [tagInput, setTagInput] = useState("")
    const [assignInput, setAssignInput] = useState("")
    const [uploading, setUploading] = useState(false)
    const [uploadedFiles, setUploadedFiles] = useState<any[]>([])
    const {data: userData} = useSession();

    // 🧩 Compute initial values like avant
    const getInitialValues = (userData: { user: { id: string } | null } | null): CompanyFormValues => {
        if (mode === "edit" && initialData) {
            return {
                fullName: initialData.fullName || "",
                industry: initialData.industry || "",
                email: initialData.email || "",
                website: initialData.website || "",
                status: initialData.status || "Active",
                phone: initialData.phone || "",
                owner: (() => {
                    if (typeof initialData.owner === "object" && initialData.owner) {
                        return initialData.owner.id || ""
                    }
                    if (typeof initialData.owner === "string") {
                        const ownerString = initialData.owner as string
                        const option = userOptions.find((opt) => opt.id === ownerString)
                        return option ? option.id : ownerString
                    }
                    return ""
                })(),
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
                assign: [],
                notes: "",
                files: [],
            }
        } else {
            return {
                ...initialValues,
                owner: userData?.user?.id || "",
            }
        }
    }

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: {errors},
        watch,
    } = useForm<CompanyFormValues>({
        resolver: zodResolver(zodSchema),
        defaultValues: getInitialValues(userData),
    })

    const values = watch()

    useEffect(() => {
        reset(getInitialValues(userData))
    }, [mode, initialData])

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return
        const form = new FormData()
        for (let i = 0; i < files.length; i++) form.append("file", files[i])

        setUploading(true)
        const res = await fetch("/api/uploadFile", {method: "POST", body: form})
        setUploading(false)
        if (res.ok) {
            const json = await res.json()
            setUploadedFiles((prev) => [...prev, ...json.files])
            setValue("files", json.files)
        } else {
            alert("Upload failed")
        }
    }

    const submitHandler = (vals: CompanyFormValues) => {
        const payload = {
            ...vals,
            assign: vals.assign ? vals.assign.map((t) => t.trim()).filter(Boolean) : [],
            tags: vals.tags ? vals.tags.map((t) => t.trim()).filter(Boolean) : [],
            files: uploadedFiles,
        }
        onSubmit(payload)
        if (mode === "add") reset(initialValues)
    }

    return (
        <form
            onSubmit={handleSubmit(submitHandler)}
            className="flex min-h-full flex-col gap-4"
        >
            <div className="px-4 py-4 flex flex-col gap-4 ">
                <FieldBlock name="fullName" label="Company name" error={errors.fullName?.message}>
                    <input
                        id="fullName"
                        {...register("fullName")}
                        placeholder="Add a name"
                        className="w-full font-medium rounded-md shadow-sm border border-[var(--border-gray)] bg-background px-3 py-2 outline-none focus:ring-1 focus:ring-gray-400 focus:outline-none"
                    />
                </FieldBlock>

                <FieldBlock name="industry" label="Industry" error={errors.industry?.message}>
                    <select
                        id="industry"
                        {...register("industry")}
                        className="w-full text-sm rounded-md shadow-sm border border-[var(--border-gray)] bg-background px-3 py-2 outline-none focus:ring-1 focus:ring-gray-400 focus:outline-none"
                    >
                        <option value="" disabled>
                            Select Industry
                        </option>
                        <option value="Technology">Technology</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Finance">Finance</option>
                        <option value="Education">Education</option>
                        <option value="Retail">Retail</option>
                        <option value="Manufacturing">Manufacturing</option>
                        <option value="Real Estate">Real Estate</option>
                        <option value="Other">Other</option>
                    </select>
                </FieldBlock>

                <FieldBlock name="website" label="Website" error={errors.website?.message}>
                    <input
                        id="website"
                        {...register("website")}
                        placeholder="www.example.com"
                        className="w-full font-medium rounded-md shadow-sm border border-[var(--border-gray)] bg-background px-3 py-2 outline-none focus:ring-1 focus:ring-gray-400 focus:outline-none"
                    />
                </FieldBlock>

                <FieldBlock name="email" label="Email" error={errors.email?.message}>
                    <input
                        id="email"
                        {...register("email")}
                        placeholder="eg. example@company.com"
                        className="w-full font-medium rounded-md shadow-sm border border-[var(--border-gray)] bg-background px-3 py-2 outline-none focus:ring-1 focus:ring-gray-400 focus:outline-none"
                    />
                </FieldBlock>

                <FieldBlock name="phone" label="Phone" error={errors.phone?.message}>
                    <input
                        id="phone"
                        {...register("phone")}
                        placeholder="+3345832812"
                        className="w-full font-medium rounded-md shadow-sm border border-[var(--border-gray)] bg-background px-3 py-2 outline-none focus:ring-1 focus:ring-gray-400 focus:outline-none"
                    />
                </FieldBlock>

                <TagInput
                    name="Assign People"
                    values={values.assign}
                    setValue={(v: string[]) => setValue("assign", v)}
                    input={assignInput}
                    setInput={setAssignInput}
                />

                <FieldBlock name="owner" label="Owner" error={errors.owner?.message}>
                    <SearchableDropdown
                        name="owner"
                        value={values.owner || ""}
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
                        onChange={(val) => setValue("status", val as "Active" | "FollowUp" | "inactive")}
                        placeholder="Select Status"
                        options={[
                            {value: "Active", label: "Active"},
                            {value: "FollowUp", label: "Follow Up"},
                            {value: "inactive", label: "Inactive"},
                        ]}
                    />
                </FieldBlock>

                <TagInput
                    name="Tags"
                    values={values.tags}
                    setValue={(v: string[]) => setValue("tags", v)}
                    input={tagInput}
                    setInput={setTagInput}
                />

                <FieldBlock name="notes" label="Notes" error={errors.notes?.message}>
					<textarea
                        id="notes"
                        {...register("notes")}
                        rows={4}
                        placeholder="Add any internal notes or context..."
                        className="w-full text-sm resize-y shadow-sm rounded-md border border-[var(--border-gray)] bg-background px-3 py-2 outline-none focus:ring-1 focus:ring-gray-400 focus:outline-none"
                    />
                </FieldBlock>

                <UploadButton
                    values={values.files}
                    setValue={(v) => setValue("files", v)}
                    uploading={uploading}
                    uploadFile={handleFileChange}
                />
            </div>

            <div className="mt-auto border-t border-[var(--border-gray)] p-4 flex items-center gap-3">
                <Button
                    type="button"
                    className="flex-1"
                    onClick={() => {
                        reset()
                        onCancel()
                    }}
                >
                    Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-black text-white">
                    Save Company
                </Button>
            </div>
        </form>
    )
}

function FieldBlock({
                        name,
                        label,
                        error,
                        children,
                    }: {
    name: string
    label: string
    error?: string
    children: React.ReactNode
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

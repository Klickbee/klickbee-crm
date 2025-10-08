"use client"

import type React from "react"

import { useEffect, useState, type KeyboardEvent } from "react"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import { Button } from "@/components/ui/Button"
import TagInput from "@/components/ui/TagInput"
import UploadButton from "@/components/ui/UploadButton"
import { useUserStore } from "@/feature/user/store/userStore"
import SearchableDropdown from "@/components/ui/SearchableDropdown"

type CompanyFormValues = {
    fullName: string
    industry: string
    email: string
    status: string
    phone: string
    website: string
    owner: string
    tags: string[]
    assing: string[]
    notes: string
    files: File[]
}

const schema = Yup.object({
    fullName: Yup.string().trim().required("Company name is required"),
    industry: Yup.string().trim().required("Industry is required"),
    email: Yup.string().trim().email("Please enter a valid email address"),
    website: Yup.string().trim().url("Please enter a valid website URL"),
    status: Yup.string().oneOf(["Active", "Follow Up", "inactive"]).required("Status is required"),
    phone: Yup.string().trim().matches(/^[\+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number"),
    owner: Yup.string().trim().required("Owner is required"),
    tags: Yup.array().of(Yup.string().trim().min(1)).max(10, "Up to 10 tags allowed"),
    assing: Yup.array().of(Yup.string().trim().min(1)).max(10, "Up to 10 assignments allowed"),
    notes: Yup.string(),
    files: Yup.array().of(Yup.mixed<File>()),
})

const initialValues: CompanyFormValues = {
    fullName: "",
    industry: "",
    email: "",
    website: "",
    status: "",
    phone: "",
    owner: "Claire Brunet",
    tags: [],
    assing: [],
    notes: "",
    files: [],
}

export default function CustomerForm({
    onSubmit,
    onCancel,
}: {
    onSubmit: (values: CompanyFormValues) => void
    onCancel: () => void
}) {
    const [tagInput, setTagInput] = useState("")
    const [assignInput, setAssignInput] = useState("")
    const [uploading, setUploading] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);

    const { users, loading: usersLoading, fetchUsers } = useUserStore();

    useEffect(() => {
        if (users.length === 0) {
            fetchUsers();
        }
    }, [users]);


    // Create user options for the dropdown
    const userOptions = users.map((user: any) => ({
        id: user.id,
        value: user.id,
        label: user.name || user.email
    }));

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        const form = new FormData();
        for (let i = 0; i < files.length; i++) form.append("file", files[i]);

        setUploading(true);
        const res = await fetch("/api/uploadFile", { method: "POST", body: form });
        setUploading(false);
        if (res.ok) {
            const json = await res.json();
            setUploadedFiles(prev => [...prev, ...json.files]);
        } else {
            alert("Upload failed");
        }
    };

    return (
        <Formik<CompanyFormValues>
            initialValues={initialValues}
            validationSchema={schema}
            onSubmit={(vals, { setSubmitting, resetForm }) => {
                const cleaned = {
                    ...vals,
                    assing: vals.assing ? vals.assing.map((t) => t.trim()).filter(Boolean) : [],
                    tags: vals.tags ? vals.tags.map((t) => t.trim()).filter(Boolean) : [],
                    files: uploadedFiles
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
                        <FieldBlock name="fullName" label="Full Name">
                            <Field
                                id="fullName"
                                name="fullName"
                                placeholder="Add a name"
                                className="w-full font-medium rounded-md shadow-sm border border-[var(--border-gray)] bg-background px-3 py-2 outline-none focus:ring-1 focus:ring-gray-400 focus:outline-none"
                            />
                        </FieldBlock>

                        <FieldBlock name="industry" label="Industry">
                            <Field
                                as="select"
                                id="industry"
                                name="industry"
                                className="w-full text-sm rounded-md shadow-sm border  border-[var(--border-gray)] bg-background px-3 py-2 outline-none focus:ring-1 focus:ring-gray-400 focus:outline-none"
                            >
                                <option value="" disabled>Select Industry</option>
                                <option value="Technology">Technology</option>
                                <option value="Healthcare">Healthcare</option>
                                <option value="Finance">Finance</option>
                                <option value="Education">Education</option>
                                <option value="Retail">Retail</option>
                                <option value="Manufacturing">Manufacturing</option>
                                <option value="Real Estate">Real Estate</option>
                                <option value="Other">Other</option>
                            </Field>
                        </FieldBlock>

                        <FieldBlock name="website" label="Website">
                            <Field
                                id="website"
                                name="website"
                                placeholder="www.example.com"
                                className="w-full font-medium rounded-md shadow-sm border border-[var(--border-gray)] bg-background px-3 py-2 outline-none focus:ring-1 focus:ring-gray-400 focus:outline-none"
                            />
                        </FieldBlock>


                        <FieldBlock name="email" label="Email">
                            <Field
                                id="email"
                                name="email"
                                placeholder="eg. example@company.com"
                                className="w-full font-medium rounded-md shadow-sm border border-[var(--border-gray)] bg-background px-3 py-2 outline-none focus:ring-1 focus:ring-gray-400 focus:outline-none"
                            />
                        </FieldBlock>



                        <FieldBlock name="phone" label="Phone">
                            <Field
                                id="phone"
                                name="phone"
                                placeholder="+33 45832812"
                                className="w-full font-medium rounded-md shadow-sm border border-[var(--border-gray)] bg-background px-3 py-2 outline-none focus:ring-1 focus:ring-gray-400 focus:outline-none"
                            />
                        </FieldBlock>

                        <TagInput name='Assign People' values={values.assing} setValue={(values: string[]) => setFieldValue('assing', values)} input={assignInput} setInput={(value: string) => setAssignInput(value)} />


                        <FieldBlock name="owner" label="Owner">
                            <SearchableDropdown
                                name="owner"
                                value={values.owner}
                                options={userOptions}
                                onChange={(val) => setFieldValue("owner", val)}
                                placeholder="Select Owner"
                                showIcon={false}
                                maxOptions={20}
                            />
                        </FieldBlock>

                        <FieldBlock name="status" label="Status">
                            <Field
                                as="select"
                                id="status"
                                name="status"
                                className="w-full text-sm rounded-md shadow-sm border  border-[var(--border-gray)] bg-background px-3 py-2 outline-none focus:ring-1 focus:ring-gray-400 focus:outline-none"
                            >
                                  <option value="" disabled>Select Status</option>

                                <option value="Active">Active</option>
                                <option value="FollowUp">Follow Up</option>
                                <option value="inactive">inactive</option>


                            </Field>
                        </FieldBlock>


                        <TagInput name='Tags' values={values.tags} setValue={(values: string[]) => setFieldValue('tags', values)} input={tagInput} setInput={(value: string) => setTagInput(value)} />

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
                        <Button type="submit" className="flex-1 bg-black text-white">
                            Save Company
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
                <p role="alert" className="text-sm text-red-600">
                    {msg}
                </p>
            )}
        />
    )
}

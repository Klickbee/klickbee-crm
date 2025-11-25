"use client"


import type React from "react"

import { useEffect, useState, type KeyboardEvent } from "react"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import { Button } from "@/components/ui/Button"
import { Trash2, UploadCloud } from "lucide-react"
import SearchableDropdown from "@/components/ui/SearchableDropdown"
import TagInput from "@/components/ui/TagInput"
import UploadButton from "@/components/ui/UploadButton"
import InputWithDropDown from "@/components/ui/InputWithDropDown"
import { useCompaniesStore } from "@/feature/companies/stores/useCompaniesStore"
import { getCompanyOptions } from "@/feature/deals/libs/companyData"
import { Customer } from "../types/types"
import CustomDropdown from "@/components/ui/CustomDropdown"

type CustomerFormValues = {
    fullName: string
    company: string
    email: string
    status: string
    phone: string
    owner: string
    tags: string[]
    notes: string
    files: File[]
}

const schema = Yup.object({
    fullName: Yup.string().trim().required("Full name is required"),
    company: Yup.string().trim().required("Company is required"),
    email: Yup.string().trim().email("Please enter a valid email address"),
    phone: Yup.string().trim().matches(/^[\+]?[0-9\-\(\)\s]+$/, "Please enter a valid phone number"),
    status: Yup.string().oneOf(["Active", "FollowUp", "inactive"]).required("Status is required"),
    owner: Yup.string().trim(),
    tags: Yup.array().of(Yup.string().trim().min(1)).max(10, "Up to 10 tags"),
    notes: Yup.string(),
    files: Yup.array().of(Yup.mixed<File>()),

})
export default function CustomerForm({
    onSubmit,
    onCancel,
    mode = 'add',
    initialData,
    usersLoading,
    userOptions
}: {
    onSubmit: (values: CustomerFormValues) => void
    onCancel: () => void
    mode?: 'add' | 'edit'
    initialData?: Customer,
    usersLoading: boolean,
    userOptions: { id: string, value: string, label: string }[]
}) {
    const [tagInput, setTagInput] = useState("")
    const [uploading, setUploading] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);

    // Fetch companies for company dropdown
    useEffect(() => {
        useCompaniesStore.getState().fetchCompanies();
    }, []);

    const getOptionLabel = (options: { id: string, label: string }[], value: string) => {
        // First try to find by ID
        const optionById = options.find(opt => opt.id === value);
        if (optionById) return optionById.label;

        // Then try to find by label (in case value is already a label)
        const optionByLabel = options.find(opt => opt.label === value);
        if (optionByLabel) return optionByLabel.label;

        // If not found in options, return the value as-is (for dynamic values)
        return value;
    };

    const getInitialValues = (): CustomerFormValues => {
        if (mode === 'edit' && initialData) {
            const { companies } = useCompaniesStore.getState();

            // Handle company field - could be ID, name, or object
            let companyValue = '';
            if (initialData.company) {
                if (typeof initialData.company === 'string') {
                    // First check if it's already a company ID
                    const companyById = companies.find(c => c.id === initialData.company);
                    if (companyById) {
                        companyValue = companyById.id;
                    } else {
                        const companyByName = companies.find(c =>
                            c.fullName?.toLowerCase() === (initialData.company as string).toLowerCase()
                        );
                        if (companyByName) {
                            companyValue = companyByName.id;
                        } else {
                            // If no match found, leave empty (user can select again)
                            companyValue = '';
                        }
                    }
                } else if (typeof initialData.company === 'object' && initialData.company && 'id' in initialData.company) {
                    companyValue = (initialData.company as { id: string }).id;
                }
            }

            return {
                fullName: initialData.fullName || '',
                company: companyValue,
                email: initialData.email || '',
                status: initialData.status || '',
                phone: initialData.phone || '',
                owner: (() => {
                    if (typeof initialData.owner === 'object' && initialData.owner) {
                        return initialData.owner.id || '';
                    }
                    if (typeof initialData.owner === 'string') {
                        // Use IIFE to help TypeScript with type narrowing
                        return (() => {
                            const ownerString = initialData.owner as string;
                            const option = userOptions.find(opt => opt.id === ownerString);
                            return option ? option.id : ownerString;
                        })();
                    }
                    return '';
                })(),
                tags: (() => {
                    const tags = initialData.tags;
                    if (!tags) return [];
                    if (Array.isArray(tags)) {
                        return (tags as string[]).filter(Boolean);
                    }
                    if (typeof tags === 'string') {
                        return (tags as string).split(',').map(tag => tag.trim()).filter(Boolean);
                    }
                    return [];
                })(),
                notes: initialData.notes || '',
                files: [],
            };
        }
        return {
            fullName: "",
            company: "",
            email: "",
            status: "",
            phone: "",
            owner: userOptions.length > 0 ? userOptions[0].id : "",
            tags: [],
            notes: "",
            files: [],
        };
    };

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
        <Formik<CustomerFormValues>
            enableReinitialize
            initialValues={getInitialValues()}
            validationSchema={schema}
            onSubmit={async (vals, { setSubmitting, resetForm }) => {
                try {
                    const payload = {
                        ...vals,
                        tags: vals.tags ? vals.tags.map((t) => t.trim()).filter(Boolean) : [],
                        files: uploadedFiles
                    };

                    // Run validation manually in case of async conditions
                    await schema.validate(payload, { abortEarly: false });

                    onSubmit(payload);

                    // Only reset form in add mode, not in edit mode
                    if (mode === 'add') {
                        resetForm();
                    }
                } catch (error: any) {
                    if (error.name === "ValidationError") {
                        // Loop through validation errors
                        error.inner.forEach((err: any) => {
                            console.error(err.message);
                        });
                    } else {
                        console.error("Failed to save customer. Please try again.");
                    }
                } finally {
                    setSubmitting(false);
                }
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

                        <FieldBlock name="company" label="Company Type">
                            <SearchableDropdown
                                name="company"
                                value={values.company}
                                options={getCompanyOptions()}
                                onChange={(val) => setFieldValue("company", val)}
                                placeholder="Search or create a company"
                            />
                        </FieldBlock>




                        <FieldBlock name="email" label="Email">
                            <Field
                                id="email"
                                name="email"
                                placeholder="eg . exapmle.com"
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
                            <CustomDropdown
                                name="status"
                                value={values.status}
                                onChange={(val) => setFieldValue("status", val)}
                                placeholder="Select Status"
                                options={[
                                    { value: "Active", label: "Active" },
                                    { value: "FollowUp", label: "Follow Up" },
                                    { value: "inactive", label: "Inactive" },
                                ]}
                            />
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
                        <Button type="submit" className="flex-1 bg-black text-white" >
                            Save Customer
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

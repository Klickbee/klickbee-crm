"use client"

import type React from "react"
import { useState, useEffect, type KeyboardEvent } from "react"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import { Button } from "@/components/ui/Button"
import { Trash2, UploadCloud } from "lucide-react"
import SearchableDropdown from "@/components/ui/SearchableDropdown"
import { companyOptions, contactOptions } from "../libs/companyData"
import TagInput from "@/components/ui/TagInput"
import UploadButton from "@/components/ui/UploadButton"
import { options } from '../libs/currencyOptions'
import { useUserStore } from '@/feature/user/store/userStore';
import InputWithDropDown from "@/components/ui/InputWithDropDown"
import toast from "react-hot-toast"

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
  files: any[]
}

const schema = Yup.object({
    dealName: Yup.string().trim().required("Deal Name is required"),
    company: Yup.string().trim().required("Company is required"),
    contact: Yup.string().trim(),
    stage: Yup.string().oneOf(["New", "Contacted", "Proposal", "negotiation", "Won", "Lost"]).required("Stage is required"),
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
    owner:"",
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
    const [uploading, setUploading] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);

    // Fetch users for owner dropdown
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
        const res = await fetch("/api/uploads", { method: "POST", body: form });
        setUploading(false);
        if (res.ok) {
            const json = await res.json();
            setUploadedFiles(prev => [...prev, ...json.files]);
        } else {
            alert("Upload failed");
        }
    };

    return (
        <Formik<DealFormValues>
            initialValues={initialValues}
            validationSchema={schema}
            onSubmit={async (vals, { setSubmitting, resetForm }) => {
                try {
                    const payload = {
                        ...vals,
                        tags: vals.tags ? vals.tags.map((t) => t.trim()).filter(Boolean) : [],
                        files: uploadedFiles,
                    };

                    // Run validation manually in case of async conditions
                    await schema.validate(payload, { abortEarly: false });

                    onSubmit(payload);


                    resetForm();
                } catch (error: any) {
                    if (error.name === "ValidationError") {
                        // Loop through validation errors
                        error.inner.forEach((err: any) => {
                            toast.error(err.message);
                        });
                    } else {
                        toast.error("Failed to save deal. Please try again.");
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
                        <FieldBlock name="dealName" label="Deal Name">
                            <Field
                                id="dealName"
                                name="dealName"
                                placeholder="Add a name"
                                className="w-full font-medium rounded-md shadow-sm border border-[var(--border-gray)] bg-background px-3 py-2 outline-none focus:ring-1 focus:ring-gray-400 focus:outline-none"
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
                                    placeholder='stage'
                                    className="w-full text-sm rounded-md shadow-sm border  border-[var(--border-gray)] bg-background px-3 py-2 outline-none focus:ring-1 focus:ring-gray-400 focus:outline-none"
                                >
                                    <option value="New">New</option>
                                    <option value="contacted">Contacted</option>
                                    <option value="Proposal">Proposal Sent</option>
                                    <option value="negotiation">Negotiation</option>
                                    <option value="Won">Won</option>
                                    <option value="Lost">Lost</option>
                                </Field>
                            </FieldBlock>

                            <FieldBlock name="amount" label="Amount">
                                <InputWithDropDown inputName='amount' optionName="currency" options={options} />
                            </FieldBlock>
                        </div>

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

                        <FieldBlock name="closeDate" label="Close Date">
                            <Field
                                id="closeDate"
                                name="closeDate"
                                type="date"
                                className="w-full rounded-md text-sm shadow-sm border  border-[var(--border-gray)] bg-background px-3 py-2 outline-none focus:ring-1 focus:ring-gray-400 focus:outline-none"
                            />
                        </FieldBlock>

                        <TagInput name='Tags' values={values.tags} setValue={(values: string[]) => setFieldValue('tags', values)} input={tagInput} setInput={(value: string) => setTagInput(value)} />
                        <ErrorMessage name="tags" component="div" className="text-sm text-red-600" />

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
                        <ErrorMessage name="files" component="div" className="text-sm text-red-600" />
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
        <div className="flex flex-col gap-2">
            <label htmlFor={name} className="text-sm font-medium">
                {label}
            </label>
            {children}
            <ErrorMessage name={name} component="div" className="text-sm text-red-600" />
        </div>
    )
}


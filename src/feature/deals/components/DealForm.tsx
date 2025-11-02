"use client"

import type React from "react"
import { useState, useEffect, type KeyboardEvent } from "react"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import { Button } from "@/components/ui/Button"
import { Trash2, UploadCloud } from "lucide-react"
import SearchableDropdown from "@/components/ui/SearchableDropdown"
import TagInput from "@/components/ui/TagInput"
import UploadButton from "@/components/ui/UploadButton"
import { getCompanyOptions, getContactOptions } from "../libs/companyData";
import { useCompaniesStore } from '@/feature/companies/stores/useCompaniesStore';
import { useCustomersStore } from '@/feature/customers/stores/useCustomersStore';
import InputWithDropDown from "@/components/ui/InputWithDropDown"
import toast from "react-hot-toast"
import { Deal } from '../types'
import CalendarDropDown from "@/components/ui/CalendarDropDown"
import { options } from "../libs/currencyOptions"
import CustomDropdown from "@/components/ui/CustomDropdown"

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
    mode = 'add',
    initialData,
    usersLoading,
    userOptions,
}: {
    onSubmit: (values: DealFormValues) => void
    onCancel: () => void
    mode?: 'add' | 'edit'
    initialData?: Deal
    usersLoading: boolean
    userOptions: { id: string; value: string; label: string }[]
}) {
    const [tagInput, setTagInput] = useState("")
    const [uploading, setUploading] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);

    // Fetch companies and customers data
    useEffect(() => {
        useCompaniesStore.getState().fetchCompanies();
        useCustomersStore.getState().fetchCustomers();
    }, []);

    // Fetch users for owner dropdown
  

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


    // Helper function to convert option IDs to labels
         const getOptionLabel = (options: {id: string, label: string}[], value: string) => {
        // First try to find by ID
        const optionById = options.find(opt => opt.id === value);
        if (optionById) return optionById.label;

        // Then try to find by label (in case value is already a label)
        const optionByLabel = options.find(opt => opt.label === value);
        if (optionByLabel) return optionByLabel.label;

        // If not found in options, return the value as-is (for dynamic values)
        return value;
    };
    // Get initial values based on mode and initial data
    const getInitialValues = (): DealFormValues => {
        if (mode === 'edit' && initialData) {
            // Normalize owner which can be object|string|undefined in initialData
            const ownerValue = (() => {
                const o = (initialData as any).owner;
                if (typeof o === 'object' && o) {
                    return o.id ?? '';
                }
                if (typeof o === 'string') {
                    return o;
                }
                return '';
            })();

            // Normalize company - extract ID if it's an object
            const companyValue = (() => {
                const c = (initialData as any).company;
                if (typeof c === 'object' && c) {
                    return c.id ?? '';
                }
                if (typeof c === 'string') {
                    return c;
                }
                return '';
            })();

            // Normalize contact - extract ID if it's an object
            const contactValue = (() => {
                const c = (initialData as any).contact;
                if (typeof c === 'object' && c) {
                    return c.id ?? '';
                }
                if (typeof c === 'string') {
                    return c;
                }
                return '';
            })();
            const initialVals = {
                dealName: initialData.dealName || '',
                company: companyValue, // Keep as ID for SearchableDropdown
                contact: contactValue, // Keep as ID for SearchableDropdown
                stage: initialData.stage || 'New',
                amount: initialData.amount || 0,
                currency: 'EUR', // Default currency, you might want to store this in the deal data
                owner: (() => {
                    if (typeof initialData.owner === 'object' && initialData.owner) {
                        return initialData.owner.id || '';
                    }
                    if (typeof initialData.owner === 'string') {
                        // If it's already a string, check if it's an ID or a name
                        // For now, assume it's an ID if it's in userOptions, otherwise return as-is
                        const option = userOptions.find(opt => opt.id === initialData.owner || opt.label === initialData.owner);
                        return option ? option.id : initialData.owner;
                    }
                    return '';
                })(),
                closeDate: initialData.closeDate
                    ? new Date(initialData.closeDate).toISOString().split('T')[0]
                    : '',
                tags: initialData.tags 
                    ? (typeof initialData.tags === 'string' 
                        ? initialData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
                        : Array.isArray(initialData.tags) 
                            ? (initialData.tags as string[]).filter(Boolean)
                            : [])
                    : [],
                notes: initialData.notes || '',
                files: [], // Files are not pre-populated in edit mode for now
            };
            return initialVals;
        }
        return initialValues;
    };

    // Dynamic schema with validation for select fields
    const schema = Yup.object({
        dealName: Yup.string().trim().required("Deal Name is required"),
        company: Yup.string().trim().optional(),
        contact: Yup.string().trim().optional(),
        stage: Yup.string().oneOf(["New", "Contacted", "Proposal", "Negotiation", "Won", "Lost"]).required("Stage is required"),
        amount: Yup.number()
            .typeError("Enter a valid number")
            .min(0, "Amount cannot be negative")
            .required("Amount is required"),
        currency: Yup.string().oneOf(["USD", "EUR", "GBP"]).required("Currency is required"),
        owner: Yup.string().trim(),
        closeDate: Yup.string().nullable(),
        tags: Yup.array().of(Yup.string().trim().min(1)).max(10, "Up to 10 tags"),
        notes: Yup.string(),
        files: Yup.array().of(Yup.mixed<File>()),
    });

    return (
        <Formik<DealFormValues>
            enableReinitialize
            initialValues={getInitialValues()}
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

                    // Only reset form in add mode, not in edit mode
                    if (mode === 'add') {
                        resetForm();
                    }
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
            {({ values, setFieldValue, resetForm }) => (
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
                                options={getCompanyOptions()}
                                onChange={(val) => setFieldValue("company", val)}
                                placeholder="Search or create a company"
                            />
                        </FieldBlock>

                        <FieldBlock name="contact" label="Contact">
                            <SearchableDropdown
                                name="contact"
                                value={values.contact}
                                options={getContactOptions()}
                                onChange={(val) => setFieldValue("contact", val)}
                                placeholder="Add Contact"
                                showIcon={false}
                            />
                        </FieldBlock>

                        <div className="grid grid-cols-2 gap-3">
                            <FieldBlock name="stage" label="Stage">
                            <CustomDropdown
                                name="stage"
                                value={values.stage}
                                onChange={(val) => setFieldValue("stage", val)}
                                openByDefault={true} // 👈 opens automatically when form loads
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

  <FieldBlock name="amount" label="Amount">
                        <div className="flex items-center">
                            <Field
                            id="amount"
                            name="amount"
                            type="number"
                            placeholder="Enter amount"
                            className="flex-1 text-sm w-25 rounded-md shadow-sm border border-[var(--border-gray)] bg-background   px-2 py-2 outline-none focus:ring-1 focus:ring-gray-400 focus:outline-none"
                            />

                            <CustomDropdown
                        
                            name="currency"
                            value={values.currency}
                            onChange={(val) => setFieldValue("currency", val)}
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
                                <CalendarDropDown
                                    label={values.closeDate ? new Date(values.closeDate).toLocaleDateString('en-US', {
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric'
                                    }) : "Select closed Date"}
                                    value={values.closeDate ? new Date(values.closeDate) : null}
                                      buttonClassName="min-w-[360px] bg-blue-50 hover:bg-blue-100"
                                       triggerIcon="calendar"

                                    onChange={(date) => setFieldValue("closeDate", date.toISOString().split('T')[0])}
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
                            {mode === 'edit' ? 'Update Deal' : 'Save Deal'}
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

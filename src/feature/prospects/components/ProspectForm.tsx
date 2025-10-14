"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import { Button } from "@/components/ui/Button"
import SearchableDropdown from "@/components/ui/SearchableDropdown"
import TagInput from "@/components/ui/TagInput"
import { companyOptions } from "@/feature/deals/libs/companyData"
import { useUserStore } from "@/feature/user/store/userStore"
import { Prospect } from "../types/types"

type ProspectFormValues = {
    fullName: string
    company: string
    email: string
    status: string
    phone: string
    owner: string
    tags: string[]
    notes: string
}

const schema = Yup.object({
    fullName: Yup.string().trim().required("Full name is required"),
    company: Yup.string().trim().required("Company is required"),
    email: Yup.string().trim().email("Please enter a valid email address").required("Email is required"),
    phone: Yup.string().trim().matches(/^[+]?[0-9\s\-()]{10,}$/, "Please enter a valid phone number"),
    status: Yup.string().oneOf(["New", "Qualified", "Converted", "Cold", "Warmlead", "Notintrested"]).required("Status is required"),
    owner: Yup.string().trim().required("Owner is required"),
    tags: Yup.array().of(Yup.string().trim().min(1)).max(10, "Up to 10 tags allowed"),
    notes: Yup.string(),
})

const initialValues: ProspectFormValues = {
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
     mode = 'add',
    initialData,
    usersLoading,
    userOptions,
}: {
    onSubmit: (values: ProspectFormValues) => void
    onCancel: () => void
    mode?: 'add' | 'edit'
  initialData?: Prospect
  usersLoading: boolean
  userOptions: { id: string; value: string; label: string }[]
}) {
    const [tagInput, setTagInput] = useState("")
    // Fetch users for owner dropdow
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
    const getInitialValues = (): ProspectFormValues => {
        if (mode === 'edit' && initialData) {
            const initialVals = {
                fullName: initialData.fullName || '',
                company: getOptionLabel(companyOptions, initialData.company),
                email: initialData.email || '',
                status: initialData.status || '',
                phone: initialData.phone || '',
                owner: getOptionLabel(userOptions, 
                    typeof initialData.owner === 'object' && initialData.owner 
                        ? initialData.owner.id 
                        : initialData.owner || ''
                ),
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
            };
            return initialVals;
        }
        return initialValues;
    };

    


    return (
        <Formik<ProspectFormValues>
            enableReinitialize
            initialValues={getInitialValues()}
            validationSchema={schema}
            onSubmit={async (vals, { setSubmitting, resetForm }) => {
                try {
                    const payload = {
                        ...vals,
                        tags: vals.tags ? vals.tags.map((t) => t.trim()).filter(Boolean) : [],
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
                        console.error("Failed to save prospect. Please try again.");
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
                        <FieldBlock name="fullName" label="Full Name">
                            <Field
                                id="fullName"
                                name="fullName"
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




                        <FieldBlock name="email" label="Email">
                            <Field
                                id="email"
                                name="email"
                                placeholder="e.g. example@company.com"
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
                            <Field
                                as="select"
                                id="status"
                                name="status"
                                className="w-full text-sm rounded-md shadow-sm border  border-[var(--border-gray)] bg-background px-3 py-2 outline-none focus:ring-1 focus:ring-gray-400 focus:outline-none"
                            >
                                <option value="" disabled>Select Status</option>

                                <option value="New">New</option>
                                <option value="Cold">Cold</option>
                                <option value="Qualified">Qualified</option>
                                <option value="Warmlead">Warm Lead</option>
                                <option value="Converted">Converted</option>
                                <option value="Notintrested">Not Intrested</option>

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
                            Save Prospect
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

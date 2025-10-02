"use client"

import type React from "react"

import { useState, type KeyboardEvent } from "react"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import { Button } from "@/components/ui/Button"
import { Trash2, UploadCloud } from "lucide-react"
import SearchableDropdown from "@/components/ui/SearchableDropdown"
import TagInput from "@/components/ui/TagInput"
import UploadButton from "@/components/ui/UploadButton"
import InputWithDropDown from "@/components/ui/InputWithDropDown"
import { companyOptions } from "@/feature/deals/libs/companyData"

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
    fullName: Yup.string().trim().required(""),
    company: Yup.string().trim().required("Company is required"),
    email: Yup.string().trim(),
    status: Yup.string().oneOf(["New", "Qualified", "Converted", "Cold", "Warmlead","Notintrested"]).required("Stage is required"),
    owner: Yup.string().trim().required("Owner is required"),
    tags: Yup.array().of(Yup.string().trim().min(1)).max(10, "Up to 10 tags"),
    notes: Yup.string(),
})

const initialValues: ProspectFormValues = {
    fullName: "",
    company: "",
    email: "",
    status: "New",
    phone : "",
    owner: "Claire Brunet",
    tags: [],
    notes: "",
}

export default function ProspectForm({
    onSubmit,
    onCancel,
}: {
    onSubmit: (values: ProspectFormValues) => void
    onCancel: () => void
}) {
    const [tagInput, setTagInput] = useState("")

    return (
        <Formik<ProspectFormValues>
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
                            <Field
                                as="select"
                                id="owner"
                                name="owner"
                                className="w-full text-sm rounded-md shadow-sm border  border-[var(--border-gray)] bg-background px-3 py-2 outline-none focus:ring-1 focus:ring-gray-400 focus:outline-none"
                            >
                                <option>Claire Brunet</option>
                                <option>Alex Kim</option>
                                <option>Jordan Lee</option>
                            </Field>
                        </FieldBlock>

                         <FieldBlock name="status" label="Status">
                            <Field
                                as="select"
                                id="status"
                                name="status"
                                className="w-full text-sm rounded-md shadow-sm border  border-[var(--border-gray)] bg-background px-3 py-2 outline-none focus:ring-1 focus:ring-gray-400 focus:outline-none"
                            >
                                <option value="New">New</option>
                                <option value="Cold">Cold</option>
                                <option value="Qualified">Qualified</option>
                                <option value="Warmlead">Warm Lead</option>
                                <option value="Converted">Converted</option>
                                <option value="Notintrested">Not Intrested</option>
                              
                            </Field>
                        </FieldBlock>
                        

                        <TagInput name='Tags' values={values.tags} setValue={(values: string[]) => setFieldValue('tags', values)} input={tagInput}  setInput={(value: string) => setTagInput(value)} />

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
                        <Button type="submit" className="flex-1 bg-black text-white" disabled={isSubmitting || !isValid || !dirty}>
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
                <p role="alert" className="text-sm text-destructive">
                    {msg}
                </p>
            )}
        />
    )
}

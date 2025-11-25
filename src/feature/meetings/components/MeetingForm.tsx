"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import TagInput from "@/components/ui/TagInput"
import UploadButton from "@/components/ui/UploadButton"
import { Button } from "@/components/ui/Button"
import { Meeting } from "../types/meeting"
import SearchableDropdown from "@/components/ui/SearchableDropdown"
import CalendarDropDown from "@/components/ui/CalendarDropDown"
import CustomDropdown from "@/components/ui/CustomDropdown"

const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/

const meetingSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(2, "Meeting title must be at least 2 characters")
      .max(100, "Meeting title must not exceed 100 characters"),
    startDate: z.string().min(1, "Date is required"),
    startTime: z.string().regex(timeRegex, "Start time must be a valid time"),
    endTime: z.string().regex(timeRegex, "End time must be a valid time"),
    location: z.string().max(200, "Location must not exceed 200 characters").optional().or(z.literal("")),
    link: z
      .string()
      .optional()
      .or(z.literal(""))
      .refine((val) => !val || (() => { try { new URL(val); return true } catch { return false } })(), {
        message: "Meeting link must be a valid URL if provided",
      }),
    assignedTo: z.string().optional().or(z.literal("")),
    linkedTo: z.string().optional().or(z.literal("")),
    participants: z.array(z.string().trim().min(1, "Participant name cannot be empty").max(100)).default([]),
    status: z.enum(["scheduled", "confirmed", "cancelled"], { required_error: "Status is required" }),
    tags: z.array(z.string().trim().min(1, "Tag cannot be empty").max(30)).default([]),
    notes: z.string().max(1000, "Notes must not exceed 1000 characters").optional().or(z.literal("")),
    repeatMeeting: z.boolean(),
    frequency: z.string().optional().or(z.literal("")),
    repeatEvery: z.number().optional(),
    repeatOn: z.string().optional().or(z.literal("")),
    ends: z.string().optional().or(z.literal("")),
    files: z.array(z.instanceof(File)).optional().or(z.literal(undefined)).transform((val) => val ?? []),
  })
  .superRefine((val, ctx) => {
    if (val.endTime && val.startTime && val.endTime <= val.startTime) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "End time must be after start time", path: ["endTime"] })
    }

    if (val.repeatMeeting) {
      if (!val.frequency) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Frequency is required for repeating meetings", path: ["frequency"] })
      }
      if (!val.repeatEvery || val.repeatEvery < 1 || val.repeatEvery > 365) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Repeat every must be between 1 and 365", path: ["repeatEvery"] })
      }
      if (val.frequency === "Weekly" && !val.repeatOn) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Repeat on day is required for weekly meetings", path: ["repeatOn"] })
      }
      if (!val.ends) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "End condition is required for repeating meetings", path: ["ends"] })
      }
    }
  })

type MeetingFormValues = z.infer<typeof meetingSchema>

type formProps = {
  onSubmit: (values: any) => void
  onClose: () => void
  mode?: "add" | "edit"
  initialData?: Meeting
  usersLoading: boolean
  userOptions: { id: string; value: string; label: string }[]
}

const initialValues: MeetingFormValues = {
  title: "",
  startDate: new Date().toISOString().split("T")[0],
  startTime: "09:00",
  endTime: "10:00",
  repeatMeeting: false,
  frequency: "Daily",
  repeatOn: "",
  repeatEvery: 1,
  ends: "Never",
  linkedTo: "",
  location: "",
  link: "",
  assignedTo: "",
  participants: [],
  status: "scheduled",
  tags: [],
  notes: "",
  files: [],
}

export default function MeetingForm({ onSubmit, onClose, mode = "add", initialData, usersLoading: _usersLoading, userOptions }: formProps) {
  const [tagInput, setTagInput] = useState("")
  const [participantsInput, setParticipantsInput] = useState("")
  const [uploading, setUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([])

  const getInitialValues = (): MeetingFormValues => {
    if (mode === "edit" && initialData) {
      return {
        title: initialData.title || "",
        startDate: initialData.startDate
          ? new Date(initialData.startDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        startTime: initialData.startTime
          ? (() => {
              const date = new Date(initialData.startTime)
              const hours = date.getHours().toString().padStart(2, "0")
              const minutes = date.getMinutes().toString().padStart(2, "0")
              return `${hours}:${minutes}`
            })()
          : "09:00",
        endTime: initialData.endTime
          ? (() => {
              const date = new Date(initialData.endTime)
              const hours = date.getHours().toString().padStart(2, "0")
              const minutes = date.getMinutes().toString().padStart(2, "0")
              return `${hours}:${minutes}`
            })()
          : "10:00",
        repeatMeeting: initialData.repeatMeeting || false,
        frequency: initialData.frequency || "Daily",
        repeatOn: initialData.repeatOn || "",
        repeatEvery: initialData.repeatEvery || 1,
        ends: initialData.ends || "Never",
        linkedTo:
          typeof initialData.linkedTo === "string"
            ? initialData.linkedTo
            : (initialData.linkedTo as { id: string })?.id || "",
        location: initialData.location || "",
        link: initialData.link || "",
        assignedTo:
          typeof initialData.assignedTo === "string"
            ? initialData.assignedTo
            : (initialData.assignedTo as { id: string })?.id || "",
        participants: initialData.participants || [],
        status:
          initialData.status && typeof initialData.status === "string"
            ? (initialData.status === "Confirmed"
                ? "confirmed"
                : initialData.status === "Cancelled"
                  ? "cancelled"
                  : initialData.status === "Scheduled"
                    ? "scheduled"
                    : (initialData.status as string).toLowerCase())
            : "scheduled",
        tags: initialData.tags || [],
        notes: initialData.notes || "",
        files: [],
      }
    }
    return initialValues
  }

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MeetingFormValues>({ resolver: zodResolver(meetingSchema), defaultValues: getInitialValues() })

  useEffect(() => {
    reset(getInitialValues())
  }, [initialData, mode, reset])

  const values = watch()

  const renderDuration = (frequency: string | undefined) => {
    if (!frequency) return
    switch (frequency) {
      case "Daily":
        return "Day (s)"
      case "Weekly":
        return "Weeks (s)"
      case "Monthly":
        return "Month (s)"
      case "Yearly":
        return "Year (s)"
      default:
        return "Day (s)"
    }
  }

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
      alert("Upload failed")
    }
  }

  const onSubmitHandler = handleSubmit((vals) => {
    const payload = {
      ...vals,
      startDate: vals.startTime
        ? (() => {
            const [hours, minutes] = vals.startTime.split(":").map(Number)
            const dateWithTime = new Date(
              `${vals.startDate}T${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:00.000`
            )
            return dateWithTime.toISOString()
          })()
        : null,
      startTime: vals.startTime
        ? (() => {
            const [hours, minutes] = vals.startTime.split(":").map(Number)
            const dateWithTime = new Date(
              `${vals.startDate}T${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:00.000`
            )
            return dateWithTime.toISOString()
          })()
        : null,
      endTime: vals.endTime
        ? (() => {
            const [hours, minutes] = vals.endTime.split(":").map(Number)
            const dateWithTime = new Date(
              `${vals.startDate}T${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:00.000`
            )
            return dateWithTime.toISOString()
          })()
        : null,
      tags: vals.tags ? vals.tags.map((t) => t.trim()).filter(Boolean) : [],
      participants: vals.participants ? vals.participants.map((p) => p.trim()).filter(Boolean) : [],
      linkedId: vals.linkedTo && vals.linkedTo.trim() !== "" ? vals.linkedTo : null,
      assignedId: vals.assignedTo && vals.assignedTo.trim() !== "" ? vals.assignedTo : null,
      files: uploadedFiles,
    }

    onSubmit(payload)

    if (mode === "add") {
      reset(initialValues)
      setTagInput("")
      setParticipantsInput("")
      setUploadedFiles([])
    }
  })

  return (
    <form onSubmit={onSubmitHandler} className="flex flex-col h-full">
      <div className="border-b border-[var(--border-gray)] flex items-center justify-between p-4">
        <h2 className="text-xl font-semibold">{mode === "edit" ? "Edit Meeting" : "Create Meeting"}</h2>
      </div>

      <div className="overflow-y-auto flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 border-b border-[var(--border-gray)]">
          <div className="p-4 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Title</label>
              <input
                {...register("title")}
                placeholder="Enter meeting title"
                className="w-full px-3 py-2 shadow-sm border border-[var(--border-gray)] rounded-lg focus:ring-1 focus:ring-gray-400 focus:outline-none"
              />
              {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Date</label>
              <CalendarDropDown
                label={values.startDate ? new Date(values.startDate).toDateString() : "Select date"}
                value={values.startDate ? new Date(values.startDate) : null}
                onChange={(date) => setValue("startDate", date.toISOString().split("T")[0], { shouldValidate: true })}
              />
              {errors.startDate && <p className="text-sm text-red-600">{errors.startDate.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Start Time</label>
                <input
                  type="time"
                  {...register("startTime")}
                  className="w-full px-3 py-2 shadow-sm border border-[var(--border-gray)] rounded-lg focus:ring-1 focus:ring-gray-400 focus:outline-none"
                />
                {errors.startTime && <p className="text-sm text-red-600">{errors.startTime.message}</p>}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">End Time</label>
                <input
                  type="time"
                  {...register("endTime")}
                  className="w-full px-3 py-2 shadow-sm border border-[var(--border-gray)] rounded-lg focus:ring-1 focus:ring-gray-400 focus:outline-none"
                />
                {errors.endTime && <p className="text-sm text-red-600">{errors.endTime.message}</p>}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input type="checkbox" {...register("repeatMeeting")}/>
                Repeat meeting
              </label>
            </div>

            {values.repeatMeeting && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Frequency</label>
                    <CustomDropdown
                      name="frequency"
                      value={values.frequency ?? ""}
                      onChange={(val) => setValue("frequency", val, { shouldValidate: true })}
                      placeholder="Select Frequency"
                      options={[
                        { value: "Daily", label: "Daily" },
                        { value: "Weekly", label: "Weekly" },
                        { value: "Monthly", label: "Monthly" },
                        { value: "Yearly", label: "Yearly" },
                      ]}
                    />
                    {errors.frequency && <p className="text-sm text-red-600">{errors.frequency.message}</p>}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium" htmlFor="repeatEvery">Repeat Every</label>
                    <div className="flex rounded-md shadow-sm border border-[var(--border-gray)] focus-within:ring-1">
                      <input
                        type="number"
                        id="repeatEvery"
                        min={0}
                        value={values.repeatEvery ?? ""}
                        onChange={(e) => setValue("repeatEvery", Number(e.target.value), { shouldValidate: true })}
                        className="flex-1 rounded-l-md px-3 py-2 outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [appearance:textfield] w-1/4"
                      />
                      <div className="flex items-center gap-1 border-l px-1 text-gray-400 font-light text-sm">
                        {renderDuration(values?.frequency)}
                      </div>
                    </div>
                    {errors.repeatEvery && <p className="text-sm text-red-600">{errors.repeatEvery.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Repeat On</label>
                    <input
                      {...register("repeatOn")}
                      placeholder="e.g. Monday"
                      className="w-full px-3 py-2 shadow-sm border border-[var(--border-gray)] rounded-lg focus:ring-1 focus:ring-gray-400 focus:outline-none"
                    />
                    {errors.repeatOn && <p className="text-sm text-red-600">{errors.repeatOn.message}</p>}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Ends</label>

                    <CustomDropdown
                      name="ends"
                      value={values.ends ?? ""}
                      onChange={(val) => setValue("ends", val, { shouldValidate: true })}
                      placeholder="Select Option"
                      options={[
                        { value: "Never", label: "Never" },
                        { value: "After", label: "After" },
                        { value: "OnDate", label: "On Date" },
                      ]}
                    />

                    {errors.ends && <p className="text-sm text-red-600">{errors.ends.message}</p>}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 flex flex-col gap-4">
            <div>
              <label htmlFor="linkedTo" className="block text-sm font-medium text-gray-700 mb-1">
                Linked To
              </label>
              <SearchableDropdown
                name="linkedTo"
                value={values.linkedTo ?? ""}
                options={userOptions}
                placeholder="Select linkedTo"
                showIcon={false}
                maxOptions={20}
                onChange={(value) => setValue("linkedTo", value, { shouldValidate: true })}
              />
              {errors.linkedTo && <p className="text-sm text-red-600">{errors.linkedTo.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Location</label>
              <input
                {...register("location")}
                placeholder="Conference Room A, Office, etc."
                className="w-full px-3 py-2 shadow-sm border border-[var(--border-gray)] rounded-lg focus:ring-1 focus:ring-gray-400 focus:outline-none"
              />
              {errors.location && <p className="text-sm text-red-600">{errors.location.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Link</label>
              <input
                {...register("link")}
                placeholder="Zoom / Meet link"
                className="w-full px-3 py-2 shadow-sm border border-[var(--border-gray)] rounded-lg focus:ring-1 focus:ring-gray-400 focus:outline-none"
              />
              {errors.link && <p className="text-sm text-red-600">{errors.link.message}</p>}
            </div>

            <div>
              <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 mb-1">
                Assigned To
              </label>
              <SearchableDropdown
                name="assignedTo"
                value={values.assignedTo ?? ""}
                options={userOptions}
                placeholder="Select assignedTo"
                showIcon={false}
                maxOptions={20}
                onChange={(value) => setValue("assignedTo", value, { shouldValidate: true })}
              />
              {errors.assignedTo && <p className="text-sm text-red-600">{errors.assignedTo.message}</p>}
            </div>

            <TagInput
              name="Participants"
              values={values.participants}
              setValue={(vals: string[]) => setValue("participants", vals, { shouldValidate: true })}
              input={participantsInput}
              setInput={(value: string) => setParticipantsInput(value)}
            />
            {errors.participants && <p className="text-sm text-red-600">{errors.participants.message as string}</p>}

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Status</label>
              <select
                {...register("status")}
                className="w-full px-3 py-2 shadow-sm border border-[var(--border-gray)] rounded-lg focus:ring-1 focus:ring-gray-400 focus:outline-none"
              >
                <option value="" disabled>
                  Select Status
                </option>
                <option value="scheduled">Scheduled</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              {errors.status && <p className="text-sm text-red-600">{errors.status.message}</p>}
            </div>

            <TagInput
              name="Tags"
              values={values.tags}
              setValue={(vals: string[]) => setValue("tags", vals, { shouldValidate: true })}
              input={tagInput}
              setInput={(value: string) => setTagInput(value)}
            />
            {errors.tags && <p className="text-sm text-red-600">{errors.tags.message as string}</p>}

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Notes</label>
              <textarea
                rows={4}
                {...register("notes")}
                placeholder="Additional notes..."
                className="w-full px-3 py-2 shadow-sm border border-[var(--border-gray)] rounded-lg focus:ring-1 focus:ring-gray-400 focus:outline-none"
              />
              {errors.notes && <p className="text-sm text-red-600">{errors.notes.message}</p>}
            </div>

            <UploadButton
              values={values.files ?? []}
              setValue={(vals) => setValue("files", vals, { shouldValidate: true })}
              uploading={uploading}
              uploadFile={(e) => handleFileChange(e)}
            />
            {errors.files && <p className="text-sm text-red-600">{errors.files.message as string}</p>}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 p-4 border-t border-[var(--border-gray)]">
        <Button type="button" className=" w-full" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" className=" w-full bg-black text-white " disabled={isSubmitting}>
          Save Meeting
        </Button>
      </div>
    </form>
  )
}

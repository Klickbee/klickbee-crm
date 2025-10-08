import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";
import * as Yup from "yup";
import TextInput from "@/components/ui/TextInput";
import SelectInput from "@/components/ui/SelectInput";
import TextareaInput from "@/components/ui/TextareaInput";
import CheckboxInput from "@/components/ui/CheckboxInput";
import TagInput from "@/components/ui/TagInput";
import { useState } from "react";
import UploadButton from "@/components/ui/UploadButton";
import { Button } from "@/components/ui/Button";

// ✅ Enhanced Yup validation with comprehensive rules
const MeetingSchema = Yup.object().shape({
  title: Yup.string()
    .trim()
    .min(2, "Meeting title must be at least 2 characters")
    .max(100, "Meeting title must not exceed 100 characters")
    .required("Meeting title is required"),

  startDate: Yup.date()
    .required("Date is required")
    .min(new Date(), "Meeting date cannot be in the past"),

  startTime: Yup.string()
    .required("Start time is required")
    .test("is-valid-time", "Start time must be a valid time", (value) => {
      if (!value) return false;
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      return timeRegex.test(value);
    }),

  endTime: Yup.string()
    .required("End time is required")
    .test("is-valid-time", "End time must be a valid time", (value) => {
      if (!value) return false;
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      return timeRegex.test(value);
    })
    .test("is-after-start", "End time must be after start time", function(value) {
      const { startTime } = this.parent;
      if (!startTime || !value) return true;
      return value > startTime;
    }),

  location: Yup.string()
    .max(200, "Location must not exceed 200 characters")
    .test("is-valid-url", "Location must be a valid URL if provided", (value) => {
      if (!value) return true;
      try {
        new URL(value);
        return true;
      } catch {
        // Allow non-URL formats like "Conference Room A"
        return value.length >= 2;
      }
    }),

  assignedTo: Yup.string()
    .max(100, "Assigned to must not exceed 100 characters"),

  linkedTo: Yup.string()
    .max(100, "Linked to must not exceed 100 characters"),

  participants: Yup.array()
    .of(
      Yup.string()
        .trim()
        .min(1, "Participant name cannot be empty")
        .max(100, "Participant name must not exceed 100 characters")
        .test("is-valid-email-or-name", "Must be a valid email or name", (value) => {
          if (!value) return false;
          // Allow email format or simple names
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          const nameRegex = /^[a-zA-Z\s]+$/;
          return emailRegex.test(value) || (nameRegex.test(value) && value.length >= 2);
        })
    ),

  status: Yup.string()
    .oneOf(["scheduled", "confirmed", "cancelled"], "Invalid status")
    .required("Status is required"),

  tags: Yup.array()
    .of(
      Yup.string()
        .trim()
        .min(1, "Tag cannot be empty")
        .max(30, "Tag must not exceed 30 characters")
    ),

  notes: Yup.string()
    .max(1000, "Notes must not exceed 1000 characters"),

  repeatMeeting: Yup.boolean(),

  frequency: Yup.string()
    .when("repeatMeeting", {
      is: true,
      then: (schema) => schema
        .oneOf(["Daily", "Weekly", "Monthly", "Yearly"], "Invalid frequency")
        .required("Frequency is required for repeating meetings"),
      otherwise: (schema) => schema.optional(),
    }),

  repeatEvery: Yup.number()
    .when("repeatMeeting", {
      is: true,
      then: (schema) => schema
        .min(1, "Repeat every must be at least 1")
        .max(365, "Repeat every cannot exceed 365")
        .required("Repeat interval is required for repeating meetings"),
      otherwise: (schema) => schema.optional(),
    }),

  repeatOn: Yup.string()
    .when(["repeatMeeting", "frequency"], {
      is: (repeatMeeting: boolean, frequency: string) =>
        repeatMeeting && frequency === "Weekly",
      then: (schema) => schema
        .required("Repeat on day is required for weekly meetings")
        .oneOf(
          ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          "Please select a valid day of the week"
        ),
      otherwise: (schema) => schema.optional(),
    }),

  ends: Yup.string()
    .when("repeatMeeting", {
      is: true,
      then: (schema) => schema
        .oneOf(["Never", "After", "OnDate"], "Invalid end condition")
        .required("End condition is required for repeating meetings"),
      otherwise: (schema) => schema.optional(),
    }),

  files: Yup.array().of(Yup.mixed<File>()),
});

const initialValues = {
  title: "",
  startDate: new Date(),
  startTime: "09:00", // Default start time
  endTime: "10:00",   // Default end time
  repeatMeeting: false,
  frequency: "Daily",
  repeatOn: "",
  repeatEvery: 1,
  ends: "Never",
  linkedTo: "",
  location: "",
  assignedTo: "",
  participants: [],
  status: "scheduled",
  tags: [],
  notes: "",
  files: [],
}

type formProps = {
  onSubmit: (values: any) => void;
  onClose: () => void
}
export default function MeetingForm({ onSubmit, onClose }: formProps) {
  const [tagInput, setTagInput] = useState("")
  const [participantsInput, setParticipantsInput] = useState("")
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);

  const renderDuration = (frequency: string | undefined) => {
    if (!frequency) return;
    switch (frequency) {
      case 'Daily': return 'Day (s)';
      case 'Weekly': return 'Weeks (s)';
      case 'Monthly': return 'Month (s)';
      case 'Yearly': return 'Year (s)';
      default: return 'Day (s)';
    }
  }

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
    <Formik<any>
      initialValues={initialValues}
      validationSchema={MeetingSchema}
      onSubmit={(vals, { setSubmitting, resetForm }) => {
        // Convert time strings to Date objects for API compatibility
        const now = new Date();
        const currentDate = vals.startDate || now;

        const startDateTime = new Date(currentDate);
        const [startHour, startMinute] = (vals.startTime || "09:00").split(':');
        startDateTime.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);

        const endDateTime = new Date(currentDate);
        const [endHour, endMinute] = (vals.endTime || "10:00").split(':');
        endDateTime.setHours(parseInt(endHour), parseInt(endMinute), 0, 0);

        const payload = {
          ...vals,
          startDate: startDateTime,
          startTime: startDateTime,
          endTime: endDateTime,
          tags: vals.tags ? vals.tags.map((t: string) => t.trim()).filter(Boolean) : [],
          files: uploadedFiles
        };
        onSubmit(payload);
        setSubmitting(false)
        resetForm()
      }}
    >
      {({ values, setFieldValue }) => (
        <Form className="flex flex-col gap-4 ">
          {/* Title */}
          <div className="p-4">

            <TextInput label="Meeting Title" name="title" placeholder="e.g. Call with ADE Construction" />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-3 gap-4 p-4">
            <TextInput label="Date" type="date" name="startDate" />
            <TextInput label="Start Time" type="time" name="startTime" />
            <TextInput label="End Time" type="time" name="endTime" />
          </div>

          {/* Repeat Meeting */}
          <div className="p-4">
            <CheckboxInput name="repeatMeeting" label="Repeat this meeting" />
            {values.repeatMeeting && (
              <div>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <SelectInput label="Frequency" name="frequency">
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Yearly">Yearly</option>
                  </SelectInput>
                  <div>
                    <label htmlFor="repeatEvery">Repeat Every</label>
                    <div className="flex rounded-md shadow-sm border border-[var(--border-gray)] focus-within:ring-1">
                      <input type="number" id="repeatEvery" value={values.repeatEvery} name="repeatEvery" min={0} onChange={(e) => setFieldValue('repeatEvery', e.target.value)} className="flex-1 rounded-l-md px-3 py-2 outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [appearance:textfield] w-1/4" />
                      <div className="flex items-center gap-1 border-l px-1 text-gray-400 font-light text-sm">
                        {renderDuration(values?.frequency)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <TextInput label="Repeat On" name="repeatOn" placeholder="e.g. Monday" />
                  <SelectInput label="Ends" name="ends">
                    <option value="Never">Never</option>
                    <option value="After">After</option>
                    <option value="OnDate">On Date</option>
                  </SelectInput>
                </div>
              </div>
            )}
          </div>
          <div className="p-4 flex flex-col gap-4">

            {/* Linked To */}
            <TextInput label="Linked To" name="linkedTo" placeholder="Deal, Company or Contact" />

            {/* Location */}
            <TextInput label="Location / Format" name="location" placeholder="Zoom / Meet link" />

            {/* Assigned To */}
            <TextInput label="Assigned To" name="assignedTo" placeholder="Team member" />

            {/* Participants */}
            <TagInput name='Participants' values={values.participants} setValue={(values: string[]) => setFieldValue('participants', values)} input={participantsInput} setInput={(value: string) => setParticipantsInput(value)} />

            {/* Status */}
            <SelectInput label="Status" name="status">
              <option value="scheduled">Scheduled</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </SelectInput>

            {/* Tags */}
            {/* <TextInput label="Tags (optional)" name="tags" placeholder="Add tags" /> */}
            <TagInput name='Tags' values={values.tags} setValue={(values: string[]) => setFieldValue('tags', values)} input={tagInput} setInput={(value: string) => setTagInput(value)} />

            {/* Notes */}
            <TextareaInput label="Notes" name="notes" rows={4} placeholder="Additional notes..." />

            <UploadButton values={values.files} setValue={(values) => setFieldValue('files', values)} uploading={uploading} uploadFile={(e) => handleFileChange(e)} />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center gap-4 p-4 border-t border-[var(--border-gray)]">
            <Button type="button" className=" w-full">Cancel</Button>
            <Button type="submit" className=" w-full bg-black text-white">
              Save Task
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}

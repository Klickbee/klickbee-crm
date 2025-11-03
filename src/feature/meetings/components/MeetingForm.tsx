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
import { Meeting } from "../types/meeting";
import SearchableDropdown from "@/components/ui/SearchableDropdown";
import CalendarDropDown from "@/components/ui/CalendarDropDown";
import CustomDropdown from "@/components/ui/CustomDropdown";

// ✅ Enhanced Yup validation with comprehensive rules
const MeetingSchema = Yup.object().shape({
  title: Yup.string()
    .trim()
    .min(2, "Meeting title must be at least 2 characters")
    .max(100, "Meeting title must not exceed 100 characters")
    .required("Meeting title is required"),

  startDate: Yup.mixed()
    .required("Date is required")
    .test("is-valid-date", "Date is required", (value) => {
      if (!value) return false;
      // Type guard to ensure value is compatible with Date constructor
      if (typeof value === 'string' || typeof value === 'number' || value instanceof Date) {
        const date = new Date(value);
        return !isNaN(date.getTime());
      }
      return false;
    })
    .test("not-in-past", "Meeting date cannot be in the past", (value) => {
      if (!value) return true; // Let the required validation handle this
      // Type guard to ensure value is compatible with Date constructor
      if (typeof value === 'string' || typeof value === 'number' || value instanceof Date) {
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selectedDate >= today;
      }
      return false;
    }),

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
    .test("is-after-start", "End time must be after start time", function (value) {
      const { startTime } = this.parent;
      if (!startTime || !value) return true;
      return value > startTime;
    }),

  location: Yup.string()
    .max(200, "Location must not exceed 200 characters"),

  link: Yup.string()
    .max(500, "Meeting link must not exceed 500 characters")
    .test("is-valid-url", "Meeting link must be a valid URL if provided", (value) => {
      if (!value) return true;
      try {
        new URL(value);
        return true;
      } catch {
        return false;
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
  link: "",
  assignedTo: "",
  participants: [],
  status: "",
  tags: [],
  notes: "",
  files: [],
}

type formProps = {
  onSubmit: (values: any) => void;
  onClose: () => void;
  mode?: 'add' | 'edit';
  initialData?: Meeting;
  usersLoading: boolean
  userOptions: { id: string; value: string; label: string }[]
}
export default function MeetingForm({ onSubmit, onClose, mode = 'add', initialData, usersLoading, userOptions }: formProps) {
  const [tagInput, setTagInput] = useState("")
  const [participantsInput, setParticipantsInput] = useState("")
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);

  const getInitialValues = () => {
    if (mode === 'edit' && initialData) {
      return {
        title: initialData.title || '',
        startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        startTime: initialData.startTime ? (() => {
          const date = new Date(initialData.startTime);
          // Use noon time to avoid timezone shifts and format as HH:MM
          const hours = date.getHours().toString().padStart(2, '0');
          const minutes = date.getMinutes().toString().padStart(2, '0');
          return `${hours}:${minutes}`;
        })() : '09:00',
        endTime: initialData.endTime ? (() => {
          const date = new Date(initialData.endTime);
          // Use noon time to avoid timezone shifts and format as HH:MM
          const hours = date.getHours().toString().padStart(2, '0');
          const minutes = date.getMinutes().toString().padStart(2, '0');
          return `${hours}:${minutes}`;
        })() : '10:00',
        repeatMeeting: initialData.repeatMeeting || false,
        frequency: initialData.frequency || 'Daily',
        repeatOn: initialData.repeatOn || '',
        repeatEvery: initialData.repeatEvery || 1,
        ends: initialData.ends || 'Never',
        linkedTo: initialData.linkedTo ?
          (typeof initialData.linkedTo === 'string' ?
            initialData.linkedTo :
            (initialData.linkedTo as { id: string })?.id || ''
          ) : '',
        location: initialData.location || '',
        link: initialData.link || '',
        assignedTo: initialData.assignedTo ?
          (typeof initialData.assignedTo === 'string' ?
            initialData.assignedTo :
            (initialData.assignedTo as { id: string })?.id || ''
          ) : '',
        participants: initialData.participants || [],
        status: initialData.status && typeof initialData.status === 'string' ?
          (initialData.status === 'Confirmed' ? 'confirmed' :
            initialData.status === 'Cancelled' ? 'cancelled' :
              initialData.status === 'Scheduled' ? 'scheduled' :
                (initialData.status as string).toLowerCase()) : '',
        tags: initialData.tags || [],
        notes: initialData.notes || '',
        files: initialData.files || [],
      };
    }
    return initialValues;
  };

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
      enableReinitialize
      initialValues={getInitialValues()}
      validationSchema={MeetingSchema}
      onSubmit={async (vals, { setSubmitting, resetForm }) => {
        try {
          // Prepare payload with proper ISO datetime strings
          const currentDate = vals.startDate ? new Date(vals.startDate) : new Date();
          const dateStr = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD

          const payload = {
            ...vals,
            // Ensure dates are properly formatted as ISO datetime strings
            startDate: vals.startTime ? (() => {
              const [hours, minutes] = vals.startTime.split(':').map(Number);
              const dateWithTime = new Date(vals.startDate + `T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00.000`);
              return dateWithTime.toISOString();
            })() : null,
            startTime: vals.startTime ? (() => {
              const [hours, minutes] = vals.startTime.split(':').map(Number);
              const dateWithTime = new Date(vals.startDate + `T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00.000`);
              return dateWithTime.toISOString();
            })() : null,
            endTime: vals.endTime ? (() => {
              const [hours, minutes] = vals.endTime.split(':').map(Number);
              const dateWithTime = new Date(vals.startDate + `T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00.000`);
              return dateWithTime.toISOString();
            })() : null,
            tags: vals.tags ? vals.tags.map((t: string) => t.trim()).filter(Boolean) : [],
            participants: vals.participants ? vals.participants.map((p: string) => p.trim()).filter(Boolean) : [],
            linkedId: vals.linkedTo && vals.linkedTo.trim() !== '' ? vals.linkedTo : null,
            assignedId: vals.assignedTo && vals.assignedTo.trim() !== '' ? vals.assignedTo : null,
            files: uploadedFiles
          };

          // Run validation manually BEFORE converting times to Date objects
          await MeetingSchema.validate(vals, { abortEarly: false });

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
            console.error("Failed to save meeting. Please try again.");
          }
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ values, setFieldValue, isSubmitting }) => (
        <Form className="flex flex-col h-full">
          {/* Meeting Title */}
          <div className="p-4">
            <TextInput label="Meeting Title" name="title" placeholder="e.g. Call with ADE Construction" />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-3 gap-4 p-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <CalendarDropDown

                label="Select Date"
                value={values.startDate ? (() => {
                  // Ensure proper date parsing for the CalendarDropDown
                  const dateStr = values.startDate;
                  if (typeof dateStr === 'string' && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    return new Date(dateStr + 'T12:00:00.000Z'); // Add noon time to avoid timezone issues
                  }
                  return new Date(dateStr);
                })() : null}
                buttonClassName=" h-10 mt-1 w-30 text-sm whitespace-nowrap"
                triggerIcon="calendar"

                onChange={(date) => setFieldValue("startDate", date.toISOString().split('T')[0])}
              />
            </div>
            <TextInput label="Start Time" type="time" name="startTime" />
            <TextInput label="End Time" type="time" name="endTime" />
          </div>

          {/* Repeat Meeting */}
          <div className="p-4">

            <CheckboxInput name="repeatMeeting" label="Repeat this meeting" />
            {values.repeatMeeting && (
              <div>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="frequency" className="text-sm font-medium">
                      Frequency
                    </label>

                    <CustomDropdown
                      name="frequency"
                      value={values.frequency}
                      onChange={(val) => setFieldValue("frequency", val)}
                      placeholder="Select Frequency"
                      options={[
                        { value: "Daily", label: "Daily" },
                        { value: "Weekly", label: "Weekly" },
                        { value: "Monthly", label: "Monthly" },
                        { value: "Yearly", label: "Yearly" },
                      ]}
                    />

                    <ErrorMessage name="frequency" component="div" className="text-sm text-red-600" />
                  </div>

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
                  <div className="flex flex-col gap-2">
                    <label htmlFor="ends" className="text-sm font-medium">
                      Ends
                    </label>

                    <CustomDropdown
                      name="ends"
                      value={values.ends}
                      onChange={(val) => setFieldValue("ends", val)}
                      placeholder="Select Option"
                      options={[
                        { value: "Never", label: "Never" },
                        { value: "After", label: "After" },
                        { value: "OnDate", label: "On Date" },
                      ]}
                    />

                    <ErrorMessage name="ends" component="div" className="text-sm text-red-600" />
                  </div>

                </div>
              </div>
            )}
          </div>
          <div className="p-4 flex flex-col gap-4">

            {/* Linked To */}
            <div>
              <label htmlFor="linkedTo" className="block text-sm font-medium text-gray-700 mb-1">
                Linked To
              </label>
              <SearchableDropdown
                name="linkedTo"
                value={values.linkedTo}
                options={userOptions}
                placeholder="Select linkedTo"
                showIcon={false}
                maxOptions={20}
                onChange={(value) => setFieldValue('linkedTo', value)}
              />
            </div>
            {/* Location */}
            <TextInput label="Location" name="location" placeholder="Conference Room A, Office, etc." />

            {/* Link Location */}
            <TextInput label="Link" name="link" placeholder="Zoom / Meet link" />

            {/* Assigned To */}
            <div>
              <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 mb-1">
                Assigned To
              </label>
              <SearchableDropdown
                name="assignedTo"
                value={values.assignedTo}
                options={userOptions}
                placeholder="Select assignedTo"
                showIcon={false}
                maxOptions={20}
                onChange={(value) => setFieldValue('assignedTo', value)}
              />
            </div>

            {/* Participants */}
            <TagInput name='Participants' values={values.participants} setValue={(values: string[]) => setFieldValue('participants', values)} input={participantsInput} setInput={(value: string) => setParticipantsInput(value)} />

            {/* Status */}
            <SelectInput label="Status" name="status" value={values.status}>
              <option value="" disabled>Select Status</option>

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
            <Button type="submit" className=" w-full bg-black text-white " >
              Save Meeting
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}

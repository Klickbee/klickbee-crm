import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";
import * as Yup from "yup";
import TextInput from "@/components/ui/TextInput";
import SelectInput from "@/components/ui/SelectInput";
import TextareaInput from "@/components/ui/TextareaInput";
import CheckboxInput from "@/components/ui/CheckboxInput";
import { Trash2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Meeting } from "../types/meeting";
import TagInput from "@/components/ui/TagInput";
import { useState } from "react";

// ✅ Yup validation
const MeetingSchema = Yup.object().shape({
  title: Yup.string().required("Meeting title is required"),
  startDate: Yup.date().required("Date is required"),
  startTime: Yup.string().required("Start time is required"),
  endTime: Yup.string().required("End time is required"),
  location: Yup.string(),
  assignedTo: Yup.string(),
  participants: Yup.array().of(Yup.string().required("Participant name required")),
  files: Yup.array().of(Yup.mixed<File>()),
});

const initialValues: Meeting = {
  title: "",
  startDate: new Date(),
  startTime: new Date(),
  endTime: new Date(),
  repeatMeeting: false,
  frequency: "Daily",
  repeatOn: "",
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
  return (
    <Formik<Meeting>
      initialValues={initialValues}
      validationSchema={MeetingSchema}
      onSubmit={(values) => {
        onSubmit(values);
      }}
    >
      {({ values, setFieldValue }) => (
        <Form className="space-y-6 p-6">
          {/* Title */}
          <TextInput label="Meeting Title" name="title" placeholder="e.g. Call with ADE Construction" />

          {/* Date & Time */}
          <div className="grid grid-cols-3 gap-4">
            <TextInput label="Date" type="date" name="startDate" />
            <TextInput label="Start Time" type="time" name="startTime" />
            <TextInput label="End Time" type="time" name="endTime" />
          </div>

          {/* Repeat Meeting */}
          <div>
            <CheckboxInput name="repeatMeeting" label="Repeat this meeting" />
            {values.repeatMeeting && (
              <div className="grid grid-cols-3 gap-4 mt-2">
                <SelectInput label="Frequency" name="frequency">
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Yearly">Yearly</option>
                </SelectInput>
                <TextInput label="Repeat On" name="repeatOn" placeholder="e.g. Monday" />
                <SelectInput label="Ends" name="ends">
                  <option value="Never">Never</option>
                  <option value="After">After</option>
                  <option value="OnDate">On Date</option>
                </SelectInput>
              </div>
            )}
          </div>

          {/* Linked To */}
          <TextInput label="Linked To" name="linkedTo" placeholder="Deal, Company or Contact" />

          {/* Location */}
          <TextInput label="Location / Format" name="location" placeholder="Zoom / Meet link" />

          {/* Assigned To */}
          <TextInput label="Assigned To" name="assignedTo" placeholder="Team member" />

          {/* Participants */}
          <TagInput name='Participants' values={values.participants} setValue={(values: string[]) => setFieldValue('participants', values)} input={participantsInput} setInput={(value: string) => setParticipantsInput(value)}/>

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

          
          {/* <div className="space-y-2">
            <label className="text-sm font-medium">Attached Files</label>
            <div className="rounded-md border border-dashed border-border p-4">
              <label className="flex cursor-pointer items-center gap-3">
                <UploadCloud className="size-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Choose a file or drag & drop it here. PDF/JPG/PNG max 10 MB.
                </span>
                <input
                  type="file"
                  className="sr-only"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.currentTarget.files ?? [])
                    console.log("Selected files:", files)
                    setFieldValue("files", [...values.files, ...files])
                  }}
                />
              </label>
            </div>

            <ul className="space-y-2">
              {values?.files.map((f, i) => (
                <li
                  key={`${f.name}-${i}`}
                  className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                >
                  <span className="text-sm truncate">{f.name}</span>
                  <Button
                    type="button"
                    className="text-red-500 cursor-pointer"
                    onClick={() => {
                      const next = [...values.files]
                      next.splice(i, 1)
                      console.log("Remaining files:", next)
                      setFieldValue("files", next)
                    }}
                  >
                    <Trash2 className="mr-1 size-4" />
                    Delete
                  </Button>
                </li>
              ))}
            </ul>
          </div> */}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button type="button" className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Save Meeting
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}

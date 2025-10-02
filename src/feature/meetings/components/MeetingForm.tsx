import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";
import * as Yup from "yup";
import TextInput from "@/components/ui/TextInput";
import SelectInput from "@/components/ui/SelectInput";
import TextareaInput from "@/components/ui/TextareaInput";
import CheckboxInput from "@/components/ui/CheckboxInput";
import { Meeting } from "../types/meeting";
import TagInput from "@/components/ui/TagInput";
import { useState } from "react";
import UploadButton from "@/components/ui/UploadButton";
import { Button } from "@/components/ui/Button";

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
  repeatEvery: 0,
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

  const renderDuration = (frequency: string | undefined) => {
    if(!frequency) return;
    switch(frequency){
      case 'Daily': return 'Day (s)';
      case 'Weekly': return 'Weeks (s)';
      case 'Monthly': return 'Month (s)';
      case 'Yearly': return 'Year (s)';
      default: return 'Day (s)';
    }
  }
  return (
    <Formik<Meeting>
      initialValues={initialValues}
      validationSchema={MeetingSchema}
      onSubmit={(values) => {
        onSubmit(values);
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

          <UploadButton values={values.files} setValue={(values) => setFieldValue('files', values)} />
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

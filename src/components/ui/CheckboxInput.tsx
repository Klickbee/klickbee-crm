import { Field, ErrorMessage } from 'formik'

const CheckboxInput = ({ label, ...props }: { label: string; [key: string]: any }) => (
  <label className="flex items-center gap-2">
    <Field type="checkbox" {...props} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
    <span className="text-sm text-gray-700">{label}</span>
    <ErrorMessage name={props.name} component="div" className="text-sm text-red-500" />
  </label>
);

export default CheckboxInput
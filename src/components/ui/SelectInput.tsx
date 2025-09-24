import { Field, ErrorMessage } from 'formik'
const SelectInput = ({ label, children, ...props }: { label: string; children: React.ReactNode; [key: string]: any }) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <Field
      as="select"
      {...props}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
    >
      {children}
    </Field>
    <ErrorMessage name={props.name} component="div" className="text-sm text-red-500" />
  </div>
);

export default SelectInput
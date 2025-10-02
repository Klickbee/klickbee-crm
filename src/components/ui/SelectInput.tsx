import { Field, ErrorMessage } from 'formik'
const SelectInput = ({ label, children, ...props }: { label: string; children: React.ReactNode; [key: string]: any }) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <Field
      as="select"
      {...props}
      className="w-full px-3 py-2 shadow-sm border border-[var(--border-gray)] rounded-lg focus:ring-1 focus:ring-gray-400 focus:outline-none"
    >
      {children}
    </Field>
    <ErrorMessage name={props.name} component="div" className="text-sm text-red-500" />
  </div>
);

export default SelectInput
import { Field, ErrorMessage } from 'formik';

const TextareaInput = ({ label, ...props }: { label: string; [key: string]: any }) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <Field
      as="textarea"
      {...props}
      className="w-full px-3 py-2 shadow-sm border border-[var(--border-gray)] rounded-lg focus:ring-1 focus:ring-gray-400 focus:outline-none"
    />
    <ErrorMessage name={props.name} component="div" className="text-sm text-red-500" />
  </div>
);

export default TextareaInput
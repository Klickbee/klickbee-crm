import { Field, ErrorMessage } from 'formik'

const CheckboxInput = ({ label, ...props }: { label: string; [key: string]: any }) => (
  <label className="flex items-center gap-2">
    <Field type="checkbox" {...props}  className="
                                                                relative appearance-none w-4 h-4 rounded shadow-sm
                                                                border border-[var(--border-gray)]
                                                                bg-white
                                                                checked:bg-black checked:border-black
                                                                checked:before:content-['✔'] checked:before:absolute
                                                                checked:before:inset-0 checked:before:flex
                                                                checked:before:items-center checked:before:justify-center
                                                                checked:before:text-white checked:before:text-xs
                                                            " />
    <span className="text-sm text-gray-700">{label}</span>
    <ErrorMessage name={props.name} component="div" className="text-sm text-red-500" />
  </label>
);

export default CheckboxInput
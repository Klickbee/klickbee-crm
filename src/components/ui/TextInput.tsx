import { Field, ErrorMessage } from 'formik'
import React from 'react';
const TextInput = ({ label, ...props }: { label: string;[key: string]: any }) => {
    return (
        <div className="flex flex-col gap-[8px] mb-0">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <Field
                {...props}
                className="w-full px-3 py-2 shadow-sm border border-[var(--border-gray)] rounded-lg focus:ring-1 focus:ring-gray-400 focus:outline-none"
            />
            <ErrorMessage name={props.name} component="div" className="text-sm text-red-500" />
        </div>
    )
};

export default TextInput
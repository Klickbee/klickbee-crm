import { Field, ErrorMessage } from 'formik'
import React from 'react';
const TextInput = ({ label, ...props }: { label: string;[key: string]: any }) => {
    return (
        <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <Field
                {...props}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <ErrorMessage name={props.name} component="div" className="text-sm text-red-500" />
        </div>
    )
};

export default TextInput
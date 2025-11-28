import React, { forwardRef } from 'react';

interface TextareaInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

const TextareaInput = forwardRef<HTMLTextAreaElement, TextareaInputProps>(
  ({ label, error, className = '', ...props }, ref) => (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <textarea
        ref={ref}
        {...props}
        className={`w-full px-3 py-2 shadow-sm border border-[var(--border-gray)] rounded-lg focus:ring-1 focus:ring-gray-400 focus:outline-none ${className}`.trim()}
      />
      {error && <div className="text-sm text-red-500">{error}</div>}
    </div>
  )
);

TextareaInput.displayName = 'TextareaInput';

export default TextareaInput;

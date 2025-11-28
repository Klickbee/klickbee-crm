import React, { forwardRef } from 'react';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(({ label, error, className = '', ...props }, ref) => {
  return (
    <div className="flex flex-col gap-[8px] mb-0">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        ref={ref}
        {...props}
        className={`w-full px-3 py-2 shadow-sm border border-[var(--border-gray)] rounded-lg focus:ring-1 focus:ring-gray-400 focus:outline-none ${className}`.trim()}
      />
      {error && <div className="text-sm text-red-500">{error}</div>}
    </div>
  );
});

TextInput.displayName = 'TextInput';

export default TextInput;

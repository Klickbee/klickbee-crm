import React, { forwardRef } from 'react';

interface CheckboxInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const CheckboxInput = forwardRef<HTMLInputElement, CheckboxInputProps>(
  ({ label, error, className = '', ...props }, ref) => (
    <label className="flex items-center gap-2">
      <input
        type="checkbox"
        ref={ref}
        {...props}
        className={`relative appearance-none w-4 h-4 rounded shadow-sm border border-[var(--border-gray)] bg-white checked:bg-black checked:border-black checked:before:content-['✔'] checked:before:absolute checked:before:inset-0 checked:before:flex checked:before:items-center checked:before:justify-center checked:before:text-white checked:before:text-xs ${className}`.trim()}
      />
      <span className="text-sm text-gray-700">{label}</span>
      {error && <div className="text-sm text-red-500">{error}</div>}
    </label>
  )
);

CheckboxInput.displayName = 'CheckboxInput';

export default CheckboxInput;

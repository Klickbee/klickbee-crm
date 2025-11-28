import React, { forwardRef } from 'react';

interface SelectInputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  children: React.ReactNode;
}

const SelectInput = forwardRef<HTMLSelectElement, SelectInputProps>(
  ({ label, error, className = '', children, ...props }, ref) => (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <select
        ref={ref}
        {...props}
        className={`w-full px-3 py-2 shadow-sm border border-[var(--border-gray)] rounded-lg focus:ring-1 focus:ring-gray-400 focus:outline-none ${className}`.trim()}
      >
        {children}
      </select>
      {error && <div className="text-sm text-red-500">{error}</div>}
    </div>
  )
);

SelectInput.displayName = 'SelectInput';

export default SelectInput;

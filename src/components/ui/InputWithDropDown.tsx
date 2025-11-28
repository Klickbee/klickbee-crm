import React from 'react';
import { option } from '@/feature/deals/libs/currencyOptions';

type InputWithDropDownProps = {
  inputName: string;
  optionName: string;
  options: option[];
  inputRef?: React.Ref<HTMLInputElement>;
  selectRef?: React.Ref<HTMLSelectElement>;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  selectProps?: React.SelectHTMLAttributes<HTMLSelectElement>;
};

const InputWithDropDown = ({
  inputName,
  optionName,
  options,
  inputRef,
  selectRef,
  inputProps = {},
  selectProps = {},
}: InputWithDropDownProps) => {
  return (
    <div className="flex rounded-md border shadow-sm  border-[var(--border-gray)] bg-background focus-within:ring-2 focus-within:ring-ring">
      <input
        id={inputName}
        name={inputName}
        type="number"
        step="0.01"
        min="0"
        ref={inputRef}
        className="flex-1 text-sm rounded-l-md px-3 py-2 outline-none [&::-webkit-inner-spin-button]:appearance-none [&:-webkit-outer-spin-button]:appearance-none [appearance:textfield] w-1/4"
        {...inputProps}
      />

      <div className="flex items-center gap-1 border-l border-[var(--border-gray)] ">
        <select
          id={optionName}
          name={optionName}
          ref={selectRef}
          className="rounded-md text-sm bg-transparent outline-none pr-2"
          {...selectProps}
        >
          {options?.map((option, index) => (
            <option key={`${option.value}-${index}`} value={option.value}>
              {option.symbol}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default InputWithDropDown;

import { Field } from 'formik'
import React from 'react'
import { option } from '@/feature/deals/libs/currencyOptions'
type inputProps = {
    inputName: string;
    optionName: string;
    options: option[]
}

const InputWithDropDown = ({inputName, optionName, options}: inputProps) => {
    return (
        <div className="flex rounded-md border shadow-sm  border-[var(--border-gray)] bg-background focus-within:ring-2 focus-within:ring-ring">
            {/* Amount Input */}
            <Field
                id={inputName}
                name={inputName}
                type="number"
                step="0.01"
                min="0"
                className="flex-1 text-sm rounded-l-md px-3 py-2 outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [appearance:textfield] w-1/4"
            />

            {/* Currency Select */}
            <div className="flex items-center gap-1 border-l border-[var(--border-gray)] ">
                <Field
                    as="select"
                    id={optionName}
                    name={optionName}
                    className="rounded-md text-sm bg-transparent outline-none pr-2"
                >
                    {options?.map((option, index) => (
                        <option key={`${option.value}-${index}`} value={option.value}> {option.symbol} </option>
                    ))}
                </Field>
            </div>
        </div>
    )
}

export default InputWithDropDown
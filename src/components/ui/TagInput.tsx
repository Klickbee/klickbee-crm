import React, { useState } from 'react'

type tagInputProps = {
    name: string;
    values: string[] | undefined;
    setValue: (values: string[]) => void;
    input: string;
    setInput: (value: string) => void;
}


const TagInput = ({name, values, setValue, input, setInput}: tagInputProps) => {
    
        function handleTagKeyDown(
            e: any,
            values: string[] | undefined,
        ) {
            if (e.key === "Enter" || e.key === ",") {
                e.preventDefault()
                const v = input.trim()
                if (!v) return
                if (!values?.includes(v)) {
                    if(values){
                        setValue([...values, v])
                    }else{
                        setValue([v])
                    }
                }
                setInput("")
            }
        }

    return (
        <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">{name}</label>
            <div className="flex flex-wrap gap-2 p-2 shadow-sm border border-[var(--border-gray)] rounded-lg focus:ring-1 focus:ring-[var(--border-gray)] focus:outline-none">
                {values?.map((t, idx) => (
                    <span
                        key={`${t}-${idx}`}
                        className="inline-flex items-center gap-2 rounded-md bg-gray-200 px-2 py-1 text-xs"
                    >
                        {t}
                        <button
                            type="button"
                            onClick={() =>
                                setValue(
                                    values.filter((_, i) => i !== idx),
                                )
                            }
                            className="text-muted-foreground hover:text-foreground"
                            aria-label={`Remove ${t}`}
                        >
                            ×
                        </button>
                    </span>
                ))}

                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => handleTagKeyDown(e, values)}
                    placeholder={`Add ${name}`}
                    className="flex-1 min-w-24 px-2 py-1 outline-none"
                />
            </div>
        </div>
    )
}

export default TagInput
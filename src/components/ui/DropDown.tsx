"use client"

import { ChevronDown } from "lucide-react"
import { useEffect, useRef, useState } from "react"

interface SelectOption {
  value: string
  label: string
}

interface DropDownProps {
  options: SelectOption[]
  value?: string
  placeholder?: string
  onChange?: (value: string) => void
  className?: string
  disabled?: boolean
  triggerClassName?: string
  iconOnly?: boolean
  centerChevron?: boolean
}

export function DropDown({
  options,
  value,
  placeholder = "Select option",
  onChange,
  className = "",
  disabled = false,
  triggerClassName = "",
  iconOnly = false,
  centerChevron = false,
}: DropDownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function onDocumentClick(e: MouseEvent) {
      if (!containerRef.current) return
      if (e.target instanceof Node && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", onDocumentClick)
    return () => document.removeEventListener("mousedown", onDocumentClick)
  }, [])

  const selected = options.find((o) => o.value === value)

  return (
    <div ref={containerRef} className="relative inline-block w-fit">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((v) => !v)}
        className={`bg-white border border-[var(--border-gray)] rounded-md h-9 w-[180px] py-2 pl-3 pr-9 text-left leading-[20px] text-sm text-gray-900 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${
          centerChevron ? "grid place-items-center pl-0 pr-0 text-transparent" : ""
        } ${className} ${triggerClassName}`}
      >
        {centerChevron ? (
          <ChevronDown
            className={`h-4 w-4 text-gray-500 transition-transform ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
            aria-hidden
          />
        ) : iconOnly ? (
          <span className="sr-only">Open menu</span>
        ) : (
          selected ? selected.label : placeholder
        )}
      </button>
      {!centerChevron && (
        <ChevronDown
          className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      )}

      {isOpen && (
        <ul
          role="listbox"
          className="absolute z-20 mt-1  h-[132px]  rounded-md border border-[var(--border-gray)] bg-white shadow-md pt-1 px-1"
        >
          {options.map((option) => {
            const isSelected = option.value === value
            return (
              <li
                key={option.value}
                role="option"
                aria-selected={isSelected}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange?.(option.value)
                  setIsOpen(false)
                }}
                className={`cursor-pointer w-[216px] h-[32px] rounded-sm px-2 py-1.5 text-[16px] leading-[24px] text-gray-900 hover:bg-gray-50 ${
                  isSelected ? "bg-gray-50" : ""
                }`}
              >
                {option.label}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

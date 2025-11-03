"use client"

import { useState, useRef, useEffect } from "react"

interface Option {
  value: string
  label: string
}

interface CustomDropdownProps {
  name: string
  value: string
  options: Option[]
  placeholder?: string
  onChange: (value: string) => void
  openByDefault?: boolean
}

export default function CustomDropdown({
  name,
  value,
  options,
  placeholder = "Select an option",
  onChange,
  openByDefault = false,
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(openByDefault)
  const [selected, setSelected] = useState<string | null>(value)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Sync selected label when value changes externally
  useEffect(() => {
    setSelected(value)
  }, [value])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelect = (option: Option) => {
    setSelected(option.label)
    onChange(option.value)
    setIsOpen(false)
  }

  const selectedLabel =
    options.find((opt) => opt.value === selected)?.label || placeholder

  return (
    <div className="relative w-full text-sm" ref={dropdownRef}>
      {/* Trigger */}
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full rounded-md shadow-sm border border-[var(--border-gray)] bg-background px-3 py-2 flex justify-between items-center cursor-pointer focus:ring-1 focus:ring-gray-400"
      >
        <span className={selected ? "text-gray-900" : "text-gray-500"}>
          {selectedLabel}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Dropdown list */}
      {isOpen && (
        <div
          className="absolute z-50 mt-[.5px] w-full rounded-md border-2 border-[#E4E4E7] bg-white max-h-48 overflow-y-auto"
          style={{
            boxShadow:
              "0 2px 4px -2px rgba(0, 0, 0, 0.1), 0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
        >
          {options.length > 0 ? (
            options.map((option) => (
              <div
                key={option.value}
                className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                onMouseDown={() => handleSelect(option)} // 👈 ensures it fires before blur
              >
                {option.label}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-gray-500">No results</div>
          )}
        </div>
      )}
    </div>
  )
}

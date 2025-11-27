import { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import { useCompanyModalStore } from "@/feature/companies/stores/useCompanyModalStore";
import { useCustomerModalStore } from "@/feature/customers/stores/useCustomersModel";
import { useCompaniesStore } from "@/feature/companies/stores/useCompaniesStore";

interface Option {
  id: string;
  value: string; // The actual value to store (could be ID)
  label: string; // The display label
}

interface SearchableDropdownProps {
  name: string;
  value: string;
  placeholder?: string;
  options: Option[];
  onChange: (value: string) => void;
  showIcon?: boolean;
  maxOptions?: number;
}

export default function SearchableDropdown({
  name,
  value,
  placeholder = "Search...",
  options,
  onChange,
  showIcon = true,
  maxOptions,
}: SearchableDropdownProps) {
  // Find the label for the current value
  const getDisplayLabel = (val: string) => {
    const option = options.find(opt => opt.value === val);
    return option ? option.label : val;
  };


  const [query, setQuery] = useState(() => {
    const displayLabel = getDisplayLabel(value);
    return displayLabel || "";
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isAddingCompany, setIsAddingCompany] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Subscribe to lastCompanyId from companies store to auto-select newly created company
  const lastCompanyId = useCompaniesStore(state => state.lastCompanyId);

  // ✅ Sync query state with value prop changes
  useEffect(() => {
    // compute display label inline to avoid depending on `getDisplayLabel` reference
    const displayLabel = options.find(opt => opt.value === value)?.label ?? value ?? "";
    setQuery(displayLabel);
  }, [value, options]);

  // When we opened the add-company modal and lastCompanyId is set, select it
  useEffect(() => {
    if (!isAddingCompany) return;
    if (!lastCompanyId) return;

    // Try to find the option that matches the created company id
    const createdOption = options.find(o => o.id === lastCompanyId || o.value === lastCompanyId);
    if (createdOption) {
      onChange(lastCompanyId);
      setQuery(createdOption.label);
      setIsOpen(false);
    }

    // Reset the adding flag whether we matched or not - we only want to react once
    setIsAddingCompany(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastCompanyId]);

  const filteredOptions = options
    .filter((opt) => opt.label.toLowerCase().includes(query.toLowerCase()))
    .slice(0, maxOptions);

  return (
    <div ref={dropdownRef} className="w-full relative">
      <div className="relative">
        {showIcon && (
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        )}
        <input
          id={name}
          name={name}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value);
          }}
          onFocus={() => setIsOpen(true)}
        onBlur={(e) => {
          if (!dropdownRef.current?.contains(e.relatedTarget)) {
            setIsOpen(false);
          }
        }}

          className={`w-full rounded-md text-sm border border-[var(--border-gray)] shadow-sm bg-background ${
            showIcon ? "pl-10" : "pl-3"
          } pr-3 py-2 outline-none focus:ring-1 focus:ring-[#E4E4E7]`}
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-[.5px] w-full rounded-md border-2 border-[#E4E4E7] bg-white max-h-48 overflow-y-auto" style={{ boxShadow: "0 2px 4px -2px rgba(0, 0, 0, 0.1), 0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <div
                key={option.id}
                className="px-3 py-2 cursor-pointer text-sm hover:bg-gray-100"
              onMouseDown={() => {
                if (option.value === "add-company") {
                  // Mark that we opened add company modal so we can react when it's submitted
                  setIsAddingCompany(true);
                  // ✅ Instead of router.push, open modal via Zustand
                  useCompanyModalStore.getState().openModal("add");
                } 
                if(option.value === "add-contact") {
                      useCustomerModalStore.getState().openModal("add");
                } 
            // ✅ onMouseDown fires before onBlur, so selection works properly
            onChange(option.value);
            setQuery(option.label);
            setIsOpen(false);
          }}
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
  );
}

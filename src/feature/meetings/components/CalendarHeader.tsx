import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import { ViewType } from "../types/meeting";
import { Button } from "@/components/ui/Button";
import { DropDown } from "@/components/ui/DropDown";
import { useMeetingsStore } from "../stores/useMeetingsStore";
interface CalendarHeaderProps {
  currentDate: Date;
  currentView: ViewType;
  onDateChange: (date: Date) => void;
  onViewChange: (view: ViewType) => void;
  onAddMeeting: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  currentView,
  onDateChange,
  onViewChange,
  onAddMeeting,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { filters, setFilters, applyFilters, initializeOwnerOptions, setSearchTerm } = useMeetingsStore();


 

  // Initialize owner options when component mounts
  useEffect(() => {
    initializeOwnerOptions();
  }, [initializeOwnerOptions]);

  // Convert store filters to dropdown format
  const getSelectedValue = (filterType: 'status' | 'owner' | 'tags') => {
    const filter = filters[filterType];
    const selectedOption = filter.find(option => option.checked && option.id !== "all");
    return selectedOption ? selectedOption.id : "all";
  };

  // Handle filter changes
  const handleFilterChange = (filterType: 'status' | 'owner' | 'tags', value: string) => {
    const newFilters = { ...filters };
    // Uncheck all options first
    newFilters[filterType] = newFilters[filterType].map(option => ({
      ...option,
      checked: false
    }));
    // Check the selected option (or "all" if "all" is selected)
    if (value === "all") {
      newFilters[filterType] = newFilters[filterType].map(option =>
        option.id === "all" ? { ...option, checked: true } : option
      );
    } else {
      newFilters[filterType] = newFilters[filterType].map(option =>
        option.id === value ? { ...option, checked: true } : option
      );
    }
    setFilters(newFilters);
    applyFilters(); // Apply the filters after setting them
  };

  return (
    <header>
      <div className=" flex items-center justify-between
        h-[68px]
        border-b border-[var(--border-gray)]
        px-8 py-4
        bg-background
      ">
        <div className="flex items-center gap-2">

          
          <DropDown
            options={filters.owner.map(opt => ({ value: opt.id, label: opt.label }))}
            value={getSelectedValue('owner')}
            onChange={(value) => handleFilterChange('owner', value)}
          />
          <DropDown
            options={filters.tags.map(opt => ({ value: opt.id, label: opt.label }))}
            value={getSelectedValue('tags')}
            onChange={(value) => handleFilterChange('tags', value)}
          />
          <DropDown
            options={filters.status.map(opt => ({ value: opt.id, label: opt.label }))}
            value={getSelectedValue('status')}
            onChange={(value) => handleFilterChange('status', value)}
          />
        </div>
        {/* === Right Add Button with Dropdown === */}
        <div
          className="relative flex min-w-[155px] "
        >
          <Button
            onClick={onAddMeeting}
            className="whitespace-nowrap bg-black  text-white"
          >
            <Plus size={16} className="" />
            <span className="">New Meeting</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { ViewType } from "../types/meeting";
import { Button } from "@/components/ui/Button";
import { DropDown } from "@/components/ui/DropDown";

interface CalendarHeaderProps {
  currentDate: Date;
  currentView: ViewType;
  onDateChange: (date: Date) => void;
  onViewChange: (view: ViewType) => void;
  onAddMeeting: () => void;
}
const userOptions = [
  { value: "all", label: "All Types" },
  { value: "active", label: "Active Types" },
  { value: "inactive", label: "Inactive Types" },
]

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "confirmed", label: "Confirmed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "scheduled", label: "Scheduled" },
]

const timePeriodOptions = [
  { value: "all", label: "All Owners" },
  { value: "active", label: "Active Owners" },
  { value: "inactive", label: "Inactive Owners" },
]

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  currentView,
  onDateChange,
  onViewChange,
  onAddMeeting,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [selectedUser, setSelectedUser] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedTimePeriod, setSelectedTimePeriod] = useState("all")

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
            options={timePeriodOptions}
            value={selectedTimePeriod}
            onChange={setSelectedTimePeriod}
          />
          <DropDown options={userOptions} value={selectedUser} onChange={setSelectedUser} />
          <DropDown options={statusOptions} value={selectedStatus} onChange={setSelectedStatus} />
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

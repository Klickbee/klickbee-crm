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
  { value: "all", label: "All Users" },
  { value: "active", label: "Active Users" },
  { value: "inactive", label: "Inactive Users" },
]

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "new", label: "New" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
]

const timePeriodOptions = [
  { value: "today", label: "Today" },
  { value: "this-week", label: "This Week" },
  { value: "this-month", label: "This Month" },
  { value: "this-year", label: "This Year" },
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
  const [selectedTimePeriod, setSelectedTimePeriod] = useState("this-month")



  // const formatDate = () => {
  //   if (currentView === "yearly") return currentDate.getFullYear().toString();
  //   if (currentView === "monthly")
  //     return currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  //   if (currentView === "weekly") {
  //     const weekStart = new Date(currentDate);
  //     weekStart.setDate(currentDate.getDate() - currentDate.getDay());
  //     const weekEnd = new Date(weekStart);
  //     weekEnd.setDate(weekStart.getDate() + 6);
  //     return `${weekStart.toLocaleDateString("en-US", {
  //       month: "short",
  //       day: "numeric",
  //     })} - ${weekEnd.toLocaleDateString("en-US", {
  //       month: "short",
  //       day: "numeric",
  //       year: "numeric",
  //     })}`;
  //   }
  //   return currentDate.toLocaleDateString("en-US", {
  //     month: "long",
  //     day: "numeric",
  //     year: "numeric",
  //   });
  // };

  // const navigateDate = (direction: "prev" | "next") => {
  //   const newDate = new Date(currentDate);
  //   switch (currentView) {
  //     case "daily":
  //       newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
  //       break;
  //     case "weekly":
  //       newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
  //       break;
  //     case "monthly":
  //       newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
  //       break;
  //     case "yearly":
  //       newDate.setFullYear(newDate.getFullYear() + (direction === "next" ? 1 : -1));
  //       break;
  //   }
  //   onDateChange(newDate);
  // };

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

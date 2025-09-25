"use client"
import { Button } from "@/components/ui/Button"
import { DropDown } from "@/components/ui/DropDown"
import { Search, LayoutGrid, List, Plus, Calendar } from "lucide-react"
import { useState } from "react"

// Filter options
const statusOptions = [
  { value: "all-status", label: "All Status" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "closed", label: "Closed" },
]

const ownerOptions = [
  { value: "all-owner", label: "All Owner" },
  { value: "me", label: "Me" },
  { value: "team", label: "Team" },
  { value: "unassigned", label: "Unassigned" },
]

const priorityOptions = [
  { value: "all-priority", label: "All Priority" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
]

type TodoHeaderProps = {
  view: 'table' | 'grid';
  setView: (view: 'table' | 'grid') => void;
}

export function TodoHeader({ view, setView }: TodoHeaderProps) {
  const [statusOptionsUser, setstatusOptionsUser] = useState('all-status')
  const [ownerOptionsUser, setownerOptionsUser] = useState('all-owner')
  const [priorityOptionsUser, setpriorityOptionsUser] = useState('all-priority')
  return (
    <div
      className="
        flex items-center justify-between
        h-[68px]
        border-b border-[var(--border-gray)]
        px-8 py-4
        bg-background
      "
    >
      {/* Left section - Search + Dropdown + Filter */}
      <div className="flex w-auto h-[36px] items-center gap-2">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search"
            className="
              pl-9 w-full h-[36px]
              bg-card border border-[var(--border-gray)] rounded-md
              text-sm outline-none shadow-sm
            "
          />
        </div>

        {/* Dropdown */}
        <DropDown
          options={statusOptions}
          value={statusOptionsUser}
          onChange={setstatusOptionsUser}
          className="h-[36px] w-auto"
        />
        <DropDown
          options={ownerOptions}
          value={ownerOptionsUser}
          onChange={setownerOptionsUser}
          className="h-[36px] w-auto "
        />
        <DropDown
          options={priorityOptions}
          value={priorityOptionsUser}
          onChange={setpriorityOptionsUser}
          className="h-[36px] w-auto "
        />
        <div className="relative">
          <input
            type="date"

            className=" h-[36px] px-2 bg-card border border-[var(--border-gray)] rounded-md text-sm outline-none shadow-sm"
          />
        </div>

      </div>

      {/* Right section - View Switch + Action Buttons */}
      <div className="flex w-[208px] ml-7 h-[36px] items-center gap-2">
        {/* List/Grid toggle */}
        <div className="flex h-[36px] items-center bg-[#F4F4F5] border border-[var(--border-gray)] rounded-md overflow-hidden">
          <button
            className={`flex h-7 w-9 ml-1 items-center justify-center rounded-md border-r border-[var(--border-gray)] hover:bg-muted cursor-pointer ${view === 'table' ? 'bg-white shadow-sm' : ''
              }`}
            onClick={() => setView('table')}
          >
            <List className="h-4 w-4" />
          </button>

          <button
            className={`flex h-7 rounded-md mr-1 w-9 items-center justify-center hover:bg-muted cursor-pointer ${view === 'grid' ? 'bg-white shadow-sm' : ''
              }`}
            onClick={() => setView('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>




        {/* New Task */}
        <Button className="whitespace-nowrap bg-black">
          <Plus className="text-[#FAFAFA] h-4 w-4 " />
          <span className="text-[#FAFAFA]"> New Task</span>
        </Button>
      </div>
    </div>
  )
}

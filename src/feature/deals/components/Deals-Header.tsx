"use client"
import { Button } from "@/components/ui/Button"
import { DropDown } from "@/components/ui/DropDown"
import { Search, Filter, LayoutGrid, List, Download, Upload, Plus } from "lucide-react"
import { useState } from "react"

const userOptions = [{ value: "Closed", label: "Closed Time" }]

export function DealsHeader() {
  const [selectedUser, setSelectedUser] = useState("Closed")

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
      <div className="flex w-[499px] h-[36px] items-center gap-2">
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
          options={userOptions}
          value={selectedUser}
          onChange={setSelectedUser}
          className="h-[36px] min-w-[120px]"
        />

        {/* Filter Button */}
        <button
          className="
            flex items-center h-[36px] gap-2
            bg-card border border-[var(--border-gray)] rounded-md
            px-3 text-sm shadow-sm
          "
        >
          <Filter className="h-4 w-4" />
          Filter
          <span className="ml-2 rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
            2
          </span>
        </button>
      </div>

      {/* Right section - View Switch + Action Buttons */}
      <div className="flex w-[422px] h-[36px] items-center gap-2">
        {/* List/Grid toggle */}
        <div className="flex items-center border border-[var(--border-gray)] rounded-md bg-[#F4F4F5]">
          <button className="p-2 border-r border-[var(--border-gray)] rounded-l-md hover:bg-muted">
            <List className="h-4 w-4" />
          </button>
          <button className="p-2 rounded-r-md hover:bg-muted">
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>

        {/* Export */}
        <Button >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>

        {/* Import */}
        <Button >
          <Upload className="h-4 w-4 mr-2" />
          Import
        </Button>

        {/* New Deal */}
        <Button className="whitespace-nowrap bg-black">
          <Plus className="text-[#FAFAFA] h-4 w-4 " />
         <span className="text-[#FAFAFA]"> New Deal</span> 
        </Button>
      </div>
    </div>
  )
}

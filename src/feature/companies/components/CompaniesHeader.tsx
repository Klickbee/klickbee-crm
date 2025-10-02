"use client"
import { Button } from "@/components/ui/Button"
import { DropDown } from "@/components/ui/DropDown"
import { Search, LayoutGrid, List, Download, Upload, Plus } from "lucide-react"
import { useState } from "react"
import { filterData, type FilterData } from "../libs/fillterData"
import Filter from "@/components/filter"
import CompanyModel from './CompaniesModel'


const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "follow-up", label: "Follow Up" },
  { value: "inactive", label: "Inactive" },
]
const searchableCategories: (keyof FilterData)[] = ["owner", "tags"];

export function CompaniesHeader() {
  const [selectedUser, setSelectedUser] = useState("all")
  const [filters, setFilters] = useState(filterData);
  const [showFilter, setShowFilter] = useState(false)

  const [searchQueries, setSearchQueries] = useState<Record<string, string>>({});
  const [showNewCompany, setShowNewCompany] = useState<boolean>(false);

  const handleToggle = (category: keyof FilterData, id: string) => {
    setFilters((prev) => ({
      ...prev,
      [category]: prev[category].map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      ),
    }));
  };


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
          options={statusOptions}
          value={selectedUser}
          onChange={setSelectedUser}
          className="h-[36px] min-w-[120px]"
        />

        {/* Filter Button */}
        <button
          className="
            flex items-center h-[36px] gap-2
            bg-card border border-[var(--border-gray)] rounded-md
            px-3 text-sm shadow-sm cursor-pointer
          "
          onClick={() => setShowFilter((prev: boolean) => !prev)}
        >
          <img src="\icons\filter.svg" alt="export-file" className="w-[17px] h-4 " />
          Filter
          <span className=" h-[20px]  w-[28px] text-var[(--foreground)]   bg-[#F4F4F5] rounded-md px-0.5 py-0.5 text-xs ">
            2
          </span>
        </button>
      </div>

      {/* Right section - View Switch + Action Buttons */}
      <div className="flex w-auto h-[36px] items-center gap-2">
        {/* Export */}
         <Button
          leadingIcon={<img src="\icons\File.svg" alt="export-file" className="w-[17px] h-4 " />}
        >
          Export
        </Button>

        {/* Import */}
        <Button
          leadingIcon={<img src="\icons\upload.svg" alt="upload" className="w-[17px] h-4 " />}
        >
          Import
        </Button>

        {/* New Deal */}
        <Button className="whitespace-nowrap bg-black" onClick={() => setShowNewCompany(true)}>
          <Plus className="text-[#FAFAFA] h-4 w-4 " />
          <span className="text-[#FAFAFA]">Add Company</span>
        </Button>
      </div>
      <CompanyModel open={showNewCompany} onClose={() => setShowNewCompany(false)} />
      
      {showFilter && <Filter filters={filters} handleToggle={handleToggle} showFilter={showFilter} setShowFilter={() => setShowFilter((prev: boolean) => !prev)} searchableCategories={searchableCategories} setSearchQueries={setSearchQueries} searchQueries={searchQueries} classes="w-[300px] bg-white" />}

    </div>
  )
}

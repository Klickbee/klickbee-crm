"use client"
import { Button } from "@/components/ui/Button"
import { DropDown } from "@/components/ui/DropDown"
import { Search, LayoutGrid, List, Download, Upload, Plus } from "lucide-react"
import { useState } from "react"
import Filter from "@/components/filter"
import { filterData, type FilterData } from "@/feature/deals/libs/filterData"
import DealModal from "./DealModal"


const userOptions = [{ value: "Closed", label: "Closed Time" }]

type DealsHeaderProps = {
  view: 'table' | 'grid';
  setView: (view: 'table' | 'grid') => void;
}
const searchableCategories: (keyof FilterData)[] = ["owner", "tags"];
export function DealsHeader({ view, setView }: DealsHeaderProps) {
  const [selectedUser, setSelectedUser] = useState("Closed")
  const [showFilter, setShowFilter] = useState(false)
  const [filters, setFilters] = useState(filterData);
  const [searchQueries, setSearchQueries] = useState<Record<string, string>>({});
  const [showNewDealer, setShowNewDealer] = useState<boolean>(false);

  // ✅ Toggle checkbox
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
            px-3 text-sm shadow-sm cursor-pointer
          "
          onClick={() => setShowFilter((prev: boolean) => !prev)}
        >
          <img src="\icons\filter.svg" alt="export-file" className="w-[17px] h-4 "/>
          Filter
          <span className=" h-[20px]  w-[28px] text-var[(--foreground)]   bg-[#F4F4F5] rounded-md px-0.5 py-0.5 text-xs ">
            2
          </span>
        </button>
      </div>

      {/* Right section - View Switch + Action Buttons */}
      <div className="flex w-[422px] h-[36px] items-center gap-2">
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

        {/* Export */}
        <Button
          leadingIcon={<img src="\icons\File.svg" alt="export-file" className="w-[17px] h-4 "/>} 
           >
          Export
        </Button>

        {/* Import */}
        <Button 
         leadingIcon={<img src="\icons\upload.svg" alt="upload" className="w-[17px] h-4 "/>} 
        >
         Import
        </Button>

        {/* New Deal */}
        <Button className="whitespace-nowrap bg-black" onClick={() => setShowNewDealer(true)}>
          <Plus className="text-[#FAFAFA] h-4 w-4 " />
         <span className="text-[#FAFAFA]"> New Deal</span> 
        </Button>
      </div>
      <DealModal open={showNewDealer} onClose={() => setShowNewDealer(false)} />
      {showFilter && <Filter filters={filters} handleToggle={handleToggle} showFilter={showFilter} setShowFilter={() => setShowFilter((prev: boolean) => !prev)} searchableCategories={searchableCategories} setSearchQueries={setSearchQueries} searchQueries={searchQueries} classes="w-[300px] bg-white" />}
    </div>
  )
}

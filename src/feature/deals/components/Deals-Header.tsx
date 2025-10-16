"use client"
import { Button } from "@/components/ui/Button"
import { CalendarDropDown } from "@/components/ui/CalendarDropDown"
import { DropDown } from "@/components/ui/DropDown"
import { Search, LayoutGrid, List, Download, Upload, Plus, ChevronDown } from "lucide-react"
import { useState, useEffect } from "react"
import Filter from "@/components/filter"
import { type FilterData } from "@/feature/deals/libs/filterData"
import DealModal from "./DealModal"
import { useSearchParams } from "next/navigation"
import { Deal } from '../types'
import { useDealStore } from "../stores/useDealStore"

type DealsHeaderProps = {
  view: 'table' | 'grid';
  setView: (view: 'table' | 'grid') => void;
  selectedDeals?: string[];
  selectedDealRows?: Deal[];
  onClearSelection?: () => void;
}
const searchableCategories: (keyof FilterData)[] = ["owner", "tags"];
export function DealsHeader({ view, setView, selectedDeals = [], selectedDealRows = [], onClearSelection }: DealsHeaderProps) {
  const [selectedUser, setSelectedUser] = useState("Closed")
  const [showFilter, setShowFilter] = useState(false)
  const { exportAllDeals, importDealsFromExcel, exportSelectedDeals, deleteDeal, filters, setFilters, applyFilters, setClosedDateFilter } = useDealStore();
  const [searchQueries, setSearchQueries] = useState<Record<string, string>>({});
  const [showNewDealer, setShowNewDealer] = useState<boolean>(false);
  const [editDeal, setEditDeal] = useState<Deal | null>(null);
  const [closedDate, setClosedDate] = useState<Date | null>(null);
  const searchParams = useSearchParams()
  
  // Export/Import via store (already destructured above)
  const [showActionDropdown, setShowActionDropdown] = useState(false);

  useEffect(() => {
    const newParam = searchParams.get("new")
    if (newParam === "deal") {
      setShowNewDealer(true)
    }
  }, [searchParams])

  const handleEditDeal = (deal: Deal) => {
    setEditDeal(deal);
    setShowNewDealer(true);
  };

  const handleCloseModal = () => {
    setShowNewDealer(false);
    setEditDeal(null);
  };

  const handleExportDeals = () => {
    exportAllDeals();
  };

  const handleImportDeals = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        importDealsFromExcel(file);
      }
    };
    input.click();
  };

  const handleBulkAction = (action: string) => {
    switch (action) {
      case 'export':
        if (selectedDeals.length > 0) {
          exportSelectedDeals(selectedDeals);
        }
        break;
      case 'delete':
        if (selectedDeals.length > 0 && confirm(`Are you sure you want to delete ${selectedDeals.length} deal(s)?`)) {
          selectedDeals.forEach(async (id) => {
            await deleteDeal(id);
          });
          onClearSelection?.();
        }
        break;
      case 'assign-owner':
        // TODO: Implement assign owner functionality
        console.log('Assign owner to selected deals:', selectedDeals);
        break;
      case 'change-stage':
        // TODO: Implement change stage functionality
        console.log('Change stage for selected deals:', selectedDeals);
        break;
    }
    setShowActionDropdown(false);
  };

  const actionOptions = [
    { value: 'assign-owner', label: 'Assign Owner' },
    { value: 'change-stage', label: 'Change Stage' },
    { value: 'export', label: 'Export' },
    { value: 'delete', label: 'Delete' },
  ];

  // ✅ Toggle checkbox
  const handleToggle = (category: keyof FilterData, id: string) => {
  const newFilters = { ...filters } as FilterData;
  newFilters[category] = newFilters[category].map((item) =>
    item.id === id ? { ...item, checked: !item.checked } : item
  );
  setFilters(newFilters);
  applyFilters();
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
        <CalendarDropDown
          value={closedDate}
          onChange={(date) => {
            setClosedDate(date);
            setClosedDateFilter(date);
          }}
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
            {filters.status.filter(s => s.checked && s.id !== "all").length +
             filters.owner.filter(o => o.checked && o.id !== "all" && o.id !== "me").length +
             filters.tags.filter(t => t.checked && t.id !== "all").length}
          </span>
        </button>
      </div>

      {/* Right section - View Switch + Action Buttons */}
      <div className="flex w-[422px] h-[36px] items-center gap-2">
        {/* Action Dropdown - Show when deals are selected */}
        {selectedDeals.length > 0 && (
          <div className="flex items-center gap-2 mr-2">
            <div className="relative">
              <Button
                onClick={() => setShowActionDropdown(!showActionDropdown)}
                className="flex items-center gap-1 h-[36px] px-3"
              >
                Action
                <ChevronDown className="h-4 w-4" />
              </Button>
              {showActionDropdown && (
                <div className="absolute top-full left-0 mt-1 z-20 bg-white border border-gray-200 rounded-md shadow-lg py-1 min-w-[150px]">
                  {actionOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleBulkAction(option.value)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
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
          onClick={handleExportDeals}
           >
          Export
        </Button>

        {/* Import */}
        <Button 
         leadingIcon={<img src="\icons\upload.svg" alt="upload" className="w-[17px] h-4 "/>}
         onClick={handleImportDeals}
        >
         Import
        </Button>

        {/* New Deal */}
        <Button className="whitespace-nowrap bg-black" onClick={() => setShowNewDealer(true)}>
          <Plus className="text-[#FAFAFA] h-4 w-4 " />
         <span className="text-[#FAFAFA]"> New Deal</span> 
        </Button>
      </div>
      <DealModal open={showNewDealer} onClose={handleCloseModal} mode={editDeal ? 'edit' : 'add'} deal={editDeal || undefined} />
      {showFilter && <Filter filters={filters} handleToggle={handleToggle} showFilter={showFilter} setShowFilter={() => setShowFilter((prev: boolean) => !prev)} searchableCategories={searchableCategories} setSearchQueries={setSearchQueries} searchQueries={searchQueries} classes="w-[300px] bg-white" />}
    </div>
  )
}

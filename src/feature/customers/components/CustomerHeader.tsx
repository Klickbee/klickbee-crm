"use client"
import Filter from "@/components/filter"
import { Button } from "@/components/ui/Button"
import { DropDown } from "@/components/ui/DropDown"
import { Search, LayoutGrid, List, Download, Upload, Plus, ChevronDown } from "lucide-react"
import { useEffect, useState } from "react"
import { filterData, type FilterData } from "../libs/fillterData"
import CustomerModal from "./CustomersModel"
import { useSearchParams } from "next/navigation"
import { Customer } from "../types/types"
import { useCustomersStore } from "../stores/useCustomersStore"


const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "follow-up", label: "Follow Up" },
  { value: "inactive", label: "Inactive" },
]
const searchableCategories: (keyof FilterData)[] = ["owner", "tags"];

interface CustomerHeaderProps {
  editCustomer?: Customer | null;
  showEditModal?: boolean;
  onEditCustomer?: (customer: Customer) => void;
  onCloseEditModal?: () => void;
  selectedCustomers?: string[];
  selectedCustomerRows?: Customer[];
  onClearSelection?: () => void;
}

export function CustomerHeader({ editCustomer, showEditModal, onEditCustomer, onCloseEditModal, selectedCustomers = [], selectedCustomerRows = [], onClearSelection }: CustomerHeaderProps = {}) {
  const [selectedUser, setSelectedUser] = useState("all")
  const [filters, setFilters] = useState(filterData);
  const [showFilter, setShowFilter] = useState(false)

  const [searchQueries, setSearchQueries] = useState<Record<string, string>>({});
  const [showNewCustomers, setShowNewCustomers] = useState<boolean>(false);
  const searchParams = useSearchParams()
  
  // Get export and import functions from store
  const { exportAllCustomers, importCustomersFromExcel, downloadImportTemplate, exportSelectedCustomers, deleteCustomer } = useCustomersStore();
  const [showActionDropdown, setShowActionDropdown] = useState(false);
      
       useEffect(() => {
          const newParam = searchParams.get("new")
          if (newParam === "contact") {
            setShowNewCustomers(true)
          }
        }, [searchParams])

  const handleCloseModal = () => {
    setShowNewCustomers(false);
    if (onCloseEditModal) {
      onCloseEditModal();
    }
  };

  const handleExportCustomers = () => {
    exportAllCustomers();
  };

  const handleImportCustomers = () => {
    // Create a file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        importCustomersFromExcel(file);
      }
    };
    input.click();
  };

  const handleToggle = (category: keyof FilterData, id: string) => {
    setFilters((prev) => ({
      ...prev,
      [category]: prev[category].map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      ),
    }));
  };

  const handleBulkAction = (action: string) => {
    switch (action) {
      case 'export':
        if (selectedCustomers.length > 0) {
          exportSelectedCustomers(selectedCustomers);
        }
        break;
      case 'delete':
        if (selectedCustomers.length > 0 && confirm(`Are you sure you want to delete ${selectedCustomers.length} customer(s)?`)) {
          selectedCustomers.forEach(async (id) => {
            await deleteCustomer(id);
          });
          onClearSelection?.();
        }
        break;
      case 'assign-owner':
        // TODO: Implement assign owner functionality
        console.log('Assign owner to selected customers:', selectedCustomers);
        break;
      case 'change-status':
        // TODO: Implement change status functionality
        console.log('Change status for selected customers:', selectedCustomers);
        break;
    }
    setShowActionDropdown(false);
  };

  const actionOptions = [
    { value: 'assign-owner', label: 'Assign Owner' },
    { value: 'change-status', label: 'Change Status' },
    { value: 'export', label: 'Export' },
    { value: 'delete', label: 'Delete' },
  ];

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
        {/* Action Dropdown - Show when customers are selected */}
        {selectedCustomers.length > 0 && (
          <div className="flex items-center gap-2 mr-2">
            <div className="relative">
              <Button
                onClick={() => setShowActionDropdown(!showActionDropdown)}
                className="flex items-center gap-1 h-[36px] px-3 ml-2"
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
        {/* Export */}
        <Button
          leadingIcon={<img src="\icons\File.svg" alt="export-file" className="w-[17px] h-4 " />}
          onClick={handleExportCustomers}
        >
          Export
        </Button>

        {/* Import */}
        <div className="relative">
          <Button
            leadingIcon={<img src="\icons\upload.svg" alt="upload" className="w-[17px] h-4 " />}
            onClick={handleImportCustomers}
          >
            Import
          </Button>
        </div>

        {/* New Customer */}
        <Button className="whitespace-nowrap bg-black"  onClick={() => setShowNewCustomers(true)}>
          <Plus className="text-[#FAFAFA] h-4 w-4 " />
          <span className="text-[#FAFAFA]">Add Customer</span>
        </Button>
      </div>
            <CustomerModal open={showNewCustomers || showEditModal || false} 
        onClose={handleCloseModal} mode={editCustomer ? 'edit' : 'add'} customer={editCustomer || undefined} />
      
      {showFilter && <Filter filters={filters} handleToggle={handleToggle} showFilter={showFilter} setShowFilter={() => setShowFilter((prev: boolean) => !prev)} searchableCategories={searchableCategories} setSearchQueries={setSearchQueries} searchQueries={searchQueries} classes="w-[300px] bg-white" />}

    </div>
  )
}

"use client"
import { Button } from "@/components/ui/Button"
import { DropDown } from "@/components/ui/DropDown"
import { Search, LayoutGrid, List, Download, Upload, Plus, ChevronDown } from "lucide-react"
import { useState } from "react"
import { filterData, type FilterData } from "../libs/fillterData"
import Filter from "@/components/filter"
import CompanyModel from './CompaniesModel'
import { Company } from "../types/types"
import { useCompaniesStore } from "../stores/useCompaniesStore"


const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "follow-up", label: "Follow Up" },
  { value: "inactive", label: "Inactive" },
]
const searchableCategories: (keyof FilterData)[] = ["owner", "tags"];

interface CompaniesHeaderProps {
  editCompany?: Company | null;
  showEditModal?: boolean;
  onEditCompany?: (company: Company) => void;
  onCloseEditModal?: () => void;
  selectedCompanies?: string[];
  selectedCompanyRows?: Company[];
  onClearSelection?: () => void;
}

export function CompaniesHeader({ editCompany, showEditModal, onEditCompany, onCloseEditModal, selectedCompanies = [], selectedCompanyRows = [], onClearSelection }: CompaniesHeaderProps = {}) {
  // Get export, import, and filter functions from store FIRST
  const { exportAllCompanies, importCompaniesFromExcel, downloadImportTemplate, exportSelectedCompanies, deleteCompany, filters, setFilters, applyFilters, resetFilters } = useCompaniesStore();
  // Derive selected status from store filters
  const getSelectedStatus = () => {
    const selected = filters.status.filter((s: any) => s.checked && s.id !== 'all');
    return selected.length === 1 ? selected[0].id : 'all';
  };
  const [selectedUser, setSelectedUser] = useState<string>(getSelectedStatus());
  const [showFilter, setShowFilter] = useState(false)

  const [searchQueries, setSearchQueries] = useState<Record<string, string>>({});
  const [showNewCompany, setShowNewCompany] = useState<boolean>(false);
  const [showActionDropdown, setShowActionDropdown] = useState(false);

  const handleCloseModal = () => {
    setShowNewCompany(false);
    if (onCloseEditModal) {
      onCloseEditModal();
    }
  };

  const handleExportCompanies = () => {
    exportAllCompanies();
  };

  const handleImportCompanies = () => {
    // Create a file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        importCompaniesFromExcel(file);
      }
    };
    input.click();
  };

  const handleToggle = (category: keyof FilterData, id: string) => {
    const newFilters = { ...filters };
    newFilters[category] = newFilters[category].map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setFilters(newFilters);
    applyFilters(); // Apply filters immediately after toggle
  };

  const handleBulkAction = (action: string) => {
    switch (action) {
      case 'export':
        if (selectedCompanies.length > 0) {
          exportSelectedCompanies(selectedCompanies);
        }
        break;
      case 'delete':
        if (selectedCompanies.length > 0 && confirm(`Are you sure you want to delete ${selectedCompanies.length} company(s)?`)) {
          selectedCompanies.forEach(async (id) => {
            await deleteCompany(id);
          });
          onClearSelection?.();
        }
        break;
      case 'assign-owner':
        // TODO: Implement assign owner functionality
        console.log('Assign owner to selected companies:', selectedCompanies);
        break;
      case 'change-status':
        // TODO: Implement change status functionality
        console.log('Change status for selected companies:', selectedCompanies);
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
          value={getSelectedStatus()}
          onChange={(val: string) => {
            // Update store filters so only the selected status (or all) is active
            const newFilters = { ...filters } as any;
            newFilters.status = newFilters.status.map((s: any) => {
              if (val === 'all') return { ...s, checked: s.id === 'all' };
              if (s.id === 'all') return { ...s, checked: false };
              return { ...s, checked: s.id === val };
            });
            setFilters(newFilters);
            applyFilters();
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
          <img src="\icons\filter.svg" alt="export-file" className="w-[17px] h-4 " />
          Filter
          <span className=" h-[20px]  w-[28px] text-var[(--foreground)]   bg-[#F4F4F5] rounded-md px-0.5 py-0.5 text-xs ">
            {filters.status.filter(s => s.checked && s.id !== "all").length +
             filters.owner.filter(o => o.checked && o.id !== "all" && o.id !== "me").length +
             filters.tags.filter(t => t.checked && t.id !== "all").length}
          </span>
        </button>
      </div>

      {/* Right section - View Switch + Action Buttons */}
      <div className="flex w-auto h-[36px] items-center gap-2">
        {/* Action Dropdown - Show when companies are selected */}
        {selectedCompanies.length > 0 && (
          <div className="flex items-center gap-2">
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
          onClick={handleExportCompanies}
        >
          Export
        </Button>

        {/* Import */}
        <div className="relative">
          <Button
            leadingIcon={<img src="\icons\upload.svg" alt="upload" className="w-[17px] h-4 " />}
            onClick={handleImportCompanies}
          >
            Import
          </Button>
        </div>

        {/* New Deal */}
        <Button className="whitespace-nowrap bg-black" onClick={() => setShowNewCompany(true)}>
          <Plus className="text-[#FAFAFA] h-4 w-4 " />
          <span className="text-[#FAFAFA]">Add Company</span>
        </Button>
      </div>
      <CompanyModel open={showNewCompany || showEditModal || false} 
        onClose={handleCloseModal} mode={editCompany ? 'edit' : 'add'} company={editCompany || undefined} />
      
      {showFilter && <Filter filters={filters} handleToggle={handleToggle} showFilter={showFilter} setShowFilter={() => setShowFilter((prev: boolean) => !prev)} searchableCategories={searchableCategories} setSearchQueries={setSearchQueries} searchQueries={searchQueries} classes="w-[300px] bg-white" />}

    </div>
  )
}

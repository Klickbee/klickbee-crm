"use client"
  import { Button } from "@/components/ui/Button"
import { DropDown } from "@/components/ui/DropDown"
import { Search, LayoutGrid, List, Plus, ChevronDown } from "lucide-react"
import { useEffect, useState } from "react"
import TodoModel from "./TodoModel"
import { useSearchParams } from "next/navigation"
import { CalendarDropDown } from "@/components/ui/CalendarDropDown"
import { TaskData } from "../types/types"
import { useTodoStore } from "../stores/useTodoStore"

// Filter options aligned to store filter ids
const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "Todo", label: "To-Do" },
  { value: "InProgress", label: "In-Progress" },
  { value: "OnHold", label: "On-Hold" },
  { value: "Done", label: "Done" },
]

const priorityOptions = [
  { value: "all", label: "All Priority" },
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" },
  { value: "Urgent", label: "Urgent" },
]

type TodoHeaderProps = {
  view: 'table' | 'grid';
  setView: (view: 'table' | 'grid') => void;
  selectedTodos?: string[];
  selectedTodoRows?: TaskData[];
  onClearSelection?: () => void;
  isDeleting?: boolean;
  isEditing?: boolean;
  isExporting?: boolean;
  setIsDeleting?: (value: boolean) => void;
  setIsEditing?: (value: boolean) => void;
  setIsExporting?: (value: boolean) => void;
}

export function TodoHeader({ view, setView, selectedTodos = [], selectedTodoRows = [], onClearSelection, isDeleting = false, isEditing = false, isExporting = false, setIsDeleting, setIsEditing, setIsExporting }: TodoHeaderProps) {
  const { filters, setFilters, applyFilters } = useTodoStore();
  // Derive owner options from store filters
  const ownerOptions = filters.owner.map(o => ({ value: o.id, label: o.label }));
  // Selected values derived from store
  const getSelectedStatus = () => {
    const selected = filters.status.filter(s => s.checked && s.id !== 'all');
    return selected.length === 1 ? selected[0].id : 'all';
  };
  const getSelectedPriority = () => {
    const selected = filters.priority.filter(p => p.checked && p.id !== 'all');
    return selected.length === 1 ? selected[0].id : 'all';
  };
  const getSelectedOwner = () => {
    const selected = filters.owner.filter(o => o.checked && o.id !== 'all');
    return selected.length === 1 ? selected[0].id : 'all';
  };
  const [statusOptionsUser, setstatusOptionsUser] = useState<string>(getSelectedStatus())
  const [ownerOptionsUser, setownerOptionsUser] = useState<string>(getSelectedOwner())
  const [priorityOptionsUser, setpriorityOptionsUser] = useState<string>(getSelectedPriority())
    const [showNewTask, setShowNewTask] = useState<boolean>(false);
      const searchParams = useSearchParams()
      // Date filter state
      const [dueDate, setDueDate] = useState<Date | null>(new Date())
      const dateLabel = dueDate
        ? new Intl.DateTimeFormat('en-US', { month: 'long', day: '2-digit', year: 'numeric' }).format(dueDate)
        : 'Select date'
      const [editTask, setEditTask] = useState<TaskData | null>(null);
  
  // Get bulk operations from store
  const { bulkDeleteTodos, bulkUpdateTodos } = useTodoStore();
  const [showActionDropdown, setShowActionDropdown] = useState(false);
    
     useEffect(() => {
        const newParam = searchParams.get("new")
        if (newParam === "task") {
          setShowNewTask(true)
        }
      }, [searchParams])
    const handleEditTask = (Task: TaskData) => {
        setEditTask(Task);
        setShowNewTask(true);
      };
    
      const handleCloseModal = () => {
        setShowNewTask(false);
        setEditTask(null);
      };

  const handleBulkAction = async (action: string) => {
    switch (action) {
      case 'delete':
        if (selectedTodos.length > 0 && confirm(`Are you sure you want to delete ${selectedTodos.length} task(s)?`)) {
          setIsDeleting?.(true);
          try {
            await bulkDeleteTodos(selectedTodos);
            onClearSelection?.();
          } finally {
            setIsDeleting?.(false);
          }
        }
        break;
      case 'mark-done':
        if (selectedTodos.length > 0) {
          setIsEditing?.(true);
          try {
            await bulkUpdateTodos(selectedTodos, { status: 'Done' });
            onClearSelection?.();
          } finally {
            setIsEditing?.(false);
          }
        }
        break;
      case 'mark-in-progress':
        if (selectedTodos.length > 0) {
          setIsEditing?.(true);
          try {
            await bulkUpdateTodos(selectedTodos, { status: 'InProgress' });
            onClearSelection?.();
          } finally {
            setIsEditing?.(false);
          }
        }
        break;
      case 'assign-to-me':
        // TODO: Implement assign to me functionality
        console.log('Assign to me for selected todos:', selectedTodos);
        break;
    }
    setShowActionDropdown(false);
  };

  const actionOptions = [
    { value: 'mark-done', label: 'Mark as Done' },
    { value: 'mark-in-progress', label: 'Mark as In Progress' },
    { value: 'assign-to-me', label: 'Assign to Me' },
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
          value={getSelectedStatus()}
          onChange={(val: string) => {
            const newFilters = { ...filters } as any;
            newFilters.status = newFilters.status.map((s: any) => {
              if (val === 'all') return { ...s, checked: s.id === 'all' };
              if (s.id === 'all') return { ...s, checked: false };
              return { ...s, checked: s.id === val };
            });
            setFilters(newFilters);
            applyFilters();
          }}
          className="h-[36px] w-auto"
        />
        <DropDown
          options={ownerOptions}
          value={getSelectedOwner()}
          onChange={(val: string) => {
            const newFilters = { ...filters } as any;
            newFilters.owner = newFilters.owner.map((o: any) => {
              if (val === 'all') return { ...o, checked: o.id === 'all' };
              if (o.id === 'all') return { ...o, checked: false };
              return { ...o, checked: o.id === val };
            });
            setFilters(newFilters);
            applyFilters();
          }}
          className="h-[36px] w-auto "
        />
        <DropDown
          options={priorityOptions}
          value={getSelectedPriority()}
          onChange={(val: string) => {
            const newFilters = { ...filters } as any;
            newFilters.priority = newFilters.priority.map((p: any) => {
              if (val === 'all') return { ...p, checked: p.id === 'all' };
              if (p.id === 'all') return { ...p, checked: false };
              return { ...p, checked: p.id === val };
            });
            setFilters(newFilters);
            applyFilters();
          }}
          className="h-[36px] w-auto "
        />
        <CalendarDropDown
          className="h-[36px]"
          label={dateLabel}
          value={dueDate}
          onChange={(d) => setDueDate(d)}
          triggerIcon="calendar"
        />

      </div>

      {/* Right section - View Switch + Action Buttons */}
      <div className="flex w-[208px] ml-7 h-[36px] items-center gap-2">
        {/* Action Dropdown - Show when todos are selected */}
        {selectedTodos.length > 0 && (
          <div className="flex items-center gap-2">
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




        {/* New Task */}
        <Button className="whitespace-nowrap bg-black" onClick={() => setShowNewTask(true)}>
          <Plus className="text-[#FAFAFA] h-4 w-4 " />
          <span className="text-[#FAFAFA]"> New Task</span>
        </Button>
      </div>
      <TodoModel open={showNewTask} onClose={handleCloseModal} mode={editTask ? 'edit' : 'add'} task={editTask || undefined} />
    </div>
  )
}

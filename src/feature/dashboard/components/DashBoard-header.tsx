// "use client"
// import { ChevronDown, Plus } from "lucide-react"
// import { DropDown } from "../../../components/ui/DropDown"
// import { useState } from "react"

// const userOptions = [
//   { value: "all", label: "All Users" },
//   { value: "active", label: "Active Users" },
//   { value: "inactive", label: "Inactive Users" },
// ]

// const statusOptions = [
//   { value: "all", label: "All Status" },
//   { value: "new", label: "New" },
//   { value: "in-progress", label: "In Progress" },
//   { value: "completed", label: "Completed" },
// ]

// const timePeriodOptions = [
//   { value: "today", label: "Today" },
//   { value: "this-week", label: "This Week" },
//   { value: "this-month", label: "This Month" },
//   { value: "this-year", label: "This Years" },
// ]

// export function DashboardHeader() {
//   const [selectedUser, setSelectedUser] = useState("all")
//   const [selectedStatus, setSelectedStatus] = useState("all")
//   const [selectedTimePeriod, setSelectedTimePeriod] = useState("this-month")

//   return (
//     <header >
//       <div className="flex items-center justify-between h-9">
//         <div className="flex items-center gap-2 w-[556px] h-9">
//           <DropDown
//             options={timePeriodOptions}
//             value={selectedTimePeriod}
//             onChange={setSelectedTimePeriod}

//           />

//           <DropDown options={userOptions} value={selectedUser} onChange={setSelectedUser} />
//           <DropDown options={statusOptions} value={selectedStatus} onChange={setSelectedStatus} />

//         </div>
//         <div className="flex min-w-[155px] h-9 border border-[var(--border-gray)] rounded-lg bg-white shadow-sm">
//           <button className="flex items-center gap-1.5 justify-center px-4 hover:bg-gray-50 transition-colors whitespace-nowrap">
//             <Plus size={16} className="text-[var(--foreground)]" />
//             <span className="text-sm text-[var(--foreground)] tracking-[0%]">New Deal</span>
//           </button>

//           <div className="w-px h-full bg-gray-300"></div>

//           <button className="px-3 hover:bg-gray-50 rounded-r-lg transition-colors">
//             <img src="\icons\Down-Arrow.svg" alt="" className="w-[16px] h-[17px]" />
//           </button>
//         </div>



//       </div>
//     </header>
//   )
// }
"use client"
import { Plus } from "lucide-react"
import { DropDown } from "../../../components/ui/DropDown"
import { useState, useRef, useEffect } from "react"

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

export function DashboardHeader() {
  const [selectedUser, setSelectedUser] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedTimePeriod, setSelectedTimePeriod] = useState("this-month")

  // state for arrow dropdown
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <header>
      <div className="flex items-center justify-between h-9">
        <div className="flex items-center gap-2 w-[556px] h-9">
          <DropDown
            options={timePeriodOptions}
            value={selectedTimePeriod}
            onChange={setSelectedTimePeriod}
          />
          <DropDown options={userOptions} value={selectedUser} onChange={setSelectedUser} />
          <DropDown options={statusOptions} value={selectedStatus} onChange={setSelectedStatus} />
        </div>

        {/* New Deal + Arrow */}
        <div className="relative flex min-w-[155px] h-9 border border-[var(--border-gray)] rounded-lg bg-white shadow-sm" ref={menuRef}>
          <button className="flex items-center gap-1.5 justify-center px-4 hover:bg-gray-50 transition-colors whitespace-nowrap">
            <Plus size={16} className="text-[var(--foreground)]" />
            <span className="text-sm text-[var(--foreground)] tracking-[0%]">New Deal</span>
          </button>

          <div className="w-px h-full bg-gray-300"></div>

          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="px-3 hover:bg-gray-50 rounded-r-lg transition-colors"
          >
            <img src="/icons/Down-Arrow.svg" alt="" className="w-[16px] h-[17px]" />
          </button>

          {/* Dropdown menu */}
          {menuOpen && (
            <div className="absolute w-[224px] right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-md z-20">
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                New Task
              </button>
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                New Meeting
              </button>
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                New Contact
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

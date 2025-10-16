"use client"

import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import React, { useEffect, useMemo, useRef, useState } from "react"

type CalendarDropDownProps = {
  label?: string
  value?: Date | null
  onChange?: (date: Date) => void
  className?: string
  disabled?: boolean
  triggerIcon?: 'calendar' | 'chevron'
  buttonClassName?: string
}

const monthNamesShort = [
  "Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"
]

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay() // 0=Sun
}

export const CalendarDropDown: React.FC<CalendarDropDownProps> = ({
  label = "Closed Time",
  value = null,
  onChange,
  className = "",
  disabled = false,
  triggerIcon = 'chevron',
  buttonClassName = "",
}) => {
  // Inline custom select to avoid native <select> overflow issues
  const InlineSelect: React.FC<{
    value: string | number
    onChange: (v: any) => void
    options: { label: string; value: string | number }[]
    className?: string
    buttonClassName?: string
    listWidth?: number | string
  }> = ({ value, onChange, options, className = "", buttonClassName = "", listWidth = "auto" }) => {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement | null>(null)
    useEffect(() => {
      function handler(e: MouseEvent) {
        if (!ref.current) return
        if (e.target instanceof Node && !ref.current.contains(e.target)) setOpen(false)
      }
      document.addEventListener("mousedown", handler)
      return () => document.removeEventListener("mousedown", handler)
    }, [])

    const current = options.find(o => String(o.value) === String(value))
    return (
      <div ref={ref} className={`relative ${className}`}>
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          className={`border  shadow-sm border-[var(--border-gray)] rounded px-2 pr-1 py-1 text-sm w-full flex items-center gap-1 ${buttonClassName}`}
        >
          {current ? current.label : value}
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </button>
        {open && (
          <div
            className="absolute z-40 mt-1 bg-white border border-[var(--border-gray)] rounded shadow-md max-h-48 overflow-auto"
            style={{ width: listWidth }}
          >
            <ul className="py-1 text-sm">
              {options.map(opt => (
                <li key={String(opt.value)}>
                  <button
                    type="button"
                    className={`w-full text-left px-2 py-1 hover:bg-gray-100 ${String(opt.value) === String(value) ? 'bg-gray-50' : ''}`}
                    onClick={() => { onChange(opt.value); setOpen(false) }}
                  >
                    {opt.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }

  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const today = useMemo(() => new Date(), [])
  const initial = value ?? today
  const [viewYear, setViewYear] = useState<number>(initial.getFullYear())
  const [viewMonth, setViewMonth] = useState<number>(initial.getMonth())

  useEffect(() => {
    function onDocumentClick(e: MouseEvent) {
      if (!containerRef.current) return
      if (e.target instanceof Node && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", onDocumentClick)
    return () => document.removeEventListener("mousedown", onDocumentClick)
  }, [])

  // Keep calendar view synced with selected value when it changes
  useEffect(() => {
    if (value) {
      setViewYear(value.getFullYear())
      setViewMonth(value.getMonth())
    }
  }, [value])

  // When opening, jump to the selected value (or today if none)
  useEffect(() => {
    if (isOpen) {
      const ref = value ?? today
      setViewYear(ref.getFullYear())
      setViewMonth(ref.getMonth())
    }
  }, [isOpen])

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth)

  type Cell = { date: Date; inCurrent: boolean }
  const weeks: Cell[][] = []

  const prevMonth = (viewMonth + 11) % 12
  const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear
  const nextMonth = (viewMonth + 1) % 12
  const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear

  const prevMonthDays = getDaysInMonth(prevYear, prevMonth)
  const leading = firstDay // 0=Sun

  // Build a fixed 5-row (35 cells) grid
  const TOTAL_CELLS = 35
  const cells: Cell[] = []

  // 1) Leading cells from previous month
  for (let i = 0; i < leading; i++) {
    const day = prevMonthDays - leading + i + 1
    cells.push({ date: new Date(prevYear, prevMonth, day), inCurrent: false })
  }

  // 2) Current month cells (clip if month overflows 35 cells)
  const currentLimit = Math.max(0, Math.min(daysInMonth, TOTAL_CELLS - cells.length))
  for (let d = 1; d <= currentLimit; d++) {
    cells.push({ date: new Date(viewYear, viewMonth, d), inCurrent: true })
  }

  // 3) Trailing cells from next month to fill up to 35
  let nextCounter = 1
  while (cells.length < TOTAL_CELLS) {
    cells.push({ date: new Date(nextYear, nextMonth, nextCounter++), inCurrent: false })
  }

  // Chunk into 5 weeks
  for (let w = 0; w < TOTAL_CELLS; w += 7) {
    weeks.push(cells.slice(w, w + 7))
  }

  const years = Array.from({ length: 15 }, (_, i) => today.getFullYear() - 7 + i)

  const isSameDate = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

  return (
    <div ref={containerRef} className={`relative  w-fit ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(v => !v)}
        className={`bg-white border border-[var(--border-gray)] rounded-md h-9 py-2 pl-3 pr-9 text-left leading-[20px] text-sm text-gray-900 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${buttonClassName}`}
      >
        {value ? value.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }) : label}
        {triggerIcon === 'calendar' ? (
          <Calendar className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        )}
      </button>

      {isOpen && (
        <div className="absolute z-30 mt-1 rounded-md border border-[var(--border-gray)] bg-white shadow-md p-2">
          {/* Header */}
          <div className="flex items-center gap-3 justify-between px-2 py-1">
            <button
              className="p-1 hover:bg-gray-100 rounded"
              onClick={() => {
                setViewMonth(m => {
                  const nm = m - 1
                  if (nm < 0) {
                    setViewYear(y => y - 1)
                    return 11
                  }
                  return nm
                })
              }}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <InlineSelect
                value={viewMonth}
                onChange={(v) => setViewMonth(Number(v))}
                options={monthNamesShort.map((m, i) => ({ label: m, value: i }))}
                listWidth={120}
              />
              <InlineSelect
                value={viewYear}
                onChange={(v) => setViewYear(Number(v))}
                options={years.map(y => ({ label: String(y), value: y }))}
                listWidth={100}
              />
            </div>

            <button
              className="p-1 hover:bg-gray-100 rounded"
              onClick={() => {
                setViewMonth(m => {
                  const nm = m + 1
                  if (nm > 11) {
                    setViewYear(y => y + 1)
                    return 0
                  }
                  return nm
                })
              }}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday headings */}
          <div className="grid grid-cols-7 text-xs text-gray-500 px-2 pb-1">
            {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
              <div key={d} className="text-center py-1">{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1 px-2 pb-2">
            {weeks.flat().map((cell, idx) => {
              const dateObj = cell.date
              const selected = value ? isSameDate(dateObj, value) : false
              const isToday = isSameDate(dateObj, today)
              const muted = !cell.inCurrent

              return (
                <button
                  key={idx}
                  onClick={() => {
                    onChange?.(dateObj)
                    setIsOpen(false)
                  }}
                  className={`h-8 rounded text-sm hover:bg-gray-100 ${muted ? 'text-gray-400' : ''} ${selected ? 'bg-black text-white hover:bg-black' : ''} ${isToday && !selected ? 'border border-gray-300' : ''}`}
                >
                  {dateObj.getDate()}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default CalendarDropDown

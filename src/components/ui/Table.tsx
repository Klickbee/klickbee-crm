"use client"

import React, { useState } from 'react'
import { ChevronUp, ChevronDown, MoreHorizontal } from 'lucide-react'

export interface TableColumn<T = any> {
  key: string
  title: string
  dataIndex: string
  sortable?: boolean
  width?: string
  render?: (value: any, record: T, index: number) => React.ReactNode
}

export interface TableProps<T = any> {
  columns: TableColumn<T>[]
  data: T[]
  rowKey?: string
  selectable?: boolean
  onSelectionChange?: (selectedKeys: string[], selectedRows: T[]) => void
  className?: string
  loading?: boolean
  emptyText?: string
}

export interface TableRowProps<T = any> {
  record: T
  columns: TableColumn<T>[]
  index: number
  selected?: boolean
  onSelect?: (checked: boolean) => void
  selectable?: boolean
}

// Badge component for stage indicators
const Badge: React.FC<{ 
  children: React.ReactNode
  variant: 'new' | 'contacted' | 'proposal' | 'won' | 'lost'
}> = ({ children, variant }) => {
  const variantClasses = {
    new: 'bg-blue-100 text-blue-800',
    contacted: 'bg-purple-100 text-purple-800',
    proposal: 'bg-orange-100 text-orange-800',
    won: 'bg-green-100 text-green-800',
    lost: 'bg-red-100 text-red-800'
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]}`}>
      {children}
    </span>
  )
}

// Table Row Component
const TableRow = <T,>({ 
  record, 
  columns, 
  index, 
  selected = false, 
  onSelect, 
  selectable = false 
}: TableRowProps<T>) => {
  return (
    <tr className={`border-b border-[var(--border-gray)] hover:bg-gray-50`}>
      {selectable && (
        <td className="px-4 py-3">
          <div className="relative">
            <input
              type="checkbox"
              checked={selected}
              onChange={(e) => onSelect?.(e.target.checked)}
              className={`h-4 w-4 rounded focus:ring-black appearance-none border-2 ${selected ? 'bg-black border-black' : 'bg-white border-gray-300'}`}
            />
            {selected && (
              <div className="absolute top-0.5 left-0 w-4 h-4 flex items-center justify-center pointer-events-none">
                <svg className="h-3.5 w-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        </td>
      )}
      {columns.map((column) => (
        <td 
          key={column.key} 
          className="px-4 py-3 text-sm text-gray-900"
          style={{ width: column.width }}
        >
          {column.render ? column.render(record[column.dataIndex as keyof T], record, index) : String(record[column.dataIndex as keyof T] ?? '')}
        </td>
      ))}
      <td className="px-4 py-3 sticky right-0 bg-white border-l border-gray-200 z-10" style={{ width: '48px' }}>
        <div className="flex items-center justify-center">
          <button className="p-1 hover:bg-gray-200 rounded">
            <MoreHorizontal className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      </td>
    </tr>
  )
}

// Main Table Component
export const Table = <T,>({
  columns,
  data,
  rowKey = 'id',
  selectable = false,
  onSelectionChange,
  className = '',
  loading = false,
  emptyText = 'No data available'
}: TableProps<T>) => {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)
  const [selectedKeys, setSelectedKeys] = useState<string[]>([])

  // Handle sorting
  const handleSort = (column: TableColumn<T>) => {
    if (!column.sortable) return

    const newDirection = sortConfig?.key === column.key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    setSortConfig({ key: column.key, direction: newDirection })
  }

  // Handle row selection
  const handleRowSelect = (key: string, checked: boolean) => {
    const newSelectedKeys = checked 
      ? [...selectedKeys, key]
      : selectedKeys.filter(k => k !== key)
    
    setSelectedKeys(newSelectedKeys)
    
    const selectedRows = data.filter((item: any) => newSelectedKeys.includes(item[rowKey]))
    onSelectionChange?.(newSelectedKeys, selectedRows)
  }

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allKeys = data.map((item: any) => item[rowKey])
      setSelectedKeys(allKeys)
      onSelectionChange?.(allKeys, data)
    } else {
      setSelectedKeys([])
      onSelectionChange?.([], [])
    }
  }

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortConfig) return data

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof T]
      const bValue = b[sortConfig.key as keyof T]

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
  }, [data, sortConfig])

  const allSelected = data.length > 0 && selectedKeys.length === data.length
  const someSelected = selectedKeys.length > 0 && selectedKeys.length < data.length
  const noneSelected = selectedKeys.length === 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className={`bg-white shadow-sm rounded-lg border border-[var(--border-gray)] ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[var(--border-gray)]">
          <thead className="">
            <tr>
              {selectable && (
                <th className="px-4 py-3 text-left">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(input) => {
                        if (input) input.indeterminate = false // Hide minus/indeterminate state
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className={`h-4 w-4 rounded focus:ring-black appearance-none border-2 ${allSelected ? 'bg-black border-black' : 'bg-white border-gray-300'}`}
                    />
                    {allSelected && (
                      <div className="absolute top-0.5 left-0 w-4 h-4 flex items-center justify-center pointer-events-none">
                        <svg className="h-3.5 w-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  style={{
                    fontFamily: 'Inter',
                    fontWeight: 500,
                    fontSize: '14px',
                    lineHeight: '20px',
                    letterSpacing: '0%',
                    width: column.width
                  }}
                  onClick={() => handleSort(column)}
                >
                  <div className="flex items-center gap-1">
                    {column.title}
                    {column.sortable && (
                      <div className="flex flex-col">
                        <ChevronUp 
                          className={`h-3 w-3 ${
                            sortConfig?.key === column.key && sortConfig.direction === 'asc' 
                              ? 'text-blue-600' 
                              : 'text-gray-400'
                          }`} 
                        />
                        <ChevronDown 
                          className={`h-3 w-3 -mt-1 ${
                            sortConfig?.key === column.key && sortConfig.direction === 'desc' 
                              ? 'text-blue-600' 
                              : 'text-gray-400'
                          }`} 
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
              <th 
                className="px-4 py-3 sticky right-0 bg-white border-l border-gray-200 z-10"
                style={{ width: '48px' }}
              >
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-[var(--border-gray)]">
            {sortedData.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length + (selectable ? 2 : 1)} 
                  className="px-4 py-8 text-center text-gray-500"
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              sortedData.map((record: any, index) => (
                <TableRow
                  key={record[rowKey]}
                  record={record}
                  columns={columns}
                  index={index}
                  selected={selectedKeys.includes(record[rowKey])}
                  onSelect={(checked) => handleRowSelect(record[rowKey], checked)}
                  selectable={selectable}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Export Badge component for external use
export { Badge }

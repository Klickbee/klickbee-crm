"use client"

import * as React from "react"
import { cn } from "@/libs/utils"

type KeyGetter<T> = (item: T) => string
type AmountGetter<T> = (item: T) => number

export type GridViewProps<T extends Record<string, any>> = {
  // Items to render in the grid
  items: T[]
  // Function to group items into columns (e.g., item => item.stage)
  groupBy?: KeyGetter<T>
  // String key to group by (e.g., "stage"). If both groupBy and groupKey are omitted, falls back to "stage" if it exists on the item.
  groupKey?: string
  // Optional explicit order of columns (keys). If omitted, columns are alphabetical by key.
  order?: string[]
  // Optional mapping of column keys to display labels
  labels?: Record<string, string>
  // How to render each card
  renderCard: (item: T) => React.ReactNode
  // Optional getter to compute totals per column (e.g., item => item.amount)
  getAmount?: AmountGetter<T>
  // Provide a unique id accessor. Defaults to "id" if present or index fallback.
  getId?: (item: T, index: number) => string | number
  // Optional header right-side actions per column (e.g., a + button)
  renderColumnAction?: (groupKey: string, items: T[]) => React.ReactNode
  // Optional per-column header classNames to slightly vary appearance if desired
  columnHeaderClassName?: (groupKey: string) => string | undefined
  // Optional per-column dot className (color of the small status dot in header)
  columnDotClassName?: (groupKey: string) => string | undefined
  // Optional empty state per-column
  renderEmpty?: (groupKey: string) => React.ReactNode
  className?: string
  // Enable built-in HTML5 drag & drop between columns
  enableDnd?: boolean
  // Called when an item is dropped into a different column
  onItemMove?: (args: { itemId: string | number; fromKey: string; toKey: string }) => void
}

/**
 * GridView
 * - Groups items by groupBy(item) into columns.
 * - Derives headings from grouped keys.
 * - Shows counts and optional total using getAmount.
 * - Renders each item via renderCard.
 * - Mobile-first: columns are horizontally scrollable.
 */
export function GridView<T extends Record<string, any>>(props: GridViewProps<T>) {
  const {
    items,
    groupBy,
    groupKey,
    order,
    labels,
    renderCard,
    getAmount,
    getId,
    renderColumnAction,
    columnHeaderClassName,
    columnDotClassName,
    renderEmpty,
    className,
  } = props

  // Unified getter to obtain grouping key via groupBy, groupKey, or fallback to "stage"
  const getGroupKey = React.useCallback(
    (item: T) => {
      if (groupBy) return groupBy(item)
      if (groupKey && item && Object.prototype.hasOwnProperty.call(item, groupKey)) {
        const v = item[groupKey as keyof T]
        return v == null ? "Ungrouped" : String(v as any)
      }
      if ("stage" in item) return String((item as any).stage)
      return "Ungrouped"
    },
    [groupBy, groupKey],
  )

  // Group items by key
  const groups = React.useMemo(() => {
    const map = new Map<string, T[]>()
    for (const item of items) {
      const key = getGroupKey(item)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(item)
    }
    return map
  }, [items, getGroupKey])

  // Determine column keys (ordered)
  const keys = React.useMemo(() => {
    const existingKeys = Array.from(groups.keys())
    if (order && order.length) {
      // Always include provided order (even if group has zero items)
      const ordered = order.slice()
      const extras = existingKeys.filter((k) => !order.includes(k)).sort()
      return [...ordered, ...extras]
    }
    return existingKeys.sort()
  }, [groups, order])

  // Column totals
  const totals = React.useMemo(() => {
    if (!getAmount) return {}
    const agg: Record<string, number> = {}
    for (const key of keys) {
      const arr = groups.get(key) ?? []
      agg[key] = arr.reduce((sum, item) => sum + (getAmount(item) || 0), 0)
    }
    return agg
  }, [keys, groups, getAmount])

  const formatCurrency = React.useCallback((value: number) => {
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
      }).format(value)
    } catch {
      return `${value}`
    }
  }, [])

  const getItemId = React.useCallback(
    (item: T, index: number) => {
      if (getId) return getId(item, index)
      if ("id" in item) return String(item.id)
      return index
    },
    [getId],
  )

  // Track dragging state for simple styling (optional)
  const [draggingItemId, setDraggingItemId] = React.useState<string | number | null>(null)
  const dragPreviewRef = React.useRef<HTMLElement | null>(null)
  const dragMoveHandlerRef = React.useRef<((ev: DragEvent) => void) | null>(null)
  const dragOffsetRef = React.useRef<{ x: number; y: number }>({ x: 12, y: 12 })

  const cleanupDragArtifacts = React.useCallback(() => {
    if (dragPreviewRef.current && dragPreviewRef.current.parentElement) {
      dragPreviewRef.current.parentElement.removeChild(dragPreviewRef.current)
    }
    dragPreviewRef.current = null
    if (dragMoveHandlerRef.current) {
      document.removeEventListener("dragover", dragMoveHandlerRef.current)
      dragMoveHandlerRef.current = null
    }
    setDraggingItemId(null)
  }, [])

  const createFullOpacityPreview = React.useCallback((sourceEl: HTMLElement) => {
    try {
      const rect = sourceEl.getBoundingClientRect()
      const clone = sourceEl.cloneNode(true) as HTMLElement
      clone.style.position = "fixed"
      // Start offscreen until first dragover positions it
      clone.style.top = "-10000px"
      clone.style.left = "-10000px"
      clone.style.opacity = "1"
      clone.style.pointerEvents = "none"
      clone.style.transform = "none"
      clone.style.width = `${rect.width}px`
      clone.style.height = `${rect.height}px`
      clone.style.boxShadow = getComputedStyle(sourceEl).boxShadow || ""
      clone.style.zIndex = "9999"
      document.body.appendChild(clone)
      return clone
    } catch {
      return null
    }
  }, [])

  return (
    <div
      className={cn(
        "w-full overflow-x-auto",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-start gap-4",
        )}
        role="list"
        aria-label="Grid columns"
      >
        {keys.map((key) => {
          const label = labels?.[key] ?? key
          const arr = groups.get(key) ?? []
          const total = (getAmount && totals[key]) || 0

          return (
            <section
              key={key}
              className={cn(
                "min-w-[23.5%] w-[23.5%] flex-shrink-0",
              )}
              aria-label={`${label} column`}
              role="listitem"
              onDragOver={(e) => {
                if (!props.enableDnd) return
                // Allow drop
                e.preventDefault()
                e.dataTransfer.dropEffect = "move"
              }}
              onDrop={(e) => {
                if (!props.enableDnd) return
                e.preventDefault()
                const itemId = e.dataTransfer.getData("text/kb-item-id")
                const fromKey = e.dataTransfer.getData("text/kb-from-key")
                if (!itemId || !fromKey) return
                if (fromKey === key) return
                props.onItemMove?.({ itemId, fromKey, toKey: key })
                cleanupDragArtifacts()
              }}
            >
              <header
                className={cn(
                  "flex items-center justify-between py-2",
                  columnHeaderClassName?.(key),
                )}
              >
                <div className="flex items-center gap-2">
                  {/* subtle status dot; uses theme tokens to avoid hard-coded colors */}
                  <span
                    className={cn(
                      // 12x12 square with 4px radius and subtle border
                      "h-3 w-3 rounded ",
                      columnDotClassName?.(key) ?? "bg-primary",
                    )}
                    aria-hidden="true"
                  />
                  <h3 className="text-sm font-medium text-pretty">
                    {label} <span className="opacity-70">({arr.length})</span>
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  {getAmount ? (
                    <span className="text-xs font-medium text-foreground/80">{formatCurrency(total)}</span>
                  ) : null}
                  {renderColumnAction?.(key, arr)}
                </div>
              </header>

              <ul
                className="mt-3 space-y-3 min-h-[96px]"
                aria-label={`${label} items`}
                onDragOver={(e) => {
                  if (!props.enableDnd) return
                  e.preventDefault()
                  e.dataTransfer.dropEffect = "move"
                }}
                onDrop={(e) => {
                  if (!props.enableDnd) return
                  e.preventDefault()
                  const itemId = e.dataTransfer.getData("text/kb-item-id")
                  const fromKey = e.dataTransfer.getData("text/kb-from-key")
                  if (!itemId || !fromKey) return
                  if (fromKey === key) return
                  props.onItemMove?.({ itemId, fromKey, toKey: key })
                  cleanupDragArtifacts()
                }}
              >
                {arr.length === 0 && renderEmpty ? (
                  <li className="text-sm text-muted-foreground">{renderEmpty(key)}</li>
                ) : null}
                {arr.map((item, index) => {
                  const id = getItemId(item, index)
                  return (
                    <li
                      key={id}
                      className={cn("list-none")}
                      draggable={!!props.enableDnd}
                      onDragStart={(e) => {
                        if (!props.enableDnd) return
                        setDraggingItemId(id)
                        e.dataTransfer.effectAllowed = "move"
                        e.dataTransfer.setData("text/kb-item-id", String(id))
                        e.dataTransfer.setData("text/kb-from-key", key)
                        // Use a custom full-opacity floating preview and suppress the browser ghost
                        const target = e.currentTarget as HTMLElement
                        const card = target.firstElementChild as HTMLElement | null
                        if (card) {
                          const preview = createFullOpacityPreview(card)
                          // compute cursor offset inside card for nicer positioning
                          const rect = card.getBoundingClientRect()
                          dragOffsetRef.current = { x: Math.min(20, rect.width / 4), y: 10 }
                          if (preview) {
                            dragPreviewRef.current = preview
                          }
                          // transparent shim to hide native ghost image
                          const shim = document.createElement("canvas")
                          shim.width = 1
                          shim.height = 1
                          e.dataTransfer.setDragImage(shim, 0, 0)
                          // move preview with cursor via document dragover
                          const handler = (ev: DragEvent) => {
                            if (!dragPreviewRef.current) return
                            if (typeof ev.clientX === "number" && typeof ev.clientY === "number") {
                              dragPreviewRef.current.style.left = `${ev.clientX - dragOffsetRef.current.x}px`
                              dragPreviewRef.current.style.top = `${ev.clientY - dragOffsetRef.current.y}px`
                            }
                          }
                          dragMoveHandlerRef.current = handler
                          document.addEventListener("dragover", handler)
                          // also ensure cleanup on document-level events
                          const endOnce = () => cleanupDragArtifacts()
                          document.addEventListener("drop", endOnce, { once: true })
                          document.addEventListener("dragend", endOnce, { once: true })
                        }
                      }}
                      onDragEnd={() => {
                        cleanupDragArtifacts()
                      }}
                    >
                      {renderCard(item)}
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })}
      </div>
    </div>
  )
}

export default GridView

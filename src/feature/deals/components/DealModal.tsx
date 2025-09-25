"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/Button"
import DealForm from "./DealForm"
import { cn } from "@/libs/utils"

type DealSlideOverProps = {
  open: boolean
  onClose: () => void
}

export default function DealSlideOver({ open, onClose }: DealSlideOverProps) {
  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 z-50 transition-[background-color] duration-200",
        open ? "bg-black/40" : "bg-transparent",
      )}
      aria-hidden={!open}
      onClick={(e) => {
        // Close when clicking the backdrop only
        if ((e.target as HTMLElement).id === "deal-backdrop") onClose()
      }}
      id="deal-backdrop"
      style={{ visibility: open ? "visible" : "hidden" }}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="deal-slide-title"
        className={cn(
          "pointer-events-auto fixed right-0 top-0 h-full bg-card border-l border-border shadow-xl flex flex-col bg-white",
          "transition-transform duration-300 will-change-transform",
          open ? "translate-x-0" : "translate-x-full",
        )}
        style={{ width: "400px" }} // exact width as requested
      >
        {/* Header */}
        <header className="flex items-center justify-between gap-4 px-4 py-3 border-b border-border">
          <h2 id="deal-slide-title" className="text-base font-medium text-pretty">
            Add New Deal
          </h2>
          <Button onClick={onClose} aria-label="Close">
            <X className="size-4" />
          </Button>
        </header>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <DealForm
            onCancel={onClose}
            onSubmit={(values) => {
              console.log("[v0] Deal submitted:", values)
              onClose()
            }}
          />
        </div>

        {/* Footer is inside form to properly handle submit/reset via Formik */}
      </aside>
    </div>
  )
}

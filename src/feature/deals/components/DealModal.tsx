"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/Button"
import DealForm from "./DealForm"
import { cn } from "@/libs/utils"
import Modal from "@/components/ui/Modal"
import { useDealStore } from '../stores/useDealStore'

type DealSlideOverProps = {
  open: boolean
  onClose: () => void
}

export default function DealSlideOver({ open, onClose }: DealSlideOverProps) {
 const addDeal = useDealStore((s) => s.addDeal);

  const handleSubmit = async (values: any) => {
    try {
      await addDeal(values); 
      onClose();
    } catch (error) {
      console.error("Error creating deal:", error);
    }
  };
  return (
    <Modal open={open} onClose={onClose}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="deal-slide-title"
        className={cn(
          "pointer-events-auto fixed right-0 top-0 h-full bg-card border-l border-[var(--border-gray)] shadow-xl flex flex-col bg-white",
          "transition-transform duration-300 will-change-transform",
          open ? "translate-x-0" : "translate-x-full",
        )}
        style={{ width: "400px" }}
      >
        {/* Header */}
        <header className="flex items-center justify-between gap-4 p-4 border-b border-[var(--border-gray)]">
          <h2 id="deal-slide-title" className="text-base font-semibold leading-[28px] text-pretty">
            Add New Deal
          </h2>
          <button onClick={onClose} aria-label="Close">
            <X className="size-4" />
          </button>
        </header>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto ">
          <DealForm
            onCancel={onClose}
            onSubmit={(values) => {
              console.log("[v0] Deal submitted:", values)
              handleSubmit(values)
              onClose()
            }}
          />
        </div>
      </aside>
    </Modal>
  )
}

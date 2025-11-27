"use client"

import { X } from "lucide-react"
import DealForm from "./DealForm"
import { cn } from "@/libs/utils"
import Modal from "@/components/ui/Modal"
import { Deal } from '../types'
import { useDealStore } from '../stores/useDealStore'
import toast from "react-hot-toast"
import { useEffect } from "react"
import { useUserStore } from "@/feature/user/store/userStore"
import { useSession } from "next-auth/react"

type DealSlideOverProps = {
  open: boolean
  onClose: () => void
  mode?: 'add' | 'edit'
  deal?: Deal
  defaultStage?: Deal["stage"]
}

export default function DealSlideOver({ open, onClose, mode = 'add', deal, defaultStage }: DealSlideOverProps) {

  const addDeal = useDealStore((s) => s.addDeal);
  const updateDeal = useDealStore((s) => s.updateDeal);
const { users, loading: usersLoading, currentUser, initializeCurrentUser } = useUserStore();

  // Create user options for the dropdown
  const userOptions = users.map((user: any) => ({
      id: user.id,
      value: user.id,
      label: user.name || user.email
  }));
const {data: currentUserId} = useSession();
useEffect(() => {
  if (open && !currentUser) {
    initializeCurrentUser();
  }
}, [open, currentUser, initializeCurrentUser]);

  const handleSubmit = async (values: any) => {
    try {
      if (mode === 'edit' && deal) {
        const payload = {
          ...values,
          // Map company and contact IDs to the expected field names for edit mode too
          companyId: values.company || null,
          contactId: values.contact || null,
          // Remove the original company and contact fields to avoid conflicts
          company: undefined,
          contact: undefined,
        }
        await updateDeal(deal.id, payload);
      } else {
          const selectedOwner = userOptions.find(user => user.id === values.owner);
        const payload = {
          ...values,
          owner: selectedOwner
          ? { id: selectedOwner.id as string, name: selectedOwner.label as string }
          : { id: '', name: '' },
          // Map company and contact IDs to the expected field names
          companyId: values.company || null,
          contactId: values.contact || null,
          // Remove the original company and contact fields to avoid conflicts
          company: undefined,
          contact: undefined,
        }
        await addDeal(payload);
      }
      onClose();
    } catch (error) {
      toast.error(`Error ${mode === 'edit' ? 'updating' : 'creating'} deal:`);
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
            {mode === 'edit' ? 'Update Deal' : 'Add New Deal'}
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
              handleSubmit(values)
              onClose()
            }}
            mode={mode}
            initialData={deal}
            usersLoading={usersLoading}
            userOptions={userOptions}
  currentUserId={currentUserId?.user?.id ?? undefined} // ✅ fixes the type
            defaultStage={defaultStage}

          />
        </div>
      </aside>
    </Modal>
  )
}

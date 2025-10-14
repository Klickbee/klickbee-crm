"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { cn } from "@/libs/utils"
import Modal from "@/components/ui/Modal"
import ProspectForm from "./ProspectForm"
import { useProspectsStore } from "../stores/useProspectsStore"
import { Prospect } from "../types/types"
import toast from "react-hot-toast"
import { useUserStore } from "@/feature/user/store/userStore"
import { useEffect } from "react"

type ProspectSlideOverProps = {
  open: boolean
  onClose: () => void
  mode?: 'add' | 'edit'
    prospect?: Prospect
}

export default function ProspectSlideOver({ open, onClose , mode = 'add', prospect }: ProspectSlideOverProps) {
  const { addProspect } = useProspectsStore();
  const { updateProspect } = useProspectsStore();
   const { users, loading: usersLoading, fetchUsers } = useUserStore();
  
    useEffect(() => {
        if (users.length === 0) {
            fetchUsers();
        }
    }, [users]);
  
    // Create user options for the dropdown
    const userOptions = users.map((user: any) => ({
        id: user.id,
        value: user.id,
        label: user.name || user.email
    }));
 const handleSubmit = async (values: any) => {
    try {
      if (mode === 'edit' && prospect) {
        await updateProspect(prospect.id, values);
      } else {
        const selectedOwner = userOptions.find(user => user.id === values.owner);
        const payload = {...values,
          owner: selectedOwner
          ? { id: selectedOwner.id as string, name: selectedOwner.label as string }
          : { id: '', name: '' },
        }
        await addProspect(payload);
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
        aria-labelledby="prospect-slide-title"
        className={cn(
          "pointer-events-auto fixed right-0 top-0 h-full bg-card border-l border-[var(--border-gray)] shadow-xl flex flex-col bg-white",
          "transition-transform duration-300 will-change-transform",
          open ? "translate-x-0" : "translate-x-full",
        )}
        style={{ width: "400px" }}
      >
        {/* Header */}
        <header className="flex items-center justify-between gap-4 p-4 border-b border-[var(--border-gray)]">
          <h2 id="prospect-slide-title" className="text-base font-semibold leading-[28px] text-pretty">
  {mode === 'edit' ? 'Update Prospect' : 'Add New Prospect'}
            </h2>
          <button onClick={onClose} aria-label="Close">
            <X className="size-4" />
          </button>
        </header>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto ">
          <ProspectForm
            onCancel={onClose}
            onSubmit={(values) => handleSubmit(values)}
             mode={mode}
            initialData={prospect}
            usersLoading={usersLoading}
            userOptions={userOptions}
          />
        </div>
      </aside>
    </Modal>
  )
}

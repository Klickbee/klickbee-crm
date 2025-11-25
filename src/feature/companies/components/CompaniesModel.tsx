"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { cn } from "@/libs/utils"
import Modal from "@/components/ui/Modal"
import CompaniesForm from "./CompaniesForm"
import toast from "react-hot-toast"
import { useCompaniesStore } from "../stores/useCompaniesStore"
import { Company } from "../types/types"
import { useEffect } from "react"
import { useUserStore } from "@/feature/user/store/userStore"
import { useSession } from "next-auth/react"

type DealSlideOverProps = {
  open: boolean
  onClose: () => void
  mode?: 'add' | 'edit'
  company?: Company
}

export default function CompanySlideOver({ open, onClose, mode = 'add', company }: DealSlideOverProps) {
  const { addCompany, updateCompany } = useCompaniesStore();
    const { users, loading: usersLoading, fetchUsers } = useUserStore();
    const { data: session } = useSession();
  
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
      if (mode === 'edit' && company) {
        toast.loading("Updating company...", { id: "update-company" });
        await updateCompany(company.id, values);
        toast.success("Company updated successfully!", { id: "update-company" });
      } else {
        toast.loading("Creating company...", { id: "create-company" });
        const selectedOwner = userOptions.find(user => user.id === values.owner);
        const payload = {...values,
          owner: selectedOwner
          ? { id: selectedOwner.id as string, name: selectedOwner.label as string }
          : { id: '', name: '' },
        }
        await addCompany(payload);
        toast.success("Company created successfully!", { id: "create-company" });
      }
      onClose();
    } catch (error) {
      const errorMessage = mode === 'edit' ? "Failed to update company. Please try again." : "Failed to create company. Please try again.";
      const toastId = mode === 'edit' ? "update-company" : "create-company";
      toast.error(errorMessage, { id: toastId });
      console.error(`Error ${mode === 'edit' ? 'updating' : 'creating'} company:`, error);
    }
  }
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
            {mode === 'edit' ? 'Update Company' : 'Add New Company'}
          </h2>
          <button onClick={onClose} aria-label="Close">
            <X className="size-4" />
          </button>
        </header>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto ">
          <CompaniesForm
            onCancel={onClose}
            onSubmit={(values) => handleSubmit(values)}
            mode={mode}
            initialData={company}
              usersLoading={usersLoading}
            userOptions={userOptions}
            currentUserId={session?.user?.id}
          />
        </div>
      </aside>
    </Modal>
  )
} 

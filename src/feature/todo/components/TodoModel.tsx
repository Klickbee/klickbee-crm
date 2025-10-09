"use client"

import { X } from "lucide-react"
import { cn } from "@/libs/utils"
import Modal from "@/components/ui/Modal"
import TodoForm from "./TodoForm"
import { useTodoStore } from "../stores/useTodoStore"
import { TaskData } from "../types/types"
import toast from "react-hot-toast"

type TodoSlideOverProps = {
  open: boolean
  onClose: () => void
   mode?: 'add' | 'edit'
     task?: TaskData
   
}

export default function TodoSlideOver({ open, onClose,  mode = 'add', task }: TodoSlideOverProps) {
  const { addTodo } = useTodoStore()
  const { updateTodo } = useTodoStore()

   const handleSubmit = async (values: any) => {
    try {
      if (mode === 'edit' && task) {
        await updateTodo(task.id, values);
      } else {
        await addTodo(values);
      }
      onClose();
    } catch (error) {
      toast.error(`Error ${mode === 'edit' ? 'updating' : 'creating'} task:`);
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
            
             {mode === 'edit' ? 'Update Task' : 'Add New Task'}
          </h2>
          <button onClick={onClose} aria-label="Close">
            <X className="size-4" />
          </button>
        </header>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <TodoForm
            onCancel={onClose}
            onSubmit={(values) => {
              handleSubmit(values)
              onClose()
            }}
              mode={mode}
            initialData={task}
          />
        </div>
      </aside>
    </Modal>
  )
}

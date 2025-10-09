"use client";
import type { TaskData } from "../types/types";
import { ArrowUp, AlertTriangle, Minus, ChevronUp } from 'lucide-react';
import DetailModal from "@/components/detailPage";
// Helper function to format dates
const formatDate = (dateString: string | undefined) => {
  if (!dateString) return null;

  const date = new Date(dateString);

  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

interface TodoDetailProps {
  isOpen: boolean;
  task: TaskData | null;
  onClose: () => void;
  onDelete?: (id: string) => void;
  onEdit?: (task: TaskData) => void;
  onAddNotes?: (id: string) => void;
  onExport?: (id: string) => void;
}

// Helper function to render status badge
const renderStatusBadge = (status: string | null | undefined) => {
  const statusValue = String(status || '-')

  // Map enum values to display values
  const statusDisplayMap: Record<string, string> = {
    'Todo': 'To-Do',
    'InProgress': 'In-Progress',
    'OnHold': 'On-Hold',
    'Done': 'Done',
  }

  const displayText = statusDisplayMap[statusValue] || statusValue

  const cls = {
    'Todo': 'bg-[#E4E4E7] text-[#3F3F46]',
    'InProgress': 'bg-[#DBEAFE] text-[#1D4ED8]',
    'Done': 'bg-[#DCFCE7] text-[#166534]',
    'OnHold': 'bg-[#FFEAD5] text-[#9A3412]',
  }[statusValue] || 'bg-[#E4E4E7] text-[#3F3F46]'

  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${cls}`}>
      {displayText}
    </span>
  )
}

// Helper function to render priority badge
const renderPriorityBadge = (priority: string | null | undefined) => {
  const value = String(priority || '-')
  const base = 'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium'
  const style = {
    Low: 'bg-[#F4F4F5] text-[#71717A]',
    Medium: 'bg-[#DBEAFE] text-[#1D4ED8]',
    High: 'bg-[#FFEAD5] text-[#9A3412]',
    Urgent: 'bg-[#FEE2E2] text-[#B91C1C]',
  }[value] || 'bg-[#F4F4F5] text-[#71717A]'

  const Icon = value === 'High' ? ArrowUp : value === 'Urgent' ? AlertTriangle : value === 'Medium' ? ChevronUp : Minus

  return (
    <span className={`${base} ${style}`}>
      <Icon className="h-3 w-3" />
      {value}
    </span>
  )
}

export default function TodoDetail({
  isOpen,
  task,
  onClose,
  onDelete,
  onEdit,
  onAddNotes,
  onExport,
}: TodoDetailProps) {
  if (!task) return null;

  const details = [
    { label: "Status", value: renderStatusBadge(task.status) },
    { label: "Priority", value: renderPriorityBadge(task.priority) },
    {
      label: "Assigned To",
      value: (
        <span className="flex items-center gap-2">
          {task.assignedImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={task.assignedImage}
              alt={typeof task.assignedTo === 'object' ? task.assignedTo?.name ?? "Assignee" : task.assignedTo ?? "Assignee"}
              className="w-6 h-6 rounded-full"
            />
          )}
          {typeof task.assignedTo === 'object' ? task.assignedTo?.name : task.assignedTo ?? "-"}
        </span>
      ),
    },
        { label: "Linked To", value: typeof task.linkedTo === 'object' ? task.linkedTo?.name : task.linkedTo ?? "-" },

    task.dueDate && { label: "Due Date", value: formatDate(task.dueDate) },
    task.lastUpdate && { label: "Last Update", value: formatDate(task.lastUpdate) },
  ].filter(Boolean) as { label: string; value: React.ReactNode }[];

  return (
    <DetailModal
      isOpen={isOpen}
      title={task.taskName ?? "Task Details"}
      details={details}
      onClose={onClose}
      onDelete={onDelete ? () => onDelete(task.id) : undefined}
      onEdit={onEdit ? () => onEdit(task as TaskData) : undefined}
    />
  );
}

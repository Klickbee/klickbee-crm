"use client"

import { Card, CardContent } from "@/components/ui/Card"
import { cn } from "@/libs/utils"
import * as React from "react"
import type { TaskData } from "../types/types"
import { Calendar, AlertTriangle, ArrowUp, Minus, ChevronUp } from "lucide-react"
import AvatarInitials from "@/components/ui/AvatarInitials"

type TodoCardProps = {
  task: TaskData
  className?: string
}

const statusBadgeClass: Record<string, string> = {
  "Todo": "bg-[#E4E4E7] text-[#3F3F46]",
  "InProgress": "bg-[#DBEAFE] text-[#1D4ED8]",
  "Done": "bg-[#DCFCE7] text-[#166534]",
  "OnHold": "bg-[#FFEAD5] text-[#9A3412]",
}

const statusDisplayMap: Record<string, string> = {
  "Todo": "To-Do",
  "InProgress": "In-Progress",
  "OnHold": "On-Hold",
  "Done": "Done",
}

function PriorityPill({ priority }: { priority?: TaskData["priority"] }) {
  const value = String(priority || "Low")
  const base = "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium"
  const style =
    {
      Low: "bg-[#F4F4F5] text-[#71717A]",
      Medium: "bg-[#DBEAFE] text-[#1D4ED8]",
      High: "bg-[#FFEAD5] text-[#9A3412]",
      Urgent: "bg-[#FEE2E2] text-[#B91C1C]",
    }[value] || "bg-[#F4F4F5] text-[#71717A]"

  const Icon = value === "High" ? ArrowUp : value === "Urgent" ? AlertTriangle : value === "Medium" ? ChevronUp : Minus

  return (
    <span className={cn(base, style)}>
      <Icon className="h-3 w-3" />
      {value}
    </span>
  )
}

const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

export function TodoCard({ task, className }: TodoCardProps) {
  const badgeClass = statusBadgeClass[String(task.status)] ?? "bg-[#E4E4E7] text-[#3F3F46]"
  const displayStatus = statusDisplayMap[String(task.status)] || String(task.status)

  // Check if due date is overdue
  const isOverdue = task.dueDate ? new Date(task.dueDate) < new Date() : false;

  return (
    <Card className={cn("border", className)} role="article" aria-label={task.taskName}>
      <CardContent className="p-4 gap-3">
        <div className="mb-2 flex items-center gap-2 flex-wrap">
          <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium", badgeClass)}>
            {displayStatus}
          </span>
          {task.priority ? (
            <div className="flex gap-2">
              <PriorityPill priority={task.priority}/>
            </div>
          ) : null}
        </div>

        <h4 className="text-sm font-semibold text-pretty leading-tight">{task.taskName}</h4>
        <p className="mt-1 text-xs text-[var(--brand-gray)] ">{typeof task.linkedTo === 'object' ? task.linkedTo?.name : task.linkedTo ?? ""}</p>
        {task.dueDate && (
          <div className="text-xs mt-2 text-[var(--brand-gray)] flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5" />
            <span className={cn(isOverdue && " font-medium")}>
              {formatDate(task.dueDate,)}
            </span>
          </div>
        )}

         <div className="mt-4 flex items-center gap-2">
          <AvatarInitials
            name={typeof task.assignedTo === 'object' ? task.assignedTo?.name ?? '' : String(task.assignedTo ?? '')}
            size={24}
          />
          <span className="text-xs text-foreground/80">{typeof task.assignedTo === 'object' ? task.assignedTo?.name : task.assignedTo ?? ""}</span>
        </div>
      </CardContent>
    </Card>
  )
}

export default TodoCard



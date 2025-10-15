"use client"

import React, { useEffect } from "react"
import { useTodoStore } from "../../todo/stores/useTodoStore"
import { AlertTriangle, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"


export default function TasksCard() {
  const { todos, filteredTodos, fetchTodos } = useTodoStore()
  const router = useRouter()

  useEffect(() => {
    fetchTodos()
  }, [fetchTodos])

  const handleClick = () => {
    router.push("/todo"); // navigate to your route
  };

  // Helper function to format date as "Month DD, YYYY"
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
  }

  // Map TaskData to Task interface for display
  const tasks = filteredTodos.slice(0, 4).map((todo, index) => {
    const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date()
    const isHighPriority = todo.priority === 'High' || todo.priority === 'Urgent'

    return {
      id: todo.id || `task-${index}`,
      title: todo.taskName,
      date: formatDate(todo.dueDate || todo.lastUpdate),
      status: todo.status === 'OnHold' ? 'ongoing' : (todo.status === 'Todo' || todo.status === 'InProgress')
        ? (isOverdue ? 'overdue' : 'ongoing')
        : todo.status === 'Done' ? 'done' : 'ongoing' as "ongoing" | "overdue" | "done",
      color: isHighPriority ? '#EF4444' : todo.status === 'Done' ? '#10B981' : isOverdue ? '#F59E0B' : '#3B82F6'
    }
  })

  // Calculate overdue todos count
  const overdueCount = filteredTodos.filter(todo =>
    (todo.status === 'Todo' || todo.status === 'InProgress' || todo.status === 'OnHold') &&
    todo.dueDate &&
    new Date(todo.dueDate) < new Date()
  ).length

  const lateAssignmentsNotice = overdueCount > 0
    ? `There are ${overdueCount} overdue assignments.`
    : "No overdue assignments."

  // Calculate progress based on todo statuses
  const totalTodos = filteredTodos.length
  const completedTodos = filteredTodos.filter(todo => todo.status === 'Done').length
  const ongoingTodos = filteredTodos.filter(todo => todo.status === 'Todo' || todo.status === 'InProgress').length
  const onHoldTodos = filteredTodos.filter(todo => todo.status === 'OnHold').length
  const overdueTasks = filteredTodos.filter(todo =>
    (todo.status === 'Todo' || todo.status === 'InProgress' || todo.status === 'OnHold') &&
    todo.dueDate &&
    new Date(todo.dueDate) < new Date()
  ).length

  const progress = [
    { label: "Ongoing", value: totalTodos > 0 ? Math.round((ongoingTodos / totalTodos) * 100) : 0, color: "#3B82F6" },
    { label: "Done", value: totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0, color: "#10B981" },
    { label: "Overdue", value: totalTodos > 0 ? Math.round((overdueTasks / totalTodos) * 100) : 0, color: "#EF4444" },
  ]

  return (
    <section className=" xl:w-[367px] 2xl:w-auto h-[488px] rounded-xl border border-[var(--border-gray)] shadow-sm bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center border-b border-[var(--border-gray)] h-[56px] justify-between p-[16px]">
        <h3 className="text-sm font-semibold text-foreground">Tasks ({totalTodos})</h3>
        <button onClick={handleClick}
         className="text-xs font-medium text-muted-foreground hover:text-gray-600">See Details</button>
      </div>

      {/* Scrollable content (notice + tasks) */}
      <div className="flex-1  items-center overflow-y-auto px-4 scrollbar-hide p-[16px]">
        {/* Notice */}
        <div className="mb-3 flex h-[36px] items-center justify-between rounded-md border border-[var(--border-gray)] bg-orange-50 px-[12px] py-[10px] text-xs text-orange-700">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span>{lateAssignmentsNotice}</span>
          </div>
          <button onClick={handleClick}
          className="underline">Details</button>
        </div>

        {/* Tasks list */}
        <div className="flex flex-col gap-4">
          {tasks.map((t) => (
            <div
              key={t.id}
              className="h-[76px]"
            >
              <div className="flex flex-col h-[42px]">

                <div className="text-sm text-foreground">{t.title}</div>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5 text-[var(--brand-gray)]" />
                <span className="text-xs text-[var(--brand-gray)]">{t.date}</span>
              </div>
              </div>
             <div className="flex items-center justify-between h-[30px]">
  {/* Status badge */}
  <span
    className={
      `inline-block w-[70px] text-center h-[22px] rounded-md px-2 py-0.5 text-sm leading-[16px] ` +
      (t.status === "ongoing"
        ? "bg-blue-100 text-blue-700"
        : t.status === "done"
        ? "bg-green-100 text-green-700"
        : "bg-orange-100 text-orange-700")
    }
  >
    {t.status}
  </span>

  {/* User images */}
  <div className="flex -space-x-2">
    <img
      src="\icons\ProfileIcon.svg"
      alt="User 1"
      className="h-[30px] w-[30px] rounded-full ring-2 ring-white"
    />
    <img
      src="\icons\ProfileIcon.svg"
      alt="User 2"
      className="h-[30px] w-[30px] rounded-full ring-2 ring-white"
    />
  </div>
</div>

            </div>
          ))}
        </div>
      </div>

      {/* Fixed footer (progress bar) */}
      <div className="border-t border-[var(--border-gray)] px-4 py-3">
        <div className="mt-2 h-3 w-full overflow-hidden rounded bg-muted">
          <div className="flex h-full w-full">
            <div
              style={{
                width: `${progress[0].value}%`,
                backgroundColor: progress[0].color,
              }}
            />
            <div
              style={{
                width: `${progress[1].value}%`,
                backgroundColor: progress[1].color,
              }}
            />
            <div
              style={{
                width: `${progress[2].value}%`,
                backgroundColor: progress[2].color,
              }}
            />
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          {progress.map((p) => (
            <div key={p.label} className="flex items-center gap-2">
              <span
                className="inline-block h-2 w-2 rounded-sm"
                style={{ backgroundColor: p.color }}
              />
              <span>
                {p.label}({p.value}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

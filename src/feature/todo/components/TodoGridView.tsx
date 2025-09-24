"use client"

import * as React from 'react'
import GridView from '@/components/ui/GridView'
import { tasksData as initialTasks } from '../libs/taskData'
import type { TaskData } from '../types/types'
import { TodoCard } from './TodoCard'
import { Plus } from 'lucide-react'

export default function TodoGridView() {
  const [tasks, setTasks] = React.useState<TaskData[]>(() => initialTasks)

  const handleMove = React.useCallback(({ itemId, fromKey, toKey }: { itemId: string | number; fromKey: string; toKey: string }) => {
    setTasks((prev) => prev.map((t) => (String(t.id) === String(itemId) ? { ...t, status: toStatusFromColumn(toKey, t.status) } : t)))
  }, [])

  return (
    <main className="p-4 bg-[#F4F4F5]">
      <GridView
        items={tasks}
        groupBy={(t: TaskData) => t.status ?? 'To-Do'}
        order={["To-Do", "In-Progress", "On-Hold", "Done"]}
        labels={{
          "To-Do": "To-Do",
          "In-Progress": "In-Progress",
          "On-Hold": "On-Hold",
          "Done": "Done",
        }}
        renderCard={(task: TaskData) => <TodoCard task={task} />}
        enableDnd
        onItemMove={handleMove}
        renderColumnAction={(key: any) => (
            <button
              className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-[#E4E4E7] text-xs font-medium text-primary-foreground cursor-pointer"
              aria-label={`Add to ${key}`}
              // onClick={() => alert(`Add to ${key}`)}
            >
              <Plus className="h-3 w-3"/>
            </button>
          )}
        columnHeaderClassName={(key: any) =>
          key === "Done" ? "" : key === "" ? "bg-blue-500" : key === "" ? "" : undefined
        }
        columnDotClassName={(key: any) =>
          key === "Done"
            ? "bg-[#10B981]"
            : key === "In-Progress"
            ? "bg-blue-500"
            : key === "On-Hold"
            ? "bg-orange-500"
            : key === "To-Do"
            ? "bg-gray-300"
            : undefined
        }
      />
    </main>
  )
}

function toStatusFromColumn(columnKey: string, currentStatus?: TaskData['status']): TaskData['status'] {
  switch (columnKey) {
    case 'To-Do':
      return 'To-Do'
    case 'In-Progress':
      return 'In-Progress'
    case 'On-Hold':
      return 'On-Hold'
    case 'Done':
      return 'Done'
    default:
      return currentStatus ?? 'To-Do'
  }
}
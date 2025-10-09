"use client"

import * as React from 'react'
import GridView from '@/components/ui/GridView'
import { TodoCard } from './TodoCard'
import { Plus } from 'lucide-react'
import TodoDetail from './TodoDetail'
import { useTodoStore } from '../stores/useTodoStore'
import type { TaskData } from '../types/types'
import TodoModel from './TodoModel'

import toast from 'react-hot-toast'

export default function TodoGridView() {
  const { todos, fetchTodos, loading, updateTodo ,deleteTodo } = useTodoStore()
  const [selectedTask, setSelectedTask] = React.useState<TaskData | null>(null)
  const [isDetailOpen, setIsDetailOpen] = React.useState(false)
    const [showModal, setShowModal] = React.useState<boolean>(false);
    const [editTask, setEditTask] = React.useState<TaskData | null>(null);

  React.useEffect(() => {
    fetchTodos()
  }, [fetchTodos])

  const openDetail = (task: TaskData) => {
    setSelectedTask(task)
    setIsDetailOpen(true)
  }
   const handleEditTask = (task: TaskData) => {
      setEditTask(task);
      setShowModal(true);
      setIsDetailOpen(false);
    };

  const closeDetail = () => {
    setIsDetailOpen(false)
    setSelectedTask(null)
  }

  let moveInProgress = false;

  const groupBy = React.useCallback((t: TaskData) => {
    const statusMap = {
      'Todo': 'To-Do',
      'InProgress': 'In-Progress',
      'OnHold': 'On-Hold',
      'Done': 'Done',
    }
    return statusMap[t.status as keyof typeof statusMap] || 'To-Do'
  }, [])

  const handleMove = React.useCallback(async ({ itemId, fromKey, toKey }: { itemId: string | number; fromKey: string; toKey: string }) => {
    if (moveInProgress) return; // prevent double fire in Strict Mode
    moveInProgress = true;
console.log("fromKey:", fromKey, "toKey:", toKey);

    const taskToUpdate = todos.find((t) => String(t.id) === String(itemId));
    if (!taskToUpdate) {
      moveInProgress = false;
      return;
    }

    const newStatus = toStatusFromColumn(toKey, taskToUpdate.status);
    if (!newStatus || newStatus === taskToUpdate.status) {
      moveInProgress = false;
      return;
    }

    const statusLabelMap: Record<string, string> = {
      Todo: "To-Do",
      InProgress: "In-Progress",
      OnHold: "On-Hold",
      Done: "Done",
    };

    const readableStatus = statusLabelMap[newStatus] || newStatus;

    try {
      // Optimistic update - immediately update UI
      useTodoStore.setState((state) => ({
        todos: state.todos.map((t) =>
          t.id === taskToUpdate.id ? { ...t, status: newStatus } : t
        ),
      }));

      await updateTodo(taskToUpdate.id, { status: newStatus });

      toast.success(`Task moved to ${readableStatus}`);
    } catch (err: any) {
      // Revert optimistic update on error
      useTodoStore.setState((state) => ({
        todos: state.todos.map((t) =>
          t.id === taskToUpdate.id ? taskToUpdate : t
        ),
      }));

      toast.error(`Failed to move task: ${err.message}`);
      console.error("handleMove error:", err);
    } finally {
      moveInProgress = false;
    }
  }, [todos, updateTodo])

  if (loading) {
    return <div className="p-4 text-center">Loading todos...</div>
  }

  return (
    <main className="p-4 bg-[#F4F4F5] rounded-lg border border-[var(--border-gray)] shadow-sm">
      <GridView
        items={todos}
        groupBy={groupBy}
        order={["To-Do", "In-Progress", "On-Hold", "Done"]}
        labels={{
          "To-Do": "To-Do",
          "In-Progress": "In-Progress",
          "On-Hold": "On-Hold",
          "Done": "Done",
        }}
        renderCard={(task: TaskData) => (
          <div onClick={() => openDetail(task)} className="cursor-pointer">
            <TodoCard task={task} />
          </div>
        )}
        enableDnd
        onItemMove={handleMove}
        renderColumnAction={(key: any) => (
          <button
            className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-[#E4E4E7] text-xs font-medium text-primary-foreground cursor-pointer"
            aria-label={`Add to ${key}`}
          >
            <Plus className="h-3 w-3" />
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

      <TodoDetail
        isOpen={isDetailOpen}
        task={selectedTask}
        onClose={closeDetail}
        onDelete={async (id) => {
                  await deleteTodo(id)
                  closeDetail()
                }}
        onEdit={handleEditTask}
        onAddNotes={() => {}}
        onExport={() => {}}
      />
      <TodoModel open={showModal} onClose={() => setShowModal(false)} mode={editTask ? 'edit' : 'add'} task={editTask || undefined} />
    </main>
  )
}

function toStatusFromColumn(columnKey: string, currentStatus?: TaskData['status']): TaskData['status'] {
  switch (columnKey) {
    case 'To-Do':
      return 'Todo'
    case 'In-Progress':
      return 'InProgress'
    case 'On-Hold':
      return 'OnHold'
    case 'Done':
      return 'Done'
    default:
      return currentStatus ?? 'Todo'
  }
}
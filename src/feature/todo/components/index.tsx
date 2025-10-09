
"use client";
import React, { useEffect } from 'react'
import { TodoHeader } from './ToDo-Header';
import { Table } from '@/components/ui/Table';
import { ArrowUp, AlertTriangle, Minus, ChevronUp } from 'lucide-react'
import { TaskData } from '../types/types';
import { TableColumn } from '@/components/ui/Table';
import TodoGridView from './TodoGridView';
import TodoDetail from './TodoDetail';
import { useTodoStore } from '../stores/useTodoStore';
import { useUserStore } from '@/feature/user/store/userStore';
import TodoModel from './TodoModel'
const taskColumns: TableColumn<TaskData>[] = [
  {
    key: 'taskName',
    title: 'Task Name',
    dataIndex: 'taskName',
    sortable: true,
  },
  {
    key: 'linkedTo',
    title: 'Linked To',
    dataIndex: 'linkedTo',
    sortable: false,
    render: (linkedTo) => {
      return (
        <div>{linkedTo?.name}</div>
      )
    }
  },
  {
    key: 'assignedTo',
    title: 'Assigned To',
    dataIndex: 'assignedTo',
    sortable: false,
    avatar: { srcIndex: 'assignedImage', altIndex: 'assignedTo', size: 32 },
    render: (assignedTo) => {
      return (
        <div>{assignedTo?.name}</div>
      )
    }
  },
  {
    key: 'status',
    title: 'Status',
    dataIndex: 'status',
    sortable: false,
    render: (status) => {
      const statusMap = {
        'Todo': 'To-Do',
        'InProgress': 'In-Progress',
        'Done': 'Done',
        'OnHold': 'On-Hold',
      }

      const displayText = statusMap[String(status) as keyof typeof statusMap] || String(status)

      const cls = {
        'Todo': 'bg-[#E4E4E7] text-[#3F3F46]',
        'InProgress': 'bg-[#DBEAFE] text-[#1D4ED8]',
        'Done': 'bg-[#DCFCE7] text-[#166534]',
        'OnHold': 'bg-[#FFEAD5] text-[#9A3412]',
      }[String(status)] || 'bg-[#E4E4E7] text-[#3F3F46]'

      return (
        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${cls}`}>
          {displayText}
        </span>
      )
    },
  },
  {
    key: 'priority',
    title: 'Priority',
    dataIndex: 'priority',
    render: (priority) => {
      const value = String(priority)
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
    },
  },
  {
    key: 'dueDate',
    title: 'Due Date',
    dataIndex: 'dueDate',
    sortable: true,
    render: (dateString) => {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }
  },
  {
    key: 'lastUpdate',
    title: 'Last Update',
    dataIndex: 'lastUpdate',
    sortable: false,
  },
]


export default function TODO() {
  const [view, setView] = React.useState<'table' | 'grid'>('table');
  const [selectedTask, setSelectedTask] = React.useState<TaskData | null>(null)
  const [isDetailOpen, setIsDetailOpen] = React.useState(false)
  const [showModal, setShowModal] = React.useState<boolean>(false);
  const [editTask, setEditTask] = React.useState<TaskData | null>(null);
  const { todos, fetchTodos, loading, deleteTodo } = useTodoStore();
  const { users } = useUserStore();

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

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


  return (
    <div className='overflow-x-hidden'>
      <TodoHeader view={view} setView={(view: 'table' | 'grid') => setView(view)} />
      <div className='py-8 px-6 overflow-x-hidden'>
        {view === 'table' ? (
          <>
            {loading ? (
              <div className="p-4 text-center">Loading todos...</div>
            ) : (
              <>
                <Table
                  columns={taskColumns}
                  data={todos}
                  selectable={true}
                  onRowClick={(record) => openDetail(record as TaskData)}
                />
                {isDetailOpen && (
                  <TodoDetail
                    isOpen={isDetailOpen}
                    task={selectedTask}
                    onClose={closeDetail}
                    onDelete={async (id) => {
                      await deleteTodo(id)
                      closeDetail()
                    }}
                    onEdit={handleEditTask}
                    onAddNotes={() => { }}
                    onExport={() => { }}
                  />
                )}
              </>
            )}
          </>
        ) : (
          <TodoGridView />
        )}
        <TodoModel open={showModal} onClose={() => setShowModal(false)} mode={editTask ? 'edit' : 'add'} task={editTask || undefined} />
      </div>
    </div>
  )
}


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
import Loading from '@/components/ui/Loading';
import { DateConvertion } from '@/libs/utils/dateConvertion';
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
      if (!linkedTo) return '-';
      const displayName = typeof linkedTo === 'object' ? linkedTo.name || linkedTo.email : linkedTo;
      return (
        <div>{displayName || 'Unknown'}</div>
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
      if (!assignedTo) return '-';
      // Handle both object and string cases
      const displayName = typeof assignedTo === 'object' ? assignedTo.name : assignedTo;
      return (
        <div>{displayName || 'Unknown'}</div>
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
    sortable: false,
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
    render: (_val, record) => {
      const dateString = (record as TaskData).lastUpdate || (record as TaskData).updatedAt;
        const time =  DateConvertion(dateString);
        return time
    },
  },
]


export default function TODO() {
  const [view, setView] = React.useState<'table' | 'grid'>('table');
  const [selectedTask, setSelectedTask] = React.useState<TaskData | null>(null)
  const [isDetailOpen, setIsDetailOpen] = React.useState(false)
  const [showModal, setShowModal] = React.useState<boolean>(false);
  const [editTask, setEditTask] = React.useState<TaskData | null>(null);
  const [selectedTodos, setSelectedTodos] = React.useState<string[]>([])
  const [selectedTodoRows, setSelectedTodoRows] = React.useState<TaskData[]>([])
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);
  // Selectors to avoid re-renders from full-store subscription and keep function refs stable
  const filteredTodos = useTodoStore((s) => s.filteredTodos);
  const loading = useTodoStore((s) => s.loading);
  const deleteTodo = useTodoStore((s) => s.deleteTodo);
  const fetchTodos = useTodoStore((s) => s.fetchTodos);
  const initializeOwnerOptions = useTodoStore((s) => s.initializeOwnerOptions);
  const ownerOptions = useTodoStore((s) => s.filters.owner);
  const { users } = useUserStore();

  // Run fetch once on mount; guarded for React Strict Mode double-invocation in dev
  const didInitRef = React.useRef(false);
  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    fetchTodos();
  }, [fetchTodos]);

  // Initialize owner options once after users are loaded
  useEffect(() => {
    if (users && users.length > 0 && ownerOptions.length === 0) {
      initializeOwnerOptions();
    }
  }, [users, ownerOptions.length, initializeOwnerOptions]);

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

  const handleSelectionChange = (selectedKeys: string[], selectedRows: TaskData[]) => {
    setSelectedTodos(selectedKeys);
    setSelectedTodoRows(selectedRows);
  };


  return (
    <div className=''>
      <TodoHeader 
        view={view} 
        setView={(view: 'table' | 'grid') => setView(view)}
        selectedTodos={selectedTodos}
        selectedTodoRows={selectedTodoRows}
        onClearSelection={() => {
          setSelectedTodos([]);
          setSelectedTodoRows([]);
        }}
        isDeleting={isDeleting}
        isEditing={isEditing}
        isExporting={isExporting}
        setIsDeleting={setIsDeleting}
        setIsEditing={setIsEditing}
        setIsExporting={setIsExporting}
      />
      <div className='py-8 px-6 overflow-x-hidden'>
        {view === 'table' ? (
          <>
            {loading ? (
              <Loading label="Loading todos..." />
            ) : (
              <>
                <Table
                  columns={taskColumns}
                  data={filteredTodos}
                  selectable={true}
                  onSelectionChange={handleSelectionChange}
                  onRowClick={(record) => openDetail(record as TaskData)}
                />
                {isDetailOpen && (
                  <TodoDetail
                    isOpen={isDetailOpen}
                    task={selectedTask}
                    onClose={closeDetail}
                    onDelete={async (id) => {
                      setIsDeleting(true);
                      try {
                        await deleteTodo(id)
                        closeDetail()
                      } finally {
                        setIsDeleting(false);
                      }
                    }}
                    onEdit={handleEditTask}
                    onAddNotes={() => { }}
                    onExport={() => { }}
                    isDeleting={isDeleting}
                    isEditing={isEditing}
                    isExporting={isExporting}
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

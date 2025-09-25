
"use client";
import React from 'react'
import { TodoHeader } from './ToDo-Header';
import { Table } from '@/components/ui/Table';
import { ArrowUp, AlertTriangle, Minus, ChevronUp } from 'lucide-react'
import { tasksData } from '../libs/taskData';
import { TaskData } from '../types/types';
import { TableColumn } from '@/components/ui/Table';
import TodoGridView from './TodoGridView';

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
  },
  {
    key: 'assignedTo',
    title: 'Assigned To',
    dataIndex: 'assignedTo',
    sortable: false,
    avatar: { srcIndex: 'assignedImage', altIndex: 'assignedTo', size: 32 },
  },
  {
    key: 'status',
    title: 'Status',
    dataIndex: 'status',
    sortable: false,
    render: (status) => {
      const cls = {
        'To-Do': 'bg-[#E4E4E7] text-[#3F3F46]',
        'In-Progress': 'bg-[#DBEAFE] text-[#1D4ED8]',
        'Done': 'bg-[#DCFCE7] text-[#166534]',
        'On-Hold': 'bg-[#FFEAD5] text-[#9A3412]',
      }[String(status)] || 'bg-[#E4E4E7] text-[#3F3F46]'
      return (
        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${cls}`}>
          {String(status)}
        </span>
      )
    },
  },
  {
    key: 'priority',
    title: 'Priority',
    dataIndex: 'priority',
    sortable: false,
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
  },
  {
    key: 'lastUpdate',
    title: 'Last Update',
    dataIndex: 'lastUpdate',
    sortable: false,
  },
]


export  default  function TODO  () {
  const [view, setView] = React.useState<'table' | 'grid'>('table');
   return (
    <div>
     <TodoHeader view={view} setView={(view: 'table' | 'grid') => setView(view)} />
     <div className='py-8 px-6 xl:w-[1015px] 2xl:w-full'>
       <div className='rounded-lg border border-[var(--border-gray)] bg-white shadow-sm'>
         {view === 'table' ? (
          <Table columns={taskColumns} data={tasksData} selectable={true} />
         ) : 
         (
           <TodoGridView  />
         )
         }
       </div>
     </div>
    </div>
  )
}


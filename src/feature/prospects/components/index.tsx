"use client"
import React, { useEffect, useState } from 'react'
import { Table } from '@/components/ui/Table';

import { ProspectHeader } from './ProspectHeader'
import { TableColumn } from '@/components/ui/Table'
import { Prospect } from '../types/types'
import ProspectDetail from './ProspectDetail'
import { useProspectsStore } from '../stores/useProspectsStore'
import  ProspectModel from './ProspectModel'

export const prospectsColumns: TableColumn<Prospect>[] = [
  {
    key: 'fullName',
    title: 'Full Name',
    dataIndex: 'fullName',
    sortable: true,
  },
  {
    key: 'company',
    title: 'Company',
    dataIndex: 'company',
    sortable: true,
  },
  {
    key: 'email',
    title: 'Email',
    dataIndex: 'email',
    sortable: false,
  },
  {
    key: 'phone',
    title: 'Phone',
    dataIndex: 'phone',
    sortable: false,
  },
  {
    key: 'owner',
    title: 'Owner',
    dataIndex: 'owner',
    avatar: { srcIndex: 'ownerAvatar', altIndex: 'owner', size: 32 },
  },
  {
    key: 'status',
    title: 'Status',
    dataIndex: 'status',
    render: (status?: Prospect['status']) => {
      const cls: Record<NonNullable<Prospect['status']>, string> = {
        New: 'bg-[#E4E4E7] text-[#3F3F46]',
        Cold: 'bg-[#DBEAFE] text-[#1D4ED8]',
        Qualified: 'bg-green-100 text-green-700',
        Warmlead: 'bg-[#FEF3C7] text-[#92400E]',
        Converted: 'bg-teal-100 text-teal-700',
        Notintrested: 'bg-[#FEE2E2] text-[#B91C1C]',
      };

      const classes = status ? cls[status] : 'bg-gray-100 text-gray-500';

      return (
        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${classes}`}>
          {status ?? 'Unknown'}
        </span>
      );
    },
  },
  {
    key: 'tags',
    title: 'Tags',
    dataIndex: 'tags',
    sortable: false,
    render: (tags?: string[]) => {
      if (!tags || tags.length === 0) return '-';
      return (
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 2).map((tag, index) => (
            <span key={index} className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
              {tag}
            </span>
          ))}
          {tags.length > 2 && (
            <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
              +{tags.length - 2}
            </span>
          )}
        </div>
      );
    },
  },
]

export default function Prospects () {
  const [selected, setSelected] = React.useState<Prospect | null>(null)
  const [open, setOpen] = React.useState(false)
    const [showModal, setShowModal] = React.useState<boolean>(false);
    const [editProspect, setEditProspect] = useState<Prospect | null>(null);
  const [selectedProspects, setSelectedProspects] = React.useState<string[]>([])
  const [selectedProspectRows, setSelectedProspectRows] = React.useState<Prospect[]>([])
  

  const { prospects, fetchProspects, loading, deleteProspect, exportSingleProspect } = useProspectsStore();

  useEffect(() => {
    fetchProspects();
  }, [fetchProspects]);

   const handleEditDeal = (prospect: Prospect) => {
      setEditProspect(prospect);
      setShowModal(true);
      setOpen(false);
    };
  const openDetail = (prospect: Prospect) => { setSelected(prospect); setOpen(true) }
  const closeDetail = () => { setOpen(false); setSelected(null) }

  const handleSelectionChange = (selectedKeys: string[], selectedRows: Prospect[]) => {
    setSelectedProspects(selectedKeys);
    setSelectedProspectRows(selectedRows);
  };

  return (
    <div className='overflow-x-hidden'>
      <ProspectHeader
        selectedProspects={selectedProspects}
        selectedProspectRows={selectedProspectRows}
        onClearSelection={() => {
          setSelectedProspects([]);
          setSelectedProspectRows([]);
        }}
      />
       <div className='py-8 px-6 overflow-x-hidden'>
          <Table 
            columns={prospectsColumns} 
            data={prospects} 
            selectable={true}
            loading={loading}
            onSelectionChange={handleSelectionChange}
            onRowClick={(record) => openDetail(record as Prospect)}
          />
          <ProspectDetail 
            isOpen={open}
            prospect={selected}
            onClose={closeDetail}
            onDelete={async (id: string) => {
              await deleteProspect(id);
              closeDetail();
            }}
            onEdit={handleEditDeal}
            onAddNotes={(id: string) => {
              // Handle add notes logic here
              console.log('Add notes for prospect:', id);
            }}
            onExport={(id: string) => {
              exportSingleProspect(id);
            }}
          />
          <ProspectModel
           open={showModal} onClose={() => setShowModal(false)} mode={editProspect ? 'edit' : 'add'} prospect={editProspect || undefined}/>
        </div>
      </div>
  )
}

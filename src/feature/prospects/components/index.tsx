"use client"
import React, { useEffect, useState } from 'react'
import { Table } from '@/components/ui/Table';

import { ProspectHeader } from './ProspectHeader'
import { TableColumn } from '@/components/ui/Table'
import { Prospect } from '../types/types'
import ProspectDetail from './ProspectDetail'
import { useProspectsStore } from '../stores/useProspectsStore'
import { useUserStore } from '../../user/store/userStore'
import  ProspectModel from './ProspectModel'
import Loading from '@/components/ui/Loading'
import { DateConvertion } from '@/libs/utils/dateConvertion';

export const prospectsColumns: TableColumn<Prospect>[] = [
  {
    key: 'fullName',
    title: 'Full Name',
    dataIndex: 'fullName',
    sortable: true,
  },
    { key: 'company', title: 'Company', dataIndex: 'company', sortable: false, render: (company) => {
      if (!company) return '-';
      if (typeof company === 'string') return company;
      if (typeof company === 'object' && company?.fullName) return company.fullName;
      return 'Unknown Company';
    } },
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
     { key: 'owner', title: 'Owner', dataIndex: 'owner', sortable: false, render: (owner, record) => {
      if (!owner) return 'Unassigned';
      if (typeof owner === 'string') return owner;
      if (typeof owner === 'object' && owner?.name) return owner.name;
      return 'Unknown';
    }, avatar: { srcIndex: 'ownerImage', altIndex: 'owner', size: 32 } },
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
    key: 'lastContact',
    title: 'Last Contact',
    dataIndex: 'lastContact',
    sortable: false,
     render: (_val, record) => {
               const dateString = (record as Prospect )?.lastContact;
                 const time =  DateConvertion(dateString);
                 const lastActivity = time === '-' ? time : `${time} - ${(record as Prospect)?.status}`
                 return lastActivity
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
            <span key={index} className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-gray-800">
              {tag}
            </span>
          ))}
          {tags.length > 2 && (
            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-gray-800">
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
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);


  const { filteredProspects, fetchProspects, loading, isDeleting: storeDeleting, isEditing: storeEditing, isExporting: storeExporting, deleteProspect, exportSingleProspect, initializeOwnerOptions } = useProspectsStore();
  const { fetchUsers, users } = useUserStore();

  // Load users once on mount
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load prospects once on mount
  useEffect(() => {
    fetchProspects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initialize owner options when users are available
  useEffect(() => {
    if (users.length > 0) {
      initializeOwnerOptions();
    }
  }, [users.length, initializeOwnerOptions]);

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
         {loading ? (
           <Loading label="Loading Prospects..." />
         ) : (
           <>
             <Table 
               columns={prospectsColumns} 
               data={filteredProspects} 
               selectable={true}
               onSelectionChange={handleSelectionChange}
               onRowClick={(record) => openDetail(record as Prospect)}
             />
             <ProspectDetail 
               isOpen={open}
               prospect={selected}
               onClose={closeDetail}
               onDelete={async (id: string) => {
                 setIsDeleting(true);
                 try {
                   await deleteProspect(id);
                   closeDetail();
                 } finally {
                   setIsDeleting(false);
                 }
               }}
               onEdit={handleEditDeal}
               onAddNotes={(id: string) => {
                 // Handle add notes logic here
                 console.log('Add notes for prospect:', id);
               }}
               onExport={(id: string) => {
                 setIsExporting(true);
                 try {
                   exportSingleProspect(id);
                 } finally {
                   setIsExporting(false);
                 }
               }}
               isDeleting={isDeleting || storeDeleting}
               isEditing={isEditing || storeEditing}
               isExporting={isExporting || storeExporting}
             />
             <ProspectModel
              open={showModal} onClose={() => setShowModal(false)} mode={editProspect ? 'edit' : 'add'} prospect={editProspect || undefined}/>
           </>
         )}
       </div>
      </div>
  )
}

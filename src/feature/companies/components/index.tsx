"use client"
import React, { useEffect } from 'react'
import { CompaniesHeader } from './CompaniesHeader'
import { Table, TableColumn } from '@/components/ui/Table';
import { Company } from '../types/types';
import { useCompaniesStore } from '../stores/useCompaniesStore';
import CompanieDetail from './CompanieDetail';

export const customerColumns: TableColumn<Company>[] = [
  {
    key: 'fullName',
    title: 'Company Name',
    dataIndex: 'fullName',
    sortable: true,
  },
  {
    key: 'industry',
    title: ' Industry',
    dataIndex: 'industry',
    sortable: false,
  },
  {
    key: 'website',
    title: ' Website',
    dataIndex: 'website',
    sortable: false,
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
    render: (owner: Company['owner']) => owner?.name || owner?.email || 'Unknown',
  },
  {
    key: 'status',
    title: 'Status',
    dataIndex: 'status',
    render: (status?: Company['status']) => {
      const cls: Record<NonNullable<Company['status']>, string> = {
        Active: 'bg-green-100 text-green-700',
        'Follow Up': 'bg-[#FEF3C7] text-[#92400E]',
        'inactive': 'bg-[#FEE2E2] text-[#B91C1C]',
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
    sortable: true,
  },
  {
    key: 'tags',
    title: 'Tags',
    dataIndex: 'tags',
    sortable: false,
  },
]


export default function Companies () {
  const [selected, setSelected] = React.useState<Company | null>(null)
  const [open, setOpen] = React.useState(false)

  const { companies, fetchCompanies, loading, deleteCompany } = useCompaniesStore();

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const openDetail = (c: Company) => { setSelected(c); setOpen(true) }
  const closeDetail = () => { setOpen(false); setSelected(null) }

  return (
    <div className='overflow-x-hidden'>
      <CompaniesHeader/>
      <div className='py-8 px-6 overflow-x-hidden'>

        <Table
          columns={customerColumns}
          data={companies}
          selectable={true}
          onRowClick={(record) => openDetail(record as Company)}
        />
        <CompanieDetail
          isOpen={open}
          company={selected}
          onClose={closeDetail}
          onDelete={async (id: string) => {
            await deleteCompany(id);
            closeDetail();
          }}
          onEdit={(id: string) => {
            // Handle edit logic here
            console.log('Edit company:', id);
          }}
          onAddNotes={(id: string) => {
            // Handle add notes logic here
            console.log('Add notes for company:', id);
          }}
          onExport={(id: string) => {
            // Handle export logic here
            console.log('Export company:', id);
          }}
        />
      </div>
    </div>
  )
}


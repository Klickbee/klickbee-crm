"use client"
import React, { useEffect } from 'react'
import { CompaniesHeader } from './CompaniesHeader'
import { Table, TableColumn } from '@/components/ui/Table';
import { Company } from '../types/types';
import { useCompaniesStore } from '../stores/useCompaniesStore';
import { useUserStore } from '../../user/store/userStore';
import CompanieDetail from './CompanieDetail';
import Loading from '@/components/ui/Loading';

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
        FollowUp: 'bg-[#FEF3C7] text-[#92400E]',
        inactive: 'bg-[#FEE2E2] text-[#B91C1C]',
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
  },
]


export default function Companies () {
  const [selected, setSelected] = React.useState<Company | null>(null)
  const [open, setOpen] = React.useState(false)
  const [editCompany, setEditCompany] = React.useState<Company | null>(null)
  const [showEditModal, setShowEditModal] = React.useState(false)
  const [selectedCompanies, setSelectedCompanies] = React.useState<string[]>([])
  const [selectedCompanyRows, setSelectedCompanyRows] = React.useState<Company[]>([])

  const { companies, filteredCompanies, fetchCompanies, loading, deleteCompany, exportSingleCompany, initializeOwnerOptions } = useCompaniesStore();
  const ownerOptions = useCompaniesStore((s) => s.filters.owner);
  const { fetchUsers, users } = useUserStore();

  // Guard against Strict Mode double-invocation and run once
  const didInitRef = React.useRef(false);
  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    fetchUsers();
    fetchCompanies();
  }, [fetchUsers, fetchCompanies]);

  // Initialize owner options once after users are available
  useEffect(() => {
    if (users && users.length > 0 && ownerOptions.length === 0) {
      initializeOwnerOptions();
    }
  }, [users.length, ownerOptions.length, initializeOwnerOptions]);

  const openDetail = (c: Company) => { setSelected(c); setOpen(true) }
  const closeDetail = () => { setOpen(false); setSelected(null) }
  
  const handleEditCompany = (company: Company) => {
    setEditCompany(company)
    setShowEditModal(true)
    closeDetail() // Close detail modal when opening edit
  }
  
  const closeEditModal = () => {
    setShowEditModal(false)
    setEditCompany(null)
  }

  const handleSelectionChange = (selectedKeys: string[], selectedRows: Company[]) => {
    setSelectedCompanies(selectedKeys);
    setSelectedCompanyRows(selectedRows);
  };

  return (
    <div className='overflow-x-hidden'>
      <CompaniesHeader 
        editCompany={editCompany} 
        showEditModal={showEditModal} 
        onEditCompany={handleEditCompany} 
        onCloseEditModal={closeEditModal}
        selectedCompanies={selectedCompanies}
        selectedCompanyRows={selectedCompanyRows}
        onClearSelection={() => {
          setSelectedCompanies([]);
          setSelectedCompanyRows([]);
        }}
      />
      <div className='py-8 px-6 overflow-x-hidden'>
        {loading ? (
          <Loading label="Loading companies..." />
        ) : (
          <>
            <Table
              columns={customerColumns}
              data={filteredCompanies}
              selectable={true}
              onSelectionChange={handleSelectionChange}
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
              onEdit={(company: Company) => {
                handleEditCompany(company);
              }}
              onAddNotes={(id: string) => {
                // Handle add notes logic here
                console.log('Add notes for company:', id);
              }}
              onExport={(id: string) => {
                exportSingleCompany(id);
              }}
            />
          </>
        )}
      </div>
    </div>
  )
}


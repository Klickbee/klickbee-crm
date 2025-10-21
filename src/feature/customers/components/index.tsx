"use client"
import React, { useEffect } from 'react'
import { CustomerHeader } from './CustomerHeader'
import { Table, TableColumn } from '@/components/ui/Table';
import { Customer } from '../types/types';
import { useCustomersStore } from '../stores/useCustomersStore';
import { useUserStore } from '../../user/store/userStore';
import CustomerDetail from './CustomerDetail';
import Loading from '@/components/ui/Loading';
import { DateConvertion } from '@/libs/utils/dateConvertion';

export const customerColumns: TableColumn<Customer>[] = [
  {
    key: 'fullName',
    title: ' Customer Name',
    dataIndex: 'fullName',
    sortable: true,
  },
  {
    key: 'company',
    title: 'Company Name',
    dataIndex: 'company',
    sortable: false,
    render: (company) => {
      if (!company) return '-';
      if (typeof company === 'string') return company;
      if (typeof company === 'object' && company?.fullName) return company.fullName;
      return 'Unknown Company';
    }
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
    render: (owner) => {
      if (!owner) return 'Unassigned';
      if (typeof owner === 'string') return owner;
      if (typeof owner === 'object' && owner?.name) return owner.name;
      return 'Unknown';
    },
  },
  {
    key: 'status',
    title: 'Status',
    dataIndex: 'status',
  render: (status?: Customer['status']) => {
  const cls: Record<NonNullable<Customer['status']>, string> = {
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
    key: 'createdAt',
    title: 'Last Contact',
    dataIndex: 'createdAt',
    sortable: false,
     render: (_val, record) => {
                  const dateString = (record as Customer )?.lastContact;
                    const time =  DateConvertion(dateString);
                 const company = (record as Customer)?.company;
                 let companyName = 'Unknown Company';

                 if (typeof company === 'string') {
                   companyName = company;
                 } else if (typeof company === 'object' && company !== null && company.fullName) {
                   companyName = company.fullName;
                 }

                 const lastActivity = time === '-' ? time : `${time} - ${companyName}`
                    return lastActivity
                },
  },
  {
    key: 'tags',
    title: 'Tags',
    dataIndex: 'tags',
    sortable: false,
    render: (tags: string[]) => tags?.join(', ') || '-',
  },
]


export default function Customers () {
  const [selected, setSelected] = React.useState<Customer | null>(null)
  const [open, setOpen] = React.useState(false)
  const [editCustomer, setEditCustomer] = React.useState<Customer | null>(null)
  const [showEditModal, setShowEditModal] = React.useState(false)
  const [selectedCustomers, setSelectedCustomers] = React.useState<string[]>([])
  const [selectedCustomerRows, setSelectedCustomerRows] = React.useState<Customer[]>([])

  const { filteredCustomers, fetchCustomers, loading, deleteCustomer, exportSingleCustomer, initializeOwnerOptions } = useCustomersStore();
  const ownerOptions = useCustomersStore((s) => s.filters.owner);
  const { fetchUsers, users } = useUserStore();

  // Guard against Strict Mode double-invocation
  const didInitRef = React.useRef(false);
  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    fetchUsers();
    fetchCustomers();
  }, [fetchUsers, fetchCustomers]);

  // Initialize owner options once after users are available
  useEffect(() => {
    if (users && users.length > 0 && ownerOptions.length === 0) {
      initializeOwnerOptions();
    }
  }, [users.length, ownerOptions.length, initializeOwnerOptions]);

  const openDetail = (c: Customer) => { setSelected(c); setOpen(true) }
  const closeDetail = () => { setOpen(false); setSelected(null) }
  
  const handleEditCustomer = (customer: Customer) => {
    setEditCustomer(customer)
    setShowEditModal(true)
    closeDetail() // Close detail modal when opening edit
  }
  
  const closeEditModal = () => {
    setShowEditModal(false)
    setEditCustomer(null)
  }

  const handleSelectionChange = (selectedKeys: string[], selectedRows: Customer[]) => {
    setSelectedCustomers(selectedKeys);
    setSelectedCustomerRows(selectedRows);
  };

  return (
    <div className='overflow-x-hidden'>
      <CustomerHeader 
        editCustomer={editCustomer} 
        showEditModal={showEditModal} 
        onEditCustomer={handleEditCustomer} 
        onCloseEditModal={closeEditModal}
        selectedCustomers={selectedCustomers}
        onClearSelection={() => {
          setSelectedCustomers([]);
          setSelectedCustomerRows([]);
        }}
      />
<div className='py-8 px-6 overflow-x-hidden'>
                {loading ? (
                  <Loading label="Loading customers..." />
                ) : (
                  <Table 
                    columns={customerColumns} 
                    data={filteredCustomers} 
                    selectable={true}
                    onSelectionChange={handleSelectionChange}
                    onRowClick={(record) => openDetail(record as Customer)}
                  />
                )}
                <CustomerDetail 
                  isOpen={open}
                  customer={selected}
                  onClose={closeDetail}
                  onDelete={async (id: string) => {
                    deleteCustomer(id);
                    closeDetail()
                  }}
                  onEdit={(customer: Customer) => {
                    handleEditCustomer(customer);
                  }}
                  onAddNotes={(id: string) => {
                    // Handle add notes logic here
                    console.log('Add notes for customer:', id);
                  }}
                  onExport={(id: string) => {
                    exportSingleCustomer(id);
                  }}
                />
            </div>
          </div>
  )
}


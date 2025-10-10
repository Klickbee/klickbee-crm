"use client"
import React, { useEffect } from 'react'
import { CustomerHeader } from './CustomerHeader'
import { Table, TableColumn } from '@/components/ui/Table';
import { Customer } from '../types/types';
import { useCustomersStore } from '../stores/useCustomersStore';
import CustomerDetail from './CustomerDetail';

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
    render: (owner: Customer['owner']) => owner?.name || owner?.email || 'Unknown',
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
    sortable: true,
    render: (dateString: string) => {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
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

  const { customers, fetchCustomers, loading, deleteCustomer, exportSingleCustomer } = useCustomersStore();

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

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
        selectedCustomerRows={selectedCustomerRows}
        onClearSelection={() => {
          setSelectedCustomers([]);
          setSelectedCustomerRows([]);
        }}
      />
 <div className='py-8 px-6 overflow-x-hidden'>
             
                <Table 
                  columns={customerColumns} 
                  data={customers} 
                  selectable={true}
                  onSelectionChange={handleSelectionChange}
                  onRowClick={(record) => openDetail(record as Customer)}
                />
                <CustomerDetail 
                  isOpen={open}
                  customer={selected}
                  onClose={closeDetail}
                  onDelete={async (id: string) => {
                    await deleteCustomer(id);
                    closeDetail();
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


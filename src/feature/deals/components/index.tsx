"use client";
import React, { useEffect } from 'react';
import { DealsHeader } from './Deals-Header';
import { Table, TableColumn, Badge } from '@/components/ui/Table';
import { useDealStore } from '../stores/useDealStore'
import { useUserStore } from '../../user/store/userStore'
import Loading from '@/components/ui/Loading'

import GridView from './DealsGridView'
import DealDetail from './DealDetail'
import { Deal } from '../types';
import DealModal from "./DealModal"
import { DateConvertion } from '@/libs/utils/dateConvertion';

const Deals = () => {
  const [view, setView] = React.useState<'table' | 'grid'>('table');
  const [selectedDeal, setSelectedDeal] = React.useState<Deal | null>(null)
  const [isDetailOpen, setIsDetailOpen] = React.useState(false)
  const [showModal, setShowModal] = React.useState<boolean>(false);
  const [editDeal, setEditDeal] = React.useState<Deal | null>(null);
  const [selectedDeals, setSelectedDeals] = React.useState<string[]>([]);
  const [selectedDealRows, setSelectedDealRows] = React.useState<Deal[]>([]);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);

  const { filteredDeals, fetchDeals, loading, deleteDeal, exportSingleDeal, initializeOwnerOptions } = useDealStore();
  const ownerOptions = useDealStore((s) => s.filters.owner);
  const { fetchUsers, users } = useUserStore();

  const columns: TableColumn<Deal>[] = [
    { key: 'dealName', title: 'Deal Name', dataIndex: 'dealName', sortable: true },
    { key: 'company', title: 'Company', dataIndex: 'company', sortable: false, render: (company) => {
      if (!company) return '-';
      if (typeof company === 'string') return company;
      if (typeof company === 'object' && company?.fullName) return company.fullName;
      return 'Unknown Company';
    } },
    { key: 'contact', title: 'Contact', dataIndex: 'contact', sortable: false, render: (contact) => {
      if (!contact) return '-';
      if (typeof contact === 'string') return contact;
      if (typeof contact === 'object' && contact?.fullName) return contact.fullName;
      return 'Unknown Contact';
    } },
    { key: 'stage', title: 'Stage', dataIndex: 'stage', sortable: false, render: (stage) => <Badge variant={stage as any}>{stage === 'Proposal' ? 'Proposal Sent' : stage}</Badge> },
    { key: 'amount', title: 'Amount', dataIndex: 'amount', sortable: false, render: (amount, record) => {
      if (!amount) return '-';

      const currency = (record as any).currency || 'USD';
      const numAmount = amount as number;

      // Show appropriate currency symbol
      const getCurrencySymbol = (curr: string) => {
        switch (curr?.toUpperCase()) {
          case 'EUR': return '€';
          case 'GBP': return '£';
          case 'USD':
          default: return '$';
        }
      };

      const symbol = getCurrencySymbol(currency);
      return `${symbol}${numAmount.toLocaleString()}`;
    } },
    { key: 'owner', title: 'Owner', dataIndex: 'owner', sortable: false, render: (owner, record) => {
      if (!owner) return 'Unassigned';
      if (typeof owner === 'string') return owner;
      if (typeof owner === 'object' && owner?.name) return owner.name;
      const option = ownerOptions.find((opt: any) => opt.value === owner);
      return option ? option.label : 'Unknown';
    }, avatar: { srcIndex: 'ownerImage', altIndex: 'owner', size: 32 } },
    { key: 'closeDate', title: 'Closed Date', dataIndex: 'closeDate', sortable: false, render: (dateString) => {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } },
    { key: 'activity', title: 'Last Activity', dataIndex: 'activity', sortable: false,
        render: (_val, record) => {
            const dateString = (record as Deal)?.lastActivity;
              const time =  DateConvertion(dateString);
              const lastActivity = time === '-' ? time : `${time} - ${(record as Deal)?.stage}`
              return lastActivity
          },
     },
    { key: 'tags', title: 'Tags', dataIndex: 'tags', sortable: false, render: (tags) => Array.isArray(tags) ? tags.join(', ') : tags || '-' },

  ];

  // Guard against Strict Mode double-invocation and split responsibilities
  const didInitRef = React.useRef(false);
  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    fetchUsers();
    fetchDeals();
  }, [fetchUsers, fetchDeals]);

  // Initialize owner options once users are available
  useEffect(() => {
    if (users && users.length > 0 && ownerOptions.length === 0) {
      initializeOwnerOptions();
    }
  }, [users.length, ownerOptions.length, initializeOwnerOptions]);

  const openDetail = (deal: Deal) => {
    setSelectedDeal(deal)
    setIsDetailOpen(true)
  }
  const handleEditDeal = (deal: Deal) => {
    setEditDeal(deal);
    setShowModal(true);
    setIsDetailOpen(false);
  };

  const closeDetail = () => {
    setIsDetailOpen(false)
    setSelectedDeal(null)
  }

  const handleSelectionChange = (selectedKeys: string[], selectedRows: Deal[]) => {
    setSelectedDeals(selectedKeys);
    setSelectedDealRows(selectedRows);
  };
  return (
   <div className=''>
    <DealsHeader 
      view={view} 
      setView={(view: 'table' | 'grid') => setView(view)}
      selectedDeals={selectedDeals}
      selectedDealRows={selectedDealRows}
      onClearSelection={() => {
        setSelectedDeals([]);
        setSelectedDealRows([]);
      }}
    />
    <div className='py-8 px-6 overflow-x-hidden'>

        {view === 'table' ? (
          <>
            {loading ? (
              <Loading label="Loading deals..." />
            ) : (
              <>
                <Table 
                  columns={columns} 
                  data={filteredDeals} 
                  selectable={true}
                  onSelectionChange={handleSelectionChange}
                  onRowClick={(record) => openDetail(record as Deal)}
                />
                <DealDetail 
                  isOpen={isDetailOpen}
                  deal={selectedDeal}
                  onClose={closeDetail}
                  onDelete={async (id) => {
                    setIsDeleting(true);
                    try {
                      await deleteDeal(id);
                      closeDetail();
                    } catch (error) {
                      console.error('Error deleting deal:', error);
                    } finally {
                      setIsDeleting(false);
                    }
                  }}
                  onEdit={async (deal) => {
                    setIsEditing(true);
                    try {
                      handleEditDeal(deal);
                    } catch (error) {
                      console.error('Error editing deal:', error);
                    } finally {
                      setIsEditing(false);
                    }
                  }}
                  onExport={async (id: string) => {
                    setIsExporting(true);
                    try {
                      await exportSingleDeal(id);
                    } catch (error) {
                      console.error('Error exporting deal:', error);
                    } finally {
                      setIsExporting(false);
                    }
                  }}
                  onAddNotes={() => {}}
                  isDeleting={isDeleting}
                  isEditing={isEditing}
                  isExporting={isExporting}
                />
              </>
            )}
          </>
        ) : (
          <GridView  />
        )}
      </div>
      <DealModal open={showModal} onClose={() => setShowModal(false)} mode={editDeal ? 'edit' : 'add'} deal={editDeal || undefined} />
    </div>

  );
};

export default Deals;

"use client";
import React, { useEffect } from 'react';
import { DealsHeader } from './Deals-Header';
import { Table, TableColumn, Badge } from '@/components/ui/Table';
import { DealData } from '../libs/DealsData';
import { useDealStore } from '../stores/useDealStore'
import { useUserStore } from '../../user/store/userStore'
import Loading from '@/components/ui/Loading'

import GridView from './DealsGridView'
import DealDetail from './DealDetail'
import { Deal } from '../types';
import DealModal from "./DealModal"

const columns: TableColumn<Deal>[] = [
  { key: 'dealName', title: 'Deal Name', dataIndex: 'dealName', sortable: true },
  { key: 'company', title: 'Company', dataIndex: 'company', sortable: false },
  { key: 'contact', title: 'Contact', dataIndex: 'contact', sortable: false },
  { key: 'stage', title: 'Stage', dataIndex: 'stage', sortable: false, render: (stage) => <Badge variant={stage as any}>{stage}</Badge> },
  { key: 'amount', title: 'Amount', dataIndex: 'amount', sortable: false, render: (amount, record) => `$${(amount as number).toLocaleString()}` },
  { key: 'owner', title: 'Owner', dataIndex: 'owner', sortable: false, avatar: { srcIndex: 'ownerImage', altIndex: 'owner', size: 32 } },
  { key: 'closeDate', title: 'Closed Date', dataIndex: 'closeDate', sortable: false, render: (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } },
  { key: 'activity', title: 'Last Activity', dataIndex: 'activity', sortable: false },
  { key: 'tags', title: 'Tags', dataIndex: 'tags', sortable: false },


];

const Deals = () => {
  const [view, setView] = React.useState<'table' | 'grid'>('table');
  const [selectedDeal, setSelectedDeal] = React.useState<DealData | null>(null)
  const [isDetailOpen, setIsDetailOpen] = React.useState(false)
  const [showModal, setShowModal] = React.useState<boolean>(false);
  const [editDeal, setEditDeal] = React.useState<Deal | null>(null);
  const [selectedDeals, setSelectedDeals] = React.useState<string[]>([]);
  const [selectedDealRows, setSelectedDealRows] = React.useState<Deal[]>([]);

  const { filteredDeals, fetchDeals, loading, deleteDeal, exportSingleDeal, initializeOwnerOptions } = useDealStore();
  const ownerOptions = useDealStore((s) => s.filters.owner);
  const { fetchUsers, users } = useUserStore();

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

  const openDetail = (deal: DealData) => {
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
   <div className='overflow-x-hidden'>
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
          await deleteDeal(id)
          closeDetail()
        }}
                  onEdit={handleEditDeal}
                  onAddNotes={() => {}}
                  onExport={(id: string) => {
                    exportSingleDeal(id);
                  }}
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

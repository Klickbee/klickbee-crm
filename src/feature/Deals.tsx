"use client";
import React from 'react';
import { DealsHeader } from './deals/components/Deals-Header';
import { Table, TableColumn, Badge } from '@/components/ui/Table';
import { dealsData, DealData } from './deals/libs/DealsData';

const columns: TableColumn<DealData>[] = [
  { key: 'dealName', title: 'Deal Name', dataIndex: 'dealName', sortable: true },
  { key: 'company', title: 'Company', dataIndex: 'company', sortable: true },
  { key: 'contact', title: 'Contact', dataIndex: 'contact', sortable: true },
  { key: 'stage', title: 'Stage', dataIndex: 'stage', sortable: true, render: (stage) => <Badge variant={stage as any}>{stage}</Badge> },
  { key: 'amount', title: 'Amount', dataIndex: 'amount', sortable: true, render: (amount) => `€${amount.toLocaleString()}` },
  { key: 'owner', title: 'Owner', dataIndex: 'owner', sortable: true }
];

const Deals = () => {
  return (
   <div>
    <DealsHeader/>
    <div className='py-8 px-6'>
    <Table columns={columns} data={dealsData} selectable={true} />

    </div>
   </div>
  );
};

export default Deals;

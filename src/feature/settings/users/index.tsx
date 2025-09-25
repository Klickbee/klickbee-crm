"use client";
import React, { useState } from 'react';
import { DealsHeader } from '../../deals/components/Deals-Header';
import { Table, TableColumn, Badge } from '@/components/ui/Table';
import { UserData } from './libs/UserData';
import { UserType } from "./types/types";

import GridView from '../../deals/components/DealsGridView'
import { UsersHeader } from './components/User-Header';
import { Search } from 'lucide-react';
import { DropDown } from '@/components/ui/DropDown';
import AddUser from './components/AddUser';

const columns: TableColumn<UserType>[] = [
  { key: 'name', title: 'Users Name', dataIndex: 'name', sortable: true, avatar: { srcIndex: 'ownerImage', altIndex: 'owner', size: 32 } },
  { key: 'registrationDate', title: 'Registration Date', dataIndex: 'registrationDate', sortable: false },
  { key: 'lastLogin', title: 'Last Login', dataIndex: 'lastLogin', sortable: false },
  {
    key: 'status', title: 'Status', dataIndex: 'status', sortable: false, render: (status) => {
      const cls = {
        'Active': 'bg-[#DCFCE7] text-[#15803D]',
        'Invite Send': 'bg-[#FFEDD5] text-[#C2410C]',
      }[String(status)] || 'bg-[#E4E4E7] text-[#3F3F46]'
      return (
        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${cls}`}>
          {String(status)}
        </span>
      )
    },
  },
];

const statusOptions = [
  { value: "all-status", label: "All Status" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "closed", label: "Closed" },
]

const UsersFeat = () => {
  const [statusOptionsUser, setstatusOptionsUser] = useState('all-status');
  const [addUser, setAddUser] = useState(false);
  const handleAddUser = () => {
    setAddUser((prev) => !prev)
  }
  return (
    <div>
     
      {!addUser ? <>
       <UsersHeader handleAddUser={handleAddUser} />
      <div className=" px-6">
        <div className="border-[#E4E4E7] border-[1px] rounded-xl px-3">
          <div className='flex justify-between my-3'>
            <div className="relative w-[296px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder="Search"
                className="
              pl-9 w-full h-[36px]
              bg-card border border-[var(--border-gray)] rounded-md
              text-sm outline-none shadow-sm
            "
              />
            </div>

            {/* Dropdown */}
            <DropDown
              options={statusOptions}
              value={statusOptionsUser}
              onChange={setstatusOptionsUser}
              className="h-[36px] w-auto"
            />
          </div>

          <div className='rounded-lg border border-[var(--border-gray)] bg-white shadow-sm'>

            <Table columns={columns} data={UserData} selectable={true} />

          </div>

          {/* rows component */}
          <div className='flex justify-between items-center py-3'>
            <p className='font-normal text-sm leading-[20px] tracking-[0px] text-[#71717A] ml-1'>0 of 5 row(s) selected.</p>
            <div className='flex gap-2 items-center'>
              <button className='border-1 border-[#E4E4E7] w-[90px] h-9 rounded-sm font-medium text-sm leading-[20px] tracking-[0px] text-[#09090B] opacity-50 cursor-pointer'>Previous</button>
              <button className='border-1 border-[#E4E4E7] w-[90px] h-9 rounded-sm font-medium text-sm leading-[20px] tracking-[0px] text-[#09090B] opacity-50 cursor-pointer'>Next</button>


            </div>
          </div>
        </div>
      </div>
      </> : <AddUser/> }
    </div>
  );
};

export default UsersFeat;

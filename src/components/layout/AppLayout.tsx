"use client";
import React from 'react'
import SideBar from './SideBar'
import NavBar from './NavBar'
import DashBoard from '@/feature/DashBoard';

const AppLayout = () => {
  return (
    <div className="flex h-[100dvh]"> 
      {/* Sidebar */}
      <SideBar />

      {/* Main content */}
      <div className="flex flex-col flex-1">
        <NavBar />
        <div className="p-6 overflow-y-auto flex-1 scrollbar-hide">
         <DashBoard/>
        </div>
      </div>
    </div>
  )
}
export default AppLayout
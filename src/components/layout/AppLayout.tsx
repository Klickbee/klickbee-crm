"use client";
import React from 'react'
import SideBar from './SideBar'
import NavBar from './NavBar'
import Deals from '@/feature/Deals';

const AppLayout = () => {
  return (
    <div className="flex h-[100dvh]"> 
      {/* Sidebar */}
      <SideBar />

      {/* Main content */}
      <div className="flex flex-col flex-1">
        <NavBar />
        <div className="overflow-y-auto flex-1 scrollbar-hide">
         {/* <DashBoard/> */}
         <Deals/>
        </div>
      </div>
    </div>
  )
}
export default AppLayout
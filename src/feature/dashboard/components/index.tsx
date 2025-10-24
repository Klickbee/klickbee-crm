"use client";
import React, { useState } from 'react'
import { DashboardHeader } from './DashBoard-header'
import DashboardMetrics from './DashboardMetrics'
import PipelineCard from './PipelineCard'
import RecentActivitiesCard from './RecentActivitiesCard'
import TasksCard from './TasksCard'
import AgendaCard from './AgendaCard'

const DashBoard = () => {
  const [selectedTimePeriod, setSelectedTimePeriod] = useState("this_month")

  return (
    <div className='p-6 flex flex-col gap-[16px]'>
       <DashboardHeader
         selectedTimePeriod={selectedTimePeriod}
         onTimePeriodChange={setSelectedTimePeriod}
       />
          <DashboardMetrics range={selectedTimePeriod}/>
        <div className='grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-[16px]'>
          <div className='flex flex-col gap-[16px]'>
            <PipelineCard range={selectedTimePeriod}/>
            <RecentActivitiesCard/>
          </div>
          <div className='flex flex-col gap-[16px]'>
            <TasksCard/>
            <AgendaCard/>
          </div>
        </div>
    </div>
  )
}

export default DashBoard

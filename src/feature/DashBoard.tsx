import React from 'react'
import { DashboardHeader } from './dashboard/components/DashBoard-header'
import DashboardMetrics from './dashboard/components/DashboardMetrics'
import PipelineCard from './dashboard/components/PipelineCard'
import RecentActivitiesCard from './dashboard/components/RecentActivitiesCard'
import TasksCard from './dashboard/components/TasksCard'
import AgendaCard from './dashboard/components/AgendaCard'

const DashBoard = () => {
  return (
    <div className='flex flex-col gap-[16px]'>
       <DashboardHeader/>
          <DashboardMetrics/>
        <div className='grid grid-cols-1 lg:grid-cols-[60.5%_30%] gap-[16px]'>
          <div className='flex flex-col gap-[16px]'>
            <PipelineCard/>
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

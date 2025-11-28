import type React from "react"
import {ReactNode} from "react"

export interface MetricData {
  title: string
  value: string
  change: string
  changeType: "increase" | "decrease"
  icon: React.ReactNode
}

export interface PipelineStage {
  stage: string
  count: number
    color?: string
}

export interface PipelineChartData {
    title: string
    stages: PipelineStage[]
    conversionRates: number[]
}

export interface Activity {
  id: number
  user: string
  initials: string
  action: string
  description: string
  time: string
  avatar: string
}

export interface Task {
  id: number
  title: string
  date: string
  assignee?: string
  assignees?: string[]
  status: "ongoing" | "overdue" | "completed"
  color: string
}

export interface AgendaItem {
  [x: string]: ReactNode
  id: number
  title: string
  date: string
  attendees: string[]
    images: string[] 

}

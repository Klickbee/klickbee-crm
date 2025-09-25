export interface TaskData {
  id: string
  taskName?: string
  linkedTo ?: string
  assignedTo ?: string
  assignedImage?: string
  status ?: 'To-Do' | 'In-Progress' | 'Done' | 'On-Hold'
  priority ?: 'Low' | 'Medium' | 'High' | 'Urgent'
  dueDate ?: string
  lastUpdate ?: string
}

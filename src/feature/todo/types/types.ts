export interface TaskData {
  id: string;
  taskName: string;
  assignedTo?: string | { name: string; assignedImage?: string };
  assignedImage?: string;
  status: 'Todo' | 'InProgress' | 'Done' | 'OnHold';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  dueDate?: string;
  lastUpdate?: string;
  notes?: string;
  files?: Array<{ url: string; name: string; size: number }>;
  ownerId?: string;
  createdAt?: string;
  updatedAt?: string;
  linkedTo?: {
    id: string;
    name?: string;
    email: string;
  }; 
  
}

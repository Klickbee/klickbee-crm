export interface Meeting {
  id?: string;
  title: string;
  description?: string;
  startDate: Date;
  startTime: Date;
  endTime: Date;
  location?: string;
  participants?: string[];
  tags?: string[];
  notes?: string;
  attachedFiles?: string[];
  meetingLink?: string;
  repeatFrequency?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  status?: MeetingStatus;
  files?: File[];
  repeatMeeting?: boolean;
  frequency?: 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';
  repeatOn?: string;
  ends?: 'Never' | 'After' | 'OnDate';
  linkedId?: string;
  assignedId?: string;
  repeatEvery?: number;
  ownerId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  linkedTo?: {
    id: string;
    name?: string;
    email: string;
  }; 
  assignedTo?: {
    id: string;
    name?: string;
    email: string;
  }; 
}

export type ViewType = 'daily' | 'weekly' | 'monthly' | 'yearly';

export type MeetingStatus = "Scheduled" | "Confirmed" | "Cancelled";
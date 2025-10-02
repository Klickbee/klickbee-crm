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
  linkedTo?: string;
  assignedTo?: string;
  repeatEvery?: number;

}

export type ViewType = 'daily' | 'weekly' | 'monthly' | 'yearly';

export type MeetingStatus = "scheduled" | "completed" | "cancelled";
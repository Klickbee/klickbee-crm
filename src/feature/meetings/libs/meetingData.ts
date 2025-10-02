import { Meeting } from '../types/meeting';
export const initialMeetings: Meeting[] = [
  {
    id: '1',
    title: 'Design Sync - Website Revamp',
    description: 'Weekly design sync meeting',
    startTime: new Date(2025, 8, 24, 9, 0), // June 27, 2025, 9:00 AM
    endTime: new Date(2025, 8, 24, 10, 0),
    location: 'Conference Room A',
    participants: ['John Doe', 'Jane Smith'],
    status: 'completed'
  },
  {
    id: '2',
    title: 'Engineering Standup - Payment Systems',
    description: 'Daily engineering standup',
    startTime: new Date(2025, 8, 24, 10, 30),
    endTime: new Date(2025, 8, 24, 11, 0),
    location: 'Zoom',
    participants: ['Alice Johnson', 'Bob Wilson'],
    meetingLink: 'https://zoom.us/j/123456789',
    status: 'cancelled'
  },
  {
    id: '3',
    title: 'Marketing Kick - Social Media Campaign',
    description: 'Kick-off meeting for new social media campaign',
    startTime: new Date(2025, 8, 24, 14, 0),
    endTime: new Date(2025, 8, 24, 15, 0),
    location: 'Marketing Room',
    participants: ['Sarah Davis', 'Mike Brown'],
    status: 'scheduled'
  },
  {
    id: '4',
    title: 'Client Check-in - ABC Partners',
    description: 'Monthly client check-in meeting',
    startTime: new Date(2025, 8, 24, 16, 0),
    endTime: new Date(2025, 8, 24, 17, 0),
    location: 'Client Conference Room',
    participants: ['Tom Wilson', 'Lisa Garcia'],
    status: 'scheduled'
  },
  {
    id: '5',
    title: 'Team Meeting - Q2 Review',
    description: 'Quarterly team review meeting',
    startTime: new Date(2025, 8, 24, 11, 0),
    endTime: new Date(2025, 8, 24, 12, 0),
    location: 'Main Conference Room',
    participants: ['All Team Members'],
    status: 'scheduled'
  }
];
import React from 'react';
import { Meeting } from '../../types/meeting';
import { MeetingCard } from '../MeetingCard';

interface DailyViewProps {
  currentDate: Date;
  meetings: Meeting[];
  onMeetingClick: (meeting: Meeting) => void;
}

export const DailyView: React.FC<DailyViewProps> = ({
  currentDate,
  meetings,
  onMeetingClick,
}) => {
  const dayMeetings = meetings.filter(meeting => {
    const meetingDate = new Date(meeting.startTime);
    return (
      meetingDate.getDate() === currentDate.getDate() &&
      meetingDate.getMonth() === currentDate.getMonth() &&
      meetingDate.getFullYear() === currentDate.getFullYear()
    );
  }).sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="flex">
      {/* Time column */}
      <div className="w-20  border-r border-[var(--border-gray)] py-[32px]">
        {hours.map(hour => (
          <div key={hour} className="h-16 flex items-center justify-center text-xs font-Medium leading-4 ">
            {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
          </div>
        ))}
      </div>
      
      {/* Events column */}
      <div className="flex-1 relative">
        {hours.map(hour => (
          <div key={hour} className="h-16 border-b border-gray-100 relative">
            {dayMeetings
              .filter(meeting => meeting.startTime.getHours() === hour)
              .map((meeting, index) => (
                <div key={meeting.id} className="absolute left-2 right-2" style={{ top: `${index * 60}px` }}>
                  <MeetingCard meeting={meeting} onClick={onMeetingClick} />
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
};
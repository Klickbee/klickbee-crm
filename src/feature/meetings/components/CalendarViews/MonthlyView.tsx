import React from 'react';
import { Meeting } from '../../types/meeting';

interface MonthlyViewProps {
  currentDate: Date;
  meetings: Meeting[];
  onMeetingClick: (meeting: Meeting) => void;
}

export const MonthlyView: React.FC<MonthlyViewProps> = ({
  currentDate,
  meetings,
  onMeetingClick,
}) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());
  
  const days = [];
  for (let i = 0; i < 42; i++) {
    const day = new Date(startDate);
    day.setDate(startDate.getDate() + i);
    days.push(day);
  }

  const getDayMeetings = (date: Date) => {
    return meetings.filter(meeting => {
      const meetingDate = new Date(meeting.startTime);
      return (
        meetingDate.getDate() === date.getDate() &&
        meetingDate.getMonth() === date.getMonth() &&
        meetingDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div>
      {/* Header */}
      <div className="grid grid-cols-7 border-b border-[var(--border-gray)]">
        {weekdays.map(day => (
          <div key={day} className="text-center border-r border-[var(--border-gray)] text-sm font-medium  py-2">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7    ">
        {days.map(day => {
          const dayMeetings = getDayMeetings(day);
          const isCurrentMonth = day.getMonth() === month;
          const isToday = day.toDateString() === new Date().toDateString();
          
          return (
            <div
              key={day.toISOString()}
              className={`min-h-[100px] text-center  p-2 border-b border-r border-[var(--border-gray)]  ${
                !isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'
              } ${isToday ? 'bg-blue-50 border-blue-300' : ''}`}
            >
              <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-900' : ''}`}>
                {day.getDate()}
              </div>
              
              <div className="space-y-1">
                {dayMeetings.slice(0, 3).map(meeting => (
                  <div
                    key={meeting.id}
                    onClick={() => onMeetingClick(meeting)}
                    className="text-xs p-1 bg-blue-100 text-blue-800 rounded cursor-pointer hover:bg-blue-200 transition-colors truncate"
                  >
                    {meeting.startTime.toLocaleTimeString('en-US', { 
                      hour: 'numeric', 
                      minute: '2-digit',
                      hour12: true 
                    })} {meeting.title}
                  </div>
                ))}
                {dayMeetings.length > 3 && (
                  <div className="text-xs text-gray-500">
                    +{dayMeetings.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
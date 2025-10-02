import React from 'react';
import { Meeting } from '../../types/meeting';

interface YearlyViewProps {
  currentDate: Date;
  meetings: Meeting[];
  onMeetingClick: (meeting: Meeting) => void;
}

export const YearlyView: React.FC<YearlyViewProps> = ({
  currentDate,
  meetings,
  onMeetingClick,
}) => {
  const year = currentDate.getFullYear();
  const months = Array.from({ length: 12 }, (_, i) => new Date(year, i, 1));

  const getMonthMeetings = (month: Date) => {
    return meetings.filter(meeting => {
      const meetingDate = new Date(meeting.startTime);
      return (
        meetingDate.getMonth() === month.getMonth() &&
        meetingDate.getFullYear() === month.getFullYear()
      );
    });
  };

  const renderMiniCalendar = (month: Date) => {
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
    const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }

    const monthMeetings = getMonthMeetings(month);

    return (
      <div className="px-3 py-4 flex flex-col gap-4 border-r border-b border-[var(--border-gray)] ">
        <h3 className="text-lg font-semibold text-center ">
          {month.toLocaleDateString('en-US', { month: 'long' })}
        </h3>
        
        <div className="grid grid-cols-7">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
              {day}
            </div>
          ))}
          
          {days.slice(0, 35).map(day => {
            const dayMeetings = monthMeetings.filter(meeting => {
              const meetingDate = new Date(meeting.startTime);
              return meetingDate.getDate() === day.getDate();
            });
            
            const isCurrentMonth = day.getMonth() === month.getMonth();
            const isToday = day.toDateString() === new Date().toDateString();
            
            return (
              <div
                key={day.toISOString()}
                className={`text-center text-xs py-1 ${
                  !isCurrentMonth ? 'text-gray-300' : 'text-gray-700'
                } ${isToday ? 'bg-blue-100 rounded' : ''} ${
                  dayMeetings.length > 0 ? 'bg-blue-50' : ''
                }`}
              >
                {day.getDate()}
                {dayMeetings.length > 0 && (
                  <div className="w-1 h-1 bg-blue-600 rounded-full mx-auto "></div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className=" text-center text-sm text-gray-600">
          {monthMeetings.length} meeting{monthMeetings.length !== 1 ? 's' : ''}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-3  w-full">
      {months.map(month => (
        <div key={month.getMonth()}>
          {renderMiniCalendar(month)}
        </div>
      ))}
    </div>
  );
}
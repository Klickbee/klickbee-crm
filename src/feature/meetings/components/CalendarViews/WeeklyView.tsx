import React from 'react';
import { Meeting } from '../../types/meeting';

interface WeeklyViewProps {
  currentDate: Date;
  meetings: Meeting[];
  onMeetingClick: (meeting: Meeting) => void;
}

export const WeeklyView: React.FC<WeeklyViewProps> = ({
  currentDate,
  meetings,
  onMeetingClick,
}) => {
  const weekStart = new Date(currentDate);
  weekStart.setDate(currentDate.getDate() - currentDate.getDay());
  
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    return day;
  });

  // Generate time slots from 6 AM to 11 PM
  const timeSlots = Array.from({ length: 18 }, (_, i) => i + 6);

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

  const getMeetingAtTimeSlot = (date: Date, hour: number) => {
    const dayMeetings = getDayMeetings(date);
    return dayMeetings.find(meeting => {
      const meetingHour = meeting.startTime.getHours();
      const meetingMinute = meeting.startTime.getMinutes();
      // Check if meeting starts within this hour slot
      return meetingHour === hour || (meetingHour === hour - 1 && meetingMinute >= 30);
    });
  };

  const getMeetingColor = (meeting: Meeting) => {
    // You can customize this based on meeting type, status, or other properties
    const colors = [
      'bg-green-100 text-green-800 border-l-4 border-l-green-500',
      'bg-orange-100 text-orange-800 border-l-4 border-l-orange-500',
      'bg-red-100 text-red-800 border-l-4 border-l-red-500',
      'bg-blue-100 text-blue-800 border-l-4 border-l-blue-500',
      'bg-purple-100 text-purple-800 border-l-4 border-l-purple-500'
    ];
    
    // Use meeting ID or title hash to consistently assign colors
    const colorIndex = Math.abs(meeting.id.charCodeAt(0)) % colors.length;
    return colors[colorIndex];
  };

  const formatTime = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  };

  const formatMeetingTime = (meeting: Meeting) => {
    const start = meeting.startTime.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: false 
    });
    const end = meeting.endTime.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: false 
    });
    return `${start} - ${end}`;
  };

  return (
    <div className="w-full overflow-hidden">
      {/* Header with days */}
      <div className="flex border-b border-gray-200">
        <div style={{width:"13%"}} className="flex items-center justify-center p-4 text-sm font-medium text-gray-500 border-r border-gray-200">
        </div>
        {weekDays.map(day => {
          const isToday = day.toDateString() === new Date().toDateString();
          return (
            <div key={day.toISOString()} style={{width:"13%"}} className=" w-[13.13%] p-4 text-center border-l border-gray-200">
              <div className="text-sm font-medium text-gray-500 uppercase">
                {day.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className={`text-2xl font-semibold mt-1 ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                {day.getDate()}
              </div>
            </div>
          );
        })}
      </div>
      

      {/* Time grid */}
      <div className="relative">
        {timeSlots.map(hour => (
          <div key={hour} className="flex min-h-[100px] border-b border-gray-100" >
            <div className="p-4 text-right text-sm text-gray-500 font-medium border-r border-gray-200" style={{width: '13%'}}>
              {formatTime(hour)}
            </div>
            
            {weekDays.map(day => {
              const meeting = getMeetingAtTimeSlot(day, hour);
              return (
                <div key={`${day.toISOString()}-${hour}`} className="border-l border-gray-200  relative" style={{width: '13%'}}>
                  {meeting && (
                    <div
                      onClick={() => onMeetingClick(meeting)}
                      className={`
                        p-2 rounded-md cursor-pointer transition-all duration-200 hover:shadow-md
                        text-xs font-medium
                        ${getMeetingColor(meeting)}
                      `}
                      style={{width: '90%'}}
                    >
                      <div className="text-xs opacity-90 truncate">
                        {formatMeetingTime(meeting)}
                      </div>
                      <div className="font-semibold mb-1 truncate">
                        {meeting.title}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
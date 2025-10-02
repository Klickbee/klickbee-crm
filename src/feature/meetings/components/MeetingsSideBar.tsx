import React from 'react';
import { ChevronLeft, ChevronRight, Video, Calendar } from 'lucide-react';
import { Meeting } from '../types/meeting';

interface MeetingsSidebarProps {
  meetings: Meeting[];
  currentDate: Date;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onSelectedDateChange: (date: Date) => void;
  onMeetingClick: (meeting: Meeting) => void;
}

export const MeetingsSidebar: React.FC<MeetingsSidebarProps> = ({
  meetings,
  currentDate,
  selectedDate,
  onDateChange,
  onSelectedDateChange,
  onMeetingClick,
}) => {
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    onDateChange(newDate);
  };

  const renderMiniCalendar = () => {
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

    const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    return (
      <div className="bg-white border-b border-[var(--border-gray)] p-4">
        {/* Month header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-900">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => navigateMonth('next')}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekdays.map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.slice(0, 35).map(day => {
            const isCurrentMonth = day.getMonth() === month;
            const isToday = day.toDateString() === new Date().toDateString();
            const isSelected = day.toDateString() === selectedDate.toDateString();
            const dayMeetings = meetings.filter(meeting => {
              const meetingDate = new Date(meeting.startTime);
              return (
                meetingDate.getDate() === day.getDate() &&
                meetingDate.getMonth() === day.getMonth() &&
                meetingDate.getFullYear() === day.getFullYear()
              );
            });

            return (
              <button
                key={day.toISOString()}
                onClick={() => onSelectedDateChange(day)}
                className={`
                  w-8 h-8 text-sm rounded-full transition-colors relative
                  ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-100'}
                  ${isToday ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                  ${isSelected && !isToday ? 'bg-gray-200 text-gray-900' : ''}
                `}
              >
                {day.getDate()}
                {dayMeetings.length > 0 && !isToday && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const getSelectedDateMeetings = () => {
    return meetings.filter(meeting => {
      const meetingDate = new Date(meeting.startTime);
      return (
        meetingDate.getDate() === selectedDate.getDate() &&
        meetingDate.getMonth() === selectedDate.getMonth() &&
        meetingDate.getFullYear() === selectedDate.getFullYear()
      );
    }).sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  };

  const formatMeetingTime = (meeting: Meeting) => {
    const start = meeting.startTime.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
    const end = meeting.endTime.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
    return `${start} - ${end}`;
  };

  const getMeetingStatusColor = (meeting: Meeting) => {
    switch (meeting.status) {
      case 'completed':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  };

  const selectedDateMeetings = getSelectedDateMeetings();

  return (
    <div className="w-full ">
      {/* Mini Calendar */}
      {renderMiniCalendar()}

      {/* All Meetings List */}
      <div className="bg-white rounded-lg p-3">
        <h3 className="font-medium text-gray-900 mb-4 p-2">All Meetings</h3>
        
        {selectedDateMeetings.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No meetings scheduled for this date</p>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedDateMeetings.map((meeting) => (
              <div
                key={meeting.id}
                onClick={() => onMeetingClick(meeting)}
                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border border-[var(--border-gray)]"
              >
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${getMeetingStatusColor(meeting)}`}></div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      {formatMeetingTime(meeting)}
                    </span>
                    {meeting.meetingLink && (
                      <Video className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  
                  <h4 className="font-medium text-gray-900 mb-1 truncate">
                    {meeting.title}
                  </h4>
                  
                  {meeting.meetingLink && (
                    <div className="text-xs text-blue-600 truncate">
                      {meeting.meetingLink}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
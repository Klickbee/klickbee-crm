import React from 'react';
import { Circle, Clock, MapPin, Users, Video } from 'lucide-react';
import { Meeting } from '../types/meeting';

interface MeetingCardProps {
  meeting: Meeting;
  onClick: (meeting: Meeting) => void;
}

export const MeetingCard: React.FC<MeetingCardProps> = ({ meeting, onClick }) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };


  const getStatusColor = () => {
    switch (meeting.status) {
      case 'Confirmed':
        return 'bg-green-100 border-green-300';
      case 'Cancelled':
        return 'bg-red-100 border-red-300';
      case 'Scheduled':
      default:
        return 'bg-blue-100 border-blue-300';
    }
  };
    const getDotColor = () => {
    switch (meeting.status) {
      case 'Confirmed':
        return 'text-green-500';
      case 'Cancelled':
        return 'text-red-500';
      case 'Scheduled':
      default:
        return 'text-blue-400';
    }
  };

  return (
    <div
      onClick={() => onClick(meeting)}
      className={`p-3 rounded-lg border-2 cursor-pointer hover:shadow-md transition-shadow ${getStatusColor()}`}
    >
      <div className="flex items-start justify-between">
        <span className='mx-2 mt-1.5'>

          <Circle size={10} className={`${getDotColor()}`} fill="currentColor" />
        </span>

        <div className="flex-1">

            <div className="flex items-center space-x-1">
              <span>{formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}</span>
                        <Video size={14} className="text-blue-600 ml-3" />

            </div>
          <h3 className="font-medium text-gray-900 mb-1">{meeting.title}</h3>
          
          {meeting.description && (
            <p className="text-sm text-gray-500 mt-2 line-clamp-2">{meeting.description}</p>
          )}
        </div>
      </div>
    </div>
  );
};
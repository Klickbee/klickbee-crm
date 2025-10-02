import React from 'react';
import { Clock, MapPin, Users } from 'lucide-react';
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
      case 'completed':
        return 'bg-green-100 border-green-300';
      case 'cancelled':
        return 'bg-red-100 border-red-300';
      default:
        return 'bg-blue-100 border-blue-300';
    }
  };

  return (
    <div
      onClick={() => onClick(meeting)}
      className={`p-3 rounded-lg border-l-4 cursor-pointer hover:shadow-md transition-shadow ${getStatusColor()}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 mb-1">{meeting.title}</h3>
          
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}</span>
            </div>
            
            {meeting.location && (
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>{meeting.location}</span>
              </div>
            )}
            
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{meeting.participants.length}</span>
            </div>
          </div>
          
          {meeting.description && (
            <p className="text-sm text-gray-500 mt-2 line-clamp-2">{meeting.description}</p>
          )}
        </div>
      </div>
    </div>
  );
};
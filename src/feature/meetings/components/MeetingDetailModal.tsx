'use client'
import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, Users, Link, FileText, Edit, Trash2, Download, Video } from 'lucide-react';
import { MeetingStatus, Meeting } from '../types/meeting';

interface MeetingDetailModalProps {
  isOpen: boolean;
  meeting: Meeting | null;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Meeting>) => void;
  onDelete: (id: string) => void;
}

export const MeetingDetailModal: React.FC<MeetingDetailModalProps> = ({
  isOpen,
  meeting,
  onClose,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(meeting || {} as Meeting);

  if (!isOpen || !meeting) return null;

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleEdit = () => {
    setEditData(meeting);
    setIsEditing(true);
  };

  const handleSave = () => {
    onUpdate(meeting.id, editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(meeting);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this meeting?')) {
      onDelete(meeting.id);
      onClose();
    }
  };

  const getStatusBadge = () => {
    const statusColors: Record<MeetingStatus, string> = {
      scheduled: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[meeting.status || 'scheduled']}`}>
        {(meeting.status || 'scheduled').charAt(0).toUpperCase() + (meeting.status || 'scheduled').slice(1)}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end z-50">
      <div className="bg-white h-full w-96 shadow-lg overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Meeting Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Status and Actions */}
          <div className="flex items-center justify-between">
            {getStatusBadge()}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleEdit}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit Meeting"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete Meeting"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Meeting Title */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {meeting.title}
            </h3>
            {meeting.description && (
              <p className="text-gray-600">{meeting.description}</p>
            )}
          </div>

          {/* Date and Time */}
          <div className="flex items-start space-x-3">
            <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <div className="font-medium text-gray-900">
                {formatDateTime(meeting.startTime)}
              </div>
              <div className="text-sm text-gray-600">
                to {meeting.endTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
              </div>
            </div>
          </div>

          {/* Location */}
          {meeting.location && (
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-gray-400" />
              <span className="text-gray-900">{meeting.location}</span>
            </div>
          )}

          {/* Participants */}
          <div className="flex items-start space-x-3">
            <Users className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <div className="font-medium text-gray-900 mb-1">Participants</div>
              <div className="space-y-1">
                {meeting.participants.map((participant: string, index: number) => (
                  <div key={index} className="text-sm text-gray-600">
                    {participant}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Meeting Link */}
          {meeting.meetingLink && (
            <div className="flex items-center space-x-3">
              <Video className="w-5 h-5 text-gray-400" />
              <a 
                href={meeting.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                Join Meeting
              </a>
            </div>
          )}

          {/* Notes */}
          {meeting.notes && (
            <div className="flex items-start space-x-3">
              <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <div className="font-medium text-gray-900 mb-1">Notes</div>
                <div className="text-sm text-gray-600 whitespace-pre-wrap">
                  {meeting.notes}
                </div>
              </div>
            </div>
          )}

          {/* Attached Files */}
          {meeting.attachedFiles && meeting.attachedFiles.length > 0 && (
            <div className="flex items-start space-x-3">
              <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <div className="font-medium text-gray-900 mb-2">Attached Files</div>
                <div className="space-y-2">
                  {meeting.attachedFiles.map((file: any, index: number) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <Download className="w-4 h-4 text-gray-400" />
                      <span className="text-blue-600 hover:text-blue-800 cursor-pointer">
                        {file}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Activity Log */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="font-medium text-gray-900 mb-3">Activity Log</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-900">Created by Thomas Schmidt</div>
                  <div className="text-xs text-gray-500">Mar 28, 2025</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Edit className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-900">Last modified by Claire Bryant</div>
                  <div className="text-xs text-gray-500">Mar 29, 2025</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-900">Invite pending to ConfSweet</div>
                  <div className="text-xs text-gray-500">Just now</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
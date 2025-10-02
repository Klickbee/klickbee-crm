'use client';
import React from 'react';
import {
  X,
  MapPin,
  Video,
  Tag,
  Link as LinkIcon,
  User,
  Repeat,
  Download,
  Delete,
  Trash2,
  NotebookPenIcon,
  Edit,
  Calendar,
  CalendarClock,
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { Meeting, MeetingStatus } from '../types/meeting';

interface MeetingDetailModalProps {
  isOpen: boolean;
  meeting: Meeting | null;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Meeting>) => void;
  onDelete: (id: string) => void;
  onReschedule?: (id: string) => void;
  onEdit?: (id: string) => void; // new: open edit form
}

export const MeetingDetailModal: React.FC<MeetingDetailModalProps> = ({
  isOpen,
  meeting,
  onClose,
  onUpdate,
  onDelete,
  onReschedule,
  onEdit,
}) => {
  if (!isOpen || !meeting) return null;

  const formatDateTime = (date: Date) =>
    new Date(date).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

  const getStatusBadge = (status?: MeetingStatus) => {
    const statusColors: Record<MeetingStatus, string> = {
      scheduled: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${
          statusColors[status || 'scheduled']
        }`}
      >
        {(status || 'scheduled').charAt(0).toUpperCase() +
          (status || 'scheduled').slice(1)}
      </span>
    );
  };

  return (
    <Modal open={isOpen} onClose={onClose}>
      <div className="bg-white w-[400px] fixed right-0 top-0 h-full shadow-lg overflow-y-auto ">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {meeting.title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Overview */}
          <section>
            <h3 className="font-medium text-gray-900 mb-4">Meeting Overview</h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-center">
                <span className="w-28 font-medium">Status</span>:
                <span className="ml-2">{getStatusBadge(meeting.status)}</span>
              </div>
              <div className="flex items-center">
                <span className="w-28 font-medium">Date &amp; Time</span>:
                <span className="ml-2">
                  {formatDateTime(meeting.startTime)} –{' '}
                  {new Date(meeting.endTime).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </span>
              </div>
              {meeting.assignedTo && (
                <div className="flex items-center">
                  <span className="w-28 font-medium">Assigned To</span>:
                  <span className="ml-2 flex items-center">
                    <User className="w-4 h-4 mr-1 text-gray-400" />
                    {meeting.assignedTo}
                  </span>
                </div>
              )}
              {meeting?.participants && meeting.participants?.length > 0 && (
                <div className="flex items-start">
                  <span className="w-28 font-medium">Participants</span>:
                  <div className="ml-2">{meeting.participants.join(', ')}</div>
                </div>
              )}
              {meeting.location && (
                <div className="flex items-center">
                  <span className="w-28 font-medium">Location</span>:
                  <span className="ml-2 flex items-center">
                    <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                    {meeting.location}
                  </span>
                </div>
              )}
              {meeting.meetingLink && (
                <div className="flex items-center">
                  <span className="w-28 font-medium">Link</span>:
                  <a
                    href={meeting.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-blue-600 hover:underline flex items-center"
                  >
                    <Video className="w-4 h-4 mr-1" />
                    {meeting.meetingLink}
                  </a>
                </div>
              )}
              {meeting.linkedTo && (
                <div className="flex items-center">
                  <span className="w-28 font-medium">Linked To</span>:
                  <span className="ml-2 flex items-center">
                    <LinkIcon className="w-4 h-4 mr-1 text-gray-400" />
                    {meeting.linkedTo}
                  </span>
                </div>
              )}
              {meeting?.tags && meeting.tags?.length > 0 && (
                <div className="flex items-center">
                  <span className="w-28 font-medium">Tags</span>:
                  <div className="ml-2 flex gap-2 flex-wrap">
                    {meeting.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs flex items-center"
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {meeting.repeatFrequency && meeting.repeatFrequency !== 'none' && (
                <div className="flex items-center">
                  <span className="w-28 font-medium">Recurs</span>:
                  <span className="ml-2 flex items-center">
                    <Repeat className="w-4 h-4 mr-1 text-gray-400" />
                    Every {meeting.repeatEvery || 1}{' '}
                    {meeting.repeatFrequency}
                    {meeting.repeatOn && ` on ${meeting.repeatOn}`}
                  </span>
                </div>
              )}
              {meeting.ends && (
                <div className="flex items-center">
                  <span className="w-28 font-medium">Ends</span>:
                  <span className="ml-2">{meeting.ends}</span>
                </div>
              )}
            </div>
          </section>

          {/* Description */}
          {meeting.description && (
            <section>
              <h3 className="font-medium text-gray-900 mb-2">Description</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {meeting.description}
              </p>
            </section>
          )}

          {/* Notes */}
          {meeting.notes && (
            <section>
              <h3 className="font-medium text-gray-900 mb-2">Notes</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {meeting.notes}
              </p>
            </section>
          )}

          {/* Attached Files */}
          {meeting?.attachedFiles && meeting.attachedFiles?.length > 0 && (
            <section>
              <h3 className="font-medium text-gray-900 mb-2">Attached Files</h3>
              <div className="space-y-2">
                {meeting.attachedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md"
                  >
                    <span className="text-sm text-blue-600">{file}</span>
                    <button className="flex items-center text-gray-600 hover:text-gray-800">
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Activity Log */}
          {(meeting as any).activityLog?.length > 0 && (
            <section>
              <h3 className="font-medium text-gray-900 mb-2">Activity Log</h3>
              <div className="space-y-3 text-sm">
                {(meeting as any).activityLog.map(
                  (
                    log: { action: string; user: string; timestamp: Date },
                    idx: number
                  ) => (
                    <div key={idx} className="flex items-start">
                      <div className="flex-1">
                        <div className="text-gray-900">
                          {log.action} by {log.user}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </section>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between gap-3 border-t border-gray-200 px-6 py-4">
          <div>
            <button
              onClick={() => onDelete(meeting.id!)}
              className="p-2 text-sm font-medium rounded-lg text-red-500 border border-red-500"
            >
              <Trash2 className='h-4 w-4'/>
            </button>
          </div>
          <div className='flex gap-4'>
            <button
              onClick={() => onEdit?.(meeting.id!)}
              className="flex justify-center items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              <Edit className='h-4 w-4' />
              Edit Meeting
            </button>
            <button
              onClick={() => onReschedule?.(meeting.id!)}
              className="flex justify-center items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              <CalendarClock className='h-4 w-4'/>
              Reschedule
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

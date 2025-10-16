'use client';
import React from 'react';
import {
  MapPin,
  Video,
  Tag,
  Link as LinkIcon,
  User,
  Repeat,
  Download,
} from 'lucide-react';
import DetailModal from '@/components/detailPage';
import { Meeting, MeetingStatus } from '../types/meeting';

interface MeetingDetailModalProps {
  isOpen: boolean;
  meeting: Meeting | null;
  onClose: () => void;
  onDelete?: (id: string) => void;
  onEdit?: (meeting: Meeting) => void;
  onReschedule?: (id: string) => void;
  onAddNotes?: (id: string) => void;
  onExport?: (id: string) => void;
  isDeleting?: boolean;
  isEditing?: boolean;
  isExporting?: boolean;
}

// Helper function to render status badge
const renderStatusBadge = (status?: MeetingStatus) => {
  const cls: Record<NonNullable<MeetingStatus>, string> = {
    Scheduled: 'bg-blue-100 text-blue-800',    // Orange background for scheduled
    Confirmed: 'bg-blue-100 text-blue-800',       // Blue background for confirmed
    Cancelled: 'bg-red-100 text-red-800',         // Red background for cancelled
  };

  const classes = status ? cls[status] : 'bg-gray-100 text-gray-500';

  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${classes}`}>
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
    </span>
  );
};

export const MeetingDetailModal: React.FC<MeetingDetailModalProps> = ({
  isOpen,
  meeting,
  onClose,
  onDelete,
  onEdit,
  onReschedule,
  onAddNotes,
  onExport,
  isDeleting = false,
  isEditing = false,
  isExporting = false,
}) => {
  if (!meeting) return null;

  const formatDateTime = (date: Date) =>
    new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

  const formatTimeRange = (startTime: Date, endTime: Date) => {
    const start = formatDateTime(startTime);
    const end = new Date(endTime).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    return `${start} – ${end}`;
  };

  const formatNextOccurrence = (date: Date | string) => {
    const nextDate = new Date(date);
    return nextDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const details = [
    { label: "Status", value: renderStatusBadge(meeting.status) },
    { 
      label: "Date & Time", 
      value: formatTimeRange(meeting.startTime, meeting.endTime)
    },
    meeting.assignedTo && {
      label: "Assigned To",
      value: (
        <span className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs">
          </span>
          {meeting.assignedTo.name || meeting.assignedTo.email }
        </span>
      ),
    },
    meeting?.participants && meeting.participants?.length > 0 && {
      label: "Participant",
      value: meeting.participants.join(', ')
    },
    meeting.location && {
      label: "Location",
      value: (
        <span className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          {meeting.location}
        </span>
      ),
    },
    meeting.meetingLink && {
      label: "Link/Location",
      value: (
        <a
          href={meeting.meetingLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline flex items-center gap-1"
        >
          <Video className="w-4 h-4" />
          {meeting.meetingLink}
        </a>
      ),
    },
    meeting.linkedTo && {
      label: "Linked To",
      value: (
        <span className="flex items-center gap-2">
          <LinkIcon className="w-4 h-4 text-gray-400" />
          {meeting.linkedTo.name || meeting.linkedTo.email || undefined}
        </span>
      ),
    },
    meeting?.tags && meeting.tags?.length > 0 && {
      label: "Tags",
      value: (
        <div className="flex flex-wrap gap-1">
          {meeting.tags.map((tag, index) => (
            <span key={index} className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
              <Tag className="w-3 h-3 mr-1" />
              {tag}
            </span>
          ))}
        </div>
      )
    },
    meeting.repeatMeeting && {
      label: "Recurs",
      value: (
        <span className="flex items-center gap-2">
          <Repeat className="w-4 h-4 text-gray-400" />
          {meeting.frequency ? `${meeting.frequency}` : `Every ${meeting.repeatEvery || 1} days`}
          {meeting.repeatOn && ` on ${meeting.repeatOn}`}
        </span>
      ),
    },
    // Add Next Occurrence field for recurring meetings
    meeting.repeatMeeting && {
      label: "Next Occurrence",
      value: formatNextOccurrence(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) // Example: next week
    },
    meeting.ends && {
      label: "Ends",
      value: meeting.ends === 'Never' ? 'Never' : 
             meeting.ends === 'After' ? 'After occurrences' :
             meeting.ends === 'OnDate' ? formatNextOccurrence(meeting.ends) : 
             meeting.ends
    },
    meeting.description !== undefined && meeting.description !== null && {
      label: "Description",
      value: (
        <p className="text-sm whitespace-pre-wrap">
          {meeting.description || "No description added"}
        </p>
      )
    },
    meeting.notes !== undefined && meeting.notes !== null && {
      label: "Notes",
      value: (
        <p className="text-sm whitespace-pre-wrap">
          {meeting.notes || "No notes added"}
        </p>
      )
    },
    meeting?.files && Array.isArray(meeting.files) && meeting.files.length > 0 && {
      label: "Attached Files",
      value: (
        <div className="space-y-2">
          {(meeting.files as any[]).map((file, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md"
            >
              <span className="text-sm text-blue-600">{typeof file === 'string' ? file : file.name || `File ${idx + 1}`}</span>

            </div>
          ))}
        </div>
      )
    },
  ].filter(Boolean) as { label: string; value: React.ReactNode }[];

  return (
    <DetailModal
      isOpen={isOpen}
      title={meeting.title ?? "Meeting Details"}
      notes={meeting.notes}
      details={details}
      attachments={meeting.files?.map(file => file.url) ?? []}
      onClose={onClose}
      onDelete={onDelete && meeting.id ? () => onDelete(meeting.id!) : undefined}
      onEdit={onEdit ? () => onEdit(meeting as Meeting) : undefined}
      editLabel="Edit Meeting"
      onReschedule={onReschedule && meeting.id ? () => onReschedule(meeting.id!) : undefined}
      isDeleting={isDeleting}
      isEditing={isEditing}
      isExporting={isExporting}
    />
  );
};

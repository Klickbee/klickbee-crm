'use client';
import React from 'react';
import { X } from 'lucide-react';
import Modal from '@/components/ui/Modal';

export interface DetailItem {
  label: string;
  value: React.ReactNode; // can be text, JSX, badges, etc.
  fullWidth?: boolean;    // if you need it to span full width (e.g., multi-line)
}

interface DetailModalProps {
  isOpen: boolean;
  title: string;
  details: DetailItem[]; // Dynamic key-value fields
  description?: string;
  notes?: string;
  attachments?: string[];
  activityLog?: { action: string; user: string; timestamp: Date }[];
  onClose: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  onReschedule?: () => void;
}

const DetailModal: React.FC<DetailModalProps> = ({
  isOpen,
  title,
  details,
  description,
  notes,
  attachments,
  activityLog,
  onClose,
  onDelete,
  onEdit,
  onReschedule,
}) => {
  if (!isOpen) return null;

  return (
    <Modal open={isOpen} onClose={onClose}>
      <div className="bg-white w-[400px] fixed right-0 top-0 h-full shadow-lg overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Dynamic Details */}
          <section>
            <h3 className="font-medium text-gray-900 mb-4">Details</h3>
            <div className="space-y-3 text-sm text-gray-700">
              {details.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex ${item.fullWidth ? 'items-start' : 'items-center'}`}
                >
                  <span className="w-28 font-medium">{item.label}</span>:
                  <span className="ml-2">{item.value}</span>
                </div>
              ))}
            </div>
          </section>

          {description && (
            <section>
              <h3 className="font-medium text-gray-900 mb-2">Description</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{description}</p>
            </section>
          )}

          {notes && (
            <section>
              <h3 className="font-medium text-gray-900 mb-2">Notes</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{notes}</p>
            </section>
          )}

          {attachments && attachments.length > 0 && (
            <section>
              <h3 className="font-medium text-gray-900 mb-2">Attachments</h3>
              <div className="space-y-2">
                {attachments.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md"
                  >
                    <span className="text-sm text-blue-600">{file}</span>
                    <button className="text-gray-600 hover:text-gray-800">
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activityLog && activityLog.length > 0 && (
            <section>
              <h3 className="font-medium text-gray-900 mb-2">Activity Log</h3>
              <div className="space-y-3 text-sm">
                {activityLog.map((log, idx) => (
                  <div key={idx}>
                    <div className="text-gray-900">
                      {log.action} by {log.user}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        {(onDelete || onEdit || onReschedule) && (
          <div className="flex justify-between gap-3 border-t border-gray-200 px-6 py-4">
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-2 text-sm font-medium rounded-lg text-red-500 border border-red-500"
              >
                Delete
              </button>
            )}
            <div className="flex gap-4">
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50"
                >
                  Edit
                </button>
              )}
              {onReschedule && (
                <button
                  onClick={onReschedule}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50"
                >
                  Reschedule
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default DetailModal;

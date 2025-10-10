'use client';
import React from 'react';
import { Delete, Download, Edit, Plus, Trash2, X } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { Button } from '../ui/Button';

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
  onAddNotes?: () => void;
  onExport?: () => void;
  editLabel?: string;
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
  onAddNotes,
  onExport,
  editLabel,
}) => {
  if (!isOpen) return null;

  return (
    <Modal open={isOpen} onClose={onClose}>
      <div className="bg-white w-[455px] fixed right-0 top-0 h-full shadow-lg overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-gray)]">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        


        <div >
          {/* Dynamic Details */}
          <div className='border-b border-[var(--border-gray)]'>

          <section className='p-6 space-y-8' >
            <h3 className="font-medium text-gray-900 mb-4">Project Overview</h3>
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
          </div>
<div className='border-b border-[var(--border-gray)]'>

          {description && (
            <section className='p-6 space-y-8'>
              <h3 className="font-medium text-gray-900 mb-2">Description</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{description}</p>
            </section>
          )}
</div>
<div className='border-b border-[var(--border-gray)]'>

          {notes && (
            <section className='p-6 space-y-8'> 
              <h3 className="font-medium text-gray-900 mb-2">Notes</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{notes}</p>
            </section>
          )}
</div>

<div className='border-b border-[var(--border-gray)]'>

          <section className='p-6 space-y-8'>
            <h3 className="font-medium text-gray-900 mb-2">Attached Files</h3>
            {attachments && attachments.length > 0 ? (
              <div className="space-y-2">
                {attachments.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md"
                  >
                    <span className="text-sm text-blue-600 truncate">{file}</span>
                    <button
                      className="text-gray-600 hover:text-gray-800"
                    >
                      Download
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500">No attached files</div>
            )}
          </section>
</div>



          <section className='p-6 space-y-8'>
            <h3 className="font-medium text-gray-900 mb-2">Status Log</h3>
            {activityLog && activityLog.length > 0 ? (
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
            ) : (
              <div className="text-sm text-gray-500">No Status yet</div>
            )}
          </section>

        </div>
<div className=''>

        {/* Footer */}
        {(onDelete || onEdit || onReschedule || onAddNotes || onExport) && (
          <div className="flex justify-between gap-2 border-t border-gray-200 px-3 py-4">
            {onDelete && (
              <Button
                onClick={onDelete}
                className="p-1 text-sm font-medium rounded-lg text-red-500 border border-red-500"
              >
                <Trash2 size={15}/>
              </Button>
            )}
            <div className="flex gap-2">
                {onExport && (
                <Button
                  onClick={onExport}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50"
                >
                  <img src="\icons\File.svg" alt="Export" className='h-4 w-4' />
                  Export        
                   </Button>
              )}
              {onEdit && (
                <Button
                  onClick={onEdit}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 whitespace-nowrap"
                >
                  <Edit size={15}/>
                  {editLabel || "Edit Deal"}                </Button>
              )}
              {onReschedule && (
                <Button
                  onClick={onReschedule}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50"
                >
                  Reschedule
                </Button>
              )}
              {onAddNotes && (
                <Button
                  onClick={onAddNotes}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 whitespace-nowrap"
                >
                  <Plus size={15}/>
                  Add Notes
                </Button>
              )}
            
            </div>
          </div>
        )}
</div>
</div>
    </Modal>
  );
};

export default DetailModal;

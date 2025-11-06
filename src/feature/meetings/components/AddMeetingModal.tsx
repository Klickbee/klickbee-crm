'use client'
import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Meeting } from '../types/meeting';
import { cn } from '@/libs/utils';
import MeetingForm from './MeetingForm';
import Modal from '@/components/ui/Modal';
import { useMeetingsStore } from '../stores/useMeetingsStore';
import { useUserStore } from '@/feature/user/store/userStore';

interface AddMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (meeting: Omit<Meeting, 'id'>) => void;
  mode?: 'add' | 'edit';
  meeting?: Meeting;
}

export const AddMeetingModal: React.FC<AddMeetingModalProps> = ({
  isOpen,
  onClose,
  mode = 'add',
  meeting,
}) => {
  const { addMeeting, updateMeeting } = useMeetingsStore();
    const { users, loading: usersLoading, fetchUsers } = useUserStore();
    
      useEffect(() => {
          if (users.length === 0) {
              fetchUsers();
          }
      }, [users]);
    
      // Create user options for the dropdown
      const userOptions = users.map((user: any) => ({
          id: user.id,
          value: user.id,
          label: user.name || user.email
      }));
  
  if (!isOpen) return null;
  const handleSubmit = async (values: any) => {
    try {
      if (mode === 'edit' && meeting) {
        // Use store function to update the meeting
        await updateMeeting(meeting.id!, values);
      } else {
        const selectedOwner = userOptions.find(user => user.id === values.linkedTo);
        
        await addMeeting(values);
      }
      onClose();
    } catch (error) {
      console.error(`Error ${mode === 'edit' ? 'updating' : 'creating'} meeting:`, error);
    }
  }

  return (
    <Modal open={isOpen} onClose={onClose}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="deal-slide-title"
        className={cn(
          "pointer-events-auto fixed right-0 top-0 h-full bg-card border-l shadow-xl flex flex-col bg-white overflow-hidden overflow-y-auto",
          "transition-transform duration-300 will-change-transform",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
        style={{ width: "400px" }} // exact width as requested
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'edit' ? 'Update Meeting' : 'Add New Meeting'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <MeetingForm
          onSubmit={(values: any) => {
            handleSubmit(values);
          }}
          onClose={onClose}
          mode={mode}
          initialData={meeting}
            usersLoading={usersLoading}
            userOptions={userOptions}
        />

      </aside>
    </Modal>
  );
};
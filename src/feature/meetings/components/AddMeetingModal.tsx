'use client'
import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, Users, Link, FileText, Tag } from 'lucide-react';
import { Meeting } from '../types/meeting';
import { cn } from '@/libs/utils';
import MeetingForm from './MeetingForm';

interface AddMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (meeting: Omit<Meeting, 'id'>) => void;
}

export const AddMeetingModal: React.FC<AddMeetingModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  return (
    <div className={cn(
      "pointer-events-none fixed inset-0 z-50 transition-[background-color] duration-200",
      isOpen ? "bg-black/40" : "bg-transparent",
    )}
      aria-hidden={!isOpen}
      onClick={(e) => {
        // Close when clicking the backdrop only
        if ((e.target as HTMLElement).id === "deal-backdrop") onClose()
      }}
      id="deal-backdrop"
      style={{ visibility: isOpen ? "visible" : "hidden" }}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="deal-slide-title"
        className={cn(
          "pointer-events-auto fixed right-0 top-0 h-full bg-card border-l border-border shadow-xl flex flex-col bg-white overflow-hidden overflow-y-auto",
          "transition-transform duration-300 will-change-transform",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
        style={{ width: "400px" }} // exact width as requested
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add New Meeting</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <MeetingForm
          onSubmit={(values: any) => {
            console.log("Meeting saved:", values);
          }}
          onClose={() => console.log("Closed")}
        />

      </aside>
    </div>
  );
};
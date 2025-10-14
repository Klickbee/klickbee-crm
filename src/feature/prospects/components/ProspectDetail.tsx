"use client";
import React from "react";
import DetailModal from "@/components/detailPage";
import type { Prospect } from "../types/types";
import AvatarInitials from "@/components/ui/AvatarInitials";

// Helper function to render status badge
const renderStatusBadge = (status?: Prospect['status']) => {
  const cls: Record<NonNullable<Prospect['status']>, string> = {
    New: 'bg-[#E4E4E7] text-[#3F3F46]',
    Cold: 'bg-[#DBEAFE] text-[#1D4ED8]',
    Qualified: 'bg-green-100 text-green-700',
    Warmlead: 'bg-[#FEF3C7] text-[#92400E]',
    Converted: 'bg-teal-100 text-teal-700',
    Notintrested: 'bg-[#FEE2E2] text-[#B91C1C]',
  };

  const classes = status ? cls[status] : 'bg-gray-100 text-gray-500';

  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${classes}`}>
      {status ?? 'Unknown'}
    </span>
  );
}

interface ProspectDetailProps {
  isOpen: boolean;
  prospect: Prospect | null;
  onClose: () => void;
  onEdit?: (prospect:Prospect ) => void;
  
  onDelete?: (id: string) => void;
  onAddNotes?: (id: string) => void;
  onExport?: (id: string) => void;
}

export default function ProspectDetail({
  isOpen,
  prospect,
  onClose,
  onDelete,
  onEdit,
  onAddNotes,
  onExport,
}: ProspectDetailProps) {
  if (!prospect) return null;

  const details = [
    { label: "Status", value: renderStatusBadge(prospect.status) },
    {
      label: "Owner",
      value: (
        <span className="flex items-center gap-2">
          <AvatarInitials
            name={typeof prospect.owner === 'object' ? prospect.owner?.name ?? '' : String(prospect.owner ?? '')}
            size={24}
          />
          {typeof prospect.owner === 'object' ? prospect.owner?.name : prospect.owner ?? "-"}

        </span>
      ),
    },
    { label: "Company", value: prospect.company ?? "-" },
    { label: "Email", value: prospect.email ?? "-" },
    { label: "Phone", value: prospect.phone ?? "-" },
    prospect.tags && prospect.tags.length > 0 && {
      label: "Tags",
      value: (
        <div className="flex flex-wrap gap-1">
          {prospect.tags.map((tag, index) => (
            <span key={index} className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
              {tag}
            </span>
          ))}
        </div>
      )
    },
  ].filter(Boolean) as { label: string; value: React.ReactNode }[];

  return (
    <DetailModal
      isOpen={isOpen}
      title={prospect.fullName ?? "Prospect Details"}
      details={details}
      onClose={onClose}
      onDelete={onDelete ? () => onDelete(prospect.id) : undefined}
        onEdit={onEdit ? () => onEdit(prospect as Prospect) : undefined}
           editLabel="Edit Prospect"
      onAddNotes={onAddNotes ? () => onAddNotes(prospect.id) : undefined}
      onExport={onExport ? () => onExport(prospect.id) : undefined}
    />
  );
}

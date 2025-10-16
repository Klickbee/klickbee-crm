'use client';
import React from 'react';
import DetailModal from '@/components/detailPage'; // the reusable modal we built earlier
import { DealData } from '../libs/DealsData';
import { Badge } from '@/components/ui/Table';
import { Deal } from '../types';
import AvatarInitials from '@/components/ui/AvatarInitials'

interface DealDetailProps {
  isOpen: boolean;
  deal: DealData | null;
  onClose: () => void;
  onDelete?: (id: string) => void;
  onEdit?: (deal: Deal) => void;
  onAddNotes?: (id: string) => void;
  onExport?: (id: string) => void;
  isDeleting?: boolean;
  isEditing?: boolean;
  isExporting?: boolean;
}

export default function DealDetail({
  isOpen,
  deal,
  onClose,
  onDelete,
  onEdit,
  onAddNotes,
  onExport,
  isDeleting = false,
  isEditing = false,
  isExporting = false,
}: DealDetailProps) {
  if (!deal) return null;

  const details = [
    { label: 'Company', value: deal.company },
    { label: 'Contact', value: deal.contact },
    { label: 'Stage', value: (<Badge variant={deal.stage}>{deal.stage}</Badge>) },
    { label: 'Amount', value: `$${deal.amount.toLocaleString()}` },
    {
      label: 'Owner',
      value: (
        <span className="flex items-center gap-2">
          <AvatarInitials name={deal.owner} size={24} />
          {deal.owner}
        </span>
      ),
    },
    deal.priority && { label: 'Tags', value: deal.priority },
    deal.date && { label: 'Closed Date', value: deal.date },

  ].filter(Boolean) as { label: string; value: React.ReactNode }[];

  return (
    <DetailModal
      isOpen={isOpen}
      title={deal.dealName}
      details={details}
      notes={deal.notes}
      attachments={deal.attachments ?? []}
      onClose={onClose}
      onDelete={onDelete ? () => onDelete(deal.id) : undefined}
      onEdit={onEdit ? () => onEdit(deal as Deal) : undefined}
      onExport={onExport ? () => onExport(deal.id) : undefined}
      editLabel="Edit Deal"
      onAddNotes={onAddNotes ? () => onAddNotes(deal.id) : undefined}
      isDeleting={isDeleting}
      isEditing={isEditing}
      isExporting={isExporting}
    />
  );
}

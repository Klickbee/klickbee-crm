'use client';
import React from 'react';
import DetailModal from '@/components/detailPage'; // the reusable modal we built earlier
import { DealData } from '../libs/DealsData';
import { User } from 'lucide-react';

interface DealDetailProps {
  isOpen: boolean;
  deal: DealData | null;
  onClose: () => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}

export default function DealDetail({
  isOpen,
  deal,
  onClose,
  onDelete,
  onEdit,
}: DealDetailProps) {
  if (!deal) return null;

  const details = [
    { label: 'Deal Name', value: deal.dealName },
    { label: 'Company', value: deal.company },
    { label: 'Contact', value: deal.contact },
    { label: 'Stage', value: deal.stage },
    { label: 'Amount', value: `$${deal.amount.toLocaleString()}` },
    {
      label: 'Owner',
      value: (
        <span className="flex items-center gap-2">
          {deal.ownerImage && (
            <img
              src={deal.ownerImage}
              alt={deal.owner}
              className="w-6 h-6 rounded-full"
            />
          )}
          {deal.owner}
        </span>
      ),
    },
    deal.activity && { label: 'Activity', value: deal.activity },
    deal.tags && { label: 'Tags', value: deal.tags },
    deal.date && { label: 'Date', value: deal.date },
    deal.priority && { label: 'Priority', value: deal.priority },
  ].filter(Boolean) as { label: string; value: React.ReactNode }[];

  return (
    <DetailModal
      isOpen={isOpen}
      title="Deal Details"
      details={details}
      onClose={onClose}
      onDelete={onDelete ? () => onDelete(deal.id) : undefined}
      onEdit={onEdit ? () => onEdit(deal.id) : undefined}
    />
  );
}

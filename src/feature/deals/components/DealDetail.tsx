'use client';
import React from 'react';
import DetailModal from '@/components/detailPage'; // the reusable modal we built earlier
import { Badge } from '@/components/ui/Table';
import { Deal } from '../types';
import AvatarInitials from '@/components/ui/AvatarInitials'

interface DealDetailProps {
  isOpen: boolean;
  deal: Deal | null;
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

  const getCompanyName = (company: any) => {
    if (!company) return 'No Company';
    if (typeof company === 'string') return company;
    if (typeof company === 'object' && company?.fullName) return company.fullName;
    return 'Unknown Company';
  };

  const getContactName = (contact: any) => {
    if (!contact) return 'No Contact';
    if (typeof contact === 'string') return contact;
    if (typeof contact === 'object' && contact?.fullName) return contact.fullName;
    return 'Unknown Contact';
  };

  const getOwnerName = (owner: any) => {
    if (!owner) return 'No Owner';
    if (typeof owner === 'string') return owner;
    if (typeof owner === 'object' && owner?.name) return owner.name;
    if (typeof owner === 'object' && owner?.email) return owner.email;
    return 'Unknown Owner';
  };

  const getCurrencySymbol = (currency?: string) => {
    switch (currency?.toUpperCase()) {
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'USD':
      default: return '$';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const details = [
    { label: 'Company', value: getCompanyName(deal.company) },
    { label: 'Contact', value: getContactName(deal.contact) },
    { label: 'Stage', value: (<Badge variant={deal.stage}>{deal.stage}</Badge>) },
    { label: 'Amount', value: `${getCurrencySymbol((deal as any).currency)}${deal.amount.toLocaleString()}` },
    {
      label: 'Owner',
      value: (
        <span className="flex items-center gap-2">
          <AvatarInitials name={getOwnerName(deal.owner)} size={24} />
          {getOwnerName(deal.owner)}
        </span>
      ),
    },
    deal.tags && deal.tags.length > 0 && { label: 'Tags', value: Array.isArray(deal.tags) ? deal.tags.join(', ') : deal.tags },
    deal.closeDate && { label: 'Closed Date', value:formatDate((deal as any).closeDate) },
    (deal as any).lastActivity && { label:  'Last Activity', value: formatDate((deal as any).lastActivity) },

  ].filter(Boolean) as { label: string; value: React.ReactNode }[];

  return (
    <DetailModal
      isOpen={isOpen}
      title={deal.dealName}
      details={details}
      notes={deal.notes}
      attachments={deal.files}
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

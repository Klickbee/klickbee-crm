"use client";
import React from "react";
import DetailModal from "@/components/detailPage";
import type { Customer } from "../types/types";

// Helper function to render status badge
const renderStatusBadge = (status?: Customer['status']) => {
  const cls: Record<NonNullable<Customer['status']>, string> = {
    Active: 'bg-green-100 text-green-700',
    FollowUp: 'bg-[#FEF3C7] text-[#92400E]',
    inactive: 'bg-[#FEE2E2] text-[#B91C1C]',
  };

  const classes = status ? cls[status] : 'bg-gray-100 text-gray-500';

  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${classes}`}>
      {status ?? 'Unknown'}
    </span>
  );
}

interface CustomerDetailProps {
  isOpen: boolean;
  customer: Customer | null;
  onClose: () => void;
  onDelete?: (id: string) => void;
  onEdit?: (customer: Customer) => void;
  onAddNotes?: (id: string) => void;
  onExport?: (id: string) => void;
}

export default function CustomerDetail({
  isOpen,
  customer,
  onClose,
  onDelete,
  onEdit,
  onAddNotes,
  onExport,
}: CustomerDetailProps) {
  if (!customer) return null;

  const details = [
  
    { label: "Status", value: renderStatusBadge(customer.status) },
    {
      label: "Owner",
      value: (
        <span className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs">
            {customer.owner?.name?.charAt(0)?.toUpperCase() || customer.owner?.email?.charAt(0)?.toUpperCase() || 'U'}
          </span>
          {customer.owner?.name || customer.owner?.email || '-'}
        </span>
      ),
    },
    { label: "Company Name", value: customer.company ?? "-" },
    { label: "Email", value: customer.email ?? "-" },
    { label: "Phone", value: customer.phone ?? "-" },
    customer.tags && customer.tags.length > 0 && { label: "Tags", value: customer.tags.join(', ') },
  ].filter(Boolean) as { label: string; value: React.ReactNode }[];

  return (
    <DetailModal
      isOpen={isOpen}
      title={customer.fullName ?? "Customer Details"}
      notes={customer.notes ??undefined}
      details={details}
      onClose={onClose}
      onDelete={onDelete ? () => onDelete(customer.id) : undefined}
      onEdit={onEdit ? () => onEdit(customer as Customer) : undefined}
      editLabel="Edit Customer"
      onAddNotes={onAddNotes ? () => onAddNotes(customer.id) : undefined}
      onExport={onExport ? () => onExport(customer.id) : undefined}
    />
  );
}

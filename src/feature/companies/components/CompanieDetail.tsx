"use client";
import React from "react";
import DetailModal from "@/components/detailPage";
import type { Company } from "../types/types";
import AvatarInitials from "@/components/ui/AvatarInitials";

// Helper function to render status badge
const renderStatusBadge = (status?: Company['status']) => {
  const cls: Record<NonNullable<Company['status']>, string> = {
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

interface CompanieDetailProps {
  isOpen: boolean;
  company: Company | null;
  onClose: () => void;
  onDelete?: (id: string) => void;
  onEdit?: (company: Company) => void;
  onAddNotes?: (id: string) => void;
  onExport?: (id: string) => void;
}

export default function CompanieDetail({
  isOpen,
  company,
  onClose,
  onDelete,
  onEdit,
  onAddNotes,
  onExport,
}: CompanieDetailProps) {
  if (!company) return null;

  const details = [
    { label: "Industry", value: company.industry ?? "-" },
    { label: "Status", value: renderStatusBadge(company.status) },

    { label: "Website", value: company.website ?? "-" },

    {
      label: "Owner",
      value: (
        <span className="flex items-center gap-2">
          {company.owner ? (
            <>
              <AvatarInitials name={company.owner?.name} email={company.owner?.email} size={24} />
              {company.owner.name || company.owner.email}
            </>
          ) : (
            "-"
          )}
        </span>
      ),
    },
    { label: "Email", value: company.email ?? "-" },
    { label: "Phone", value: company.phone ?? "-" },
    company.tags && { label: "Tags", value: company.tags },
  ].filter(Boolean) as { label: string; value: React.ReactNode }[];

  return (
    <DetailModal
      isOpen={isOpen}
      title={company.fullName ?? "Company Details"}
      notes={company.notes ??undefined}
      details={details}
      attachments={company.files?.map(file => file.url) ?? []}
      onClose={onClose}
      onDelete={onDelete ? () => onDelete(company.id) : undefined}
      onEdit={onEdit ? () => onEdit(company as Company) : undefined}
      editLabel="Edit Company"
      onAddNotes={onAddNotes ? () => onAddNotes(company.id) : undefined}
      onExport={onExport ? () => onExport(company.id) : undefined}
    />
  );
}

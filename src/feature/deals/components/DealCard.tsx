"use client"
import { Card, CardContent } from "@/components/ui/Card"
import { cn } from "@/libs/utils"
import type { Deal } from "../types"
import { Badge } from "@/components/ui/Table"
import { Calendar } from "lucide-react"
import AvatarInitials from "@/components/ui/AvatarInitials"

type DealCardProps = {
  deal: Deal
  className?: string
}

// Map stage -> subtle token-based badge styles (no hard-coded colors)
const stageBadgeClass: Record<string, string> = {
  new: "bg-accent text-accent-foreground",
  contacted: "bg-muted text-muted-foreground",
  proposal: "bg-secondary text-secondary-foreground",
  won: "bg-primary/10 text-primary",
  lost: "bg-destructive/10 text-destructive",
}

const currency = (v: number) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(v)

const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

export function DealCard({ deal, className }: DealCardProps) {
  const badgeClass = stageBadgeClass[deal.stage] ?? "bg-muted text-muted-foreground"

  return (
    <Card className={cn("border", className)} role="article" aria-label={deal.dealName}>
      <CardContent className="p-4 gap-3">
        {/* Stage badge */}
        <div className="mb-2">
          <span className={cn("inline-flex items-center rounded-md  py-0.5 text-xs font-medium", badgeClass)}>
            <Badge variant={deal.stage}>{labelForStage(deal.stage)}</Badge>
          </span>
        </div>

        {/* Title */}
        <h4 className="text-sm font-semibold text-pretty">{deal.dealName}</h4>

        {/* Amount + contact */}
        <p className="mt-1 text-xs text-[var(--brand-gray)] ">
          {currency(deal.amount)} <span className=""> - {deal.contact}</span>
        </p>

        {/* Date / tags / activity */}
        <div className="text-xs mt-2  text-[var(--brand-gray)] ">
          {deal.closeDate ? (
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 " />
              <span>{formatDate(deal.closeDate)}</span>
            </div>
          ) : null}
          {deal.priority ? (
            <div className="flex mt-2 items-center gap-2">
              <Calendar className="h-3.5 w-3.5 " />
              <span>{deal.priority}</span>
            </div>
          ) : null}
        </div>

        {/* Owner */}
        <div className="mt-4 flex items-center gap-2">
          <AvatarInitials name={deal.owner} size={24} />
          <span className="text-xs text-foreground/80">{deal.owner}</span>
        </div>
      </CardContent>
    </Card>
  )
}

function labelForStage(stage: Deal["stage"]) {
  switch (stage) {
    case "New":
      return "New"
    case "Contacted":
      return "Contacted"
    case "Proposal":
      return "Proposal Sent"
    case "Won":
      return "Won"
    case "Lost":
      return "Lost"
    default:
      return stage
  }
}

export default DealCard

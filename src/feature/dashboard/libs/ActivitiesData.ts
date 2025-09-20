import type { Activity } from "../types/Types"

export const getRecentActivities = (): Activity[] =>  [
  {
    id: 1,
    user: "John Smith",
    initials: "JS",
    action: "updated contact details",
    description: "Updated phone number, email address, and company information for better follow-up communication.",
    time: "2h ago",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face"
  },
  {
    id: 2,
    user: "Sarah Lee", 
    initials: "SL",
    action: 'added by Sarah Lee',
    description: "Added Acme Corp as a new potential client with full profile details, including industry, size, and primary contact.",
    time: "6h ago",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face"
  },
  {
    id: 3,
    user: "Alex Brown",
    initials: "AB", 
    action: 'scheduled with "Global Tech Ltd"',
    description: "Scheduled an online Zoom meeting for next Tuesday to discuss partnership opportunities and product demos.",
    time: "12h ago",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"
  },
  {
    id: 4,
    user: "Proposal",
    initials: "PR",
    action: 'sent to "Bright Solutions"',
    description: "Sent a detailed proposal outlining service packages, pricing options, and estimated project timelines.",
    time: "Aug 9, 2025, 11:00 AM",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=32&h=32&fit=crop&crop=face"
  },
  {
    id: 5,
    user: "Emma Wilson",
    initials: "EW",
    action: "completed task",
    description: "Finished the quarterly report analysis and submitted findings to the management team.",
    time: "1 day ago",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face"
  },
  {
    id: 6,
    user: "Mike Johnson",
    initials: "MJ",
    action: "updated project status",
    description: "Changed project milestone status to 'In Progress' and assigned new tasks to team members.",
    time: "2 days ago",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face"
  },
  {
    id: 7,
    user: "Lisa Chen",
    initials: "LC",
    action: "created new invoice",
    description: "Generated invoice #INV-2025-089 for TechStart Inc. totaling $15,750 for development services.",
    time: "3 days ago",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=32&h=32&fit=crop&crop=face"
  }
]
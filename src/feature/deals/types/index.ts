
export type Deal = {
  id: string
  dealName: string
  company: string
  contact: string
  stage: 'New' | 'Contacted' | 'Proposal' | 'Won' | 'Lost'
  amount: number
  ownerImage?: string
  activity?: string
  tags?: string
  closeDate?: string
  priority?: string
  notes?: string
  attachments?: string[]
  // Normalized for UI components and exports
  owner: string
  // Optional link to the actual owner user id if available from API
  ownerId?: string
}

export interface UserType {
  id: string
  name:string
  registrationDate?: string
  lastLogin ?: string
  status ?: 'Active' | 'Inactive' | 'Invite' | 'Invite Sent' | 'Deleted',
  ownerImage:string
}

export interface UserType {
  id: string
  name:string
  registrationDate?: string
  lastLogin ?: string
  status ?: 'Active' | 'Invite Send',
  ownerImage:string
}

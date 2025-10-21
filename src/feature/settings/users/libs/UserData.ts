import { UserType } from "../types/types";
import { fetchUsers } from "./usersApi";

// Transform database user data to match UserType interface
function transformUserForUI(dbUser: any): UserType {
  return {
    id: dbUser.id,
    name: dbUser.name || dbUser.email, // Use email if name is not available
    ownerImage: `https://i.pravatar.cc/32?img=${dbUser.id.slice(-1)}`, // Generate avatar based on user ID
    registrationDate: dbUser.createdAt ? new Date(dbUser.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }) : 'N/A',
    lastLogin: dbUser.lastLogin ? new Date(dbUser.lastLogin).toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }) : 'Never',
    status: dbUser.status === 'Active' ? 'Active' :
            dbUser.status === 'Invite' ? 'Invite Sent' :
            dbUser.status === 'Inactive' ? 'Inactive' :
            dbUser.status === 'Deleted' ? 'Deleted' : 'Invite'
  };
}

// Fetch users from database and transform for UI
export async function getUserData(): Promise<UserType[]> {
  try {
    const response = await fetchUsers();

    if (response.success && response.users) {
      return response.users.map(transformUserForUI);
    }

    return [];
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return [];
  }
}

// For backward compatibility, keep UserData as a function that returns a promise
export const UserData = getUserData();

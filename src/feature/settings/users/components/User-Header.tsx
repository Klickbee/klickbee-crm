"use client"
import { Button } from "@/components/ui/Button"
import { Plus, Trash } from "lucide-react"
import toast from "react-hot-toast"
import { deleteUsers } from "../libs/usersApi"


type UsersHeaderProps = {
    handleAddUser: () => void;
    selectedUsers?: string[];
    onClearSelection?: () => void;
    onUsersChange?: () => void; // Add this prop for refreshing users list
}

export function UsersHeader({ handleAddUser, selectedUsers = [], onClearSelection, onUsersChange }: UsersHeaderProps) {
    const handleBulkAction = async (action: string) => {
        switch (action) {
            case 'delete':
                if (selectedUsers.length > 0) {
                    if (confirm(`Are you sure you want to delete ${selectedUsers.length} user(s)? This action cannot be undone.`)) {
                        try {
                            await deleteUsers(selectedUsers)
                            toast.success(`Successfully deleted ${selectedUsers.length} user(s)`)
                            onClearSelection?.()
                            onUsersChange?.() // Refresh users list after deletion
                        } catch (error) {
                            toast.error(error instanceof Error ? error.message : 'Failed to delete users')
                        }
                    }
                }
                break;
        }
    };

    return (
        <div
            className="
        flex items-center justify-between
        h-[68px]  
        px-8 py-1
        bg-background
      "
        >
            <div className="flex items-center gap-2">
                <h3 className="font-medium text-sm leading-[20px] tracking-[0px]">Users</h3>
                {selectedUsers.length > 0 && (
                    <span className="text-sm text-gray-600">({selectedUsers.length} selected)</span>
                )}
            </div>
            <div className="flex items-center gap-2">
                {/* Delete Button - Show when users are selected */}
                {selectedUsers.length > 0 && (
                    <Button
                        onClick={() => handleBulkAction('delete')}
                        className="flex items-center gap-1 h-[36px]"
                    >
                        <Trash className="text-red-600 h-4 w-4" />
                        <span className="text-red-600">Delete ({selectedUsers.length})</span>
                    </Button>
                )}
                <Button onClick={handleAddUser} className="whitespace-nowrap bg-black">
                    <Plus className="text-[#FAFAFA] h-4 w-4 " />
                    <span className="text-[#FAFAFA]">Add User</span>
                </Button>
            </div>
        </div>
    )
}

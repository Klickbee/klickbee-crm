"use client"
import { Button } from "@/components/ui/Button"
import { DropDown } from "@/components/ui/DropDown"
import { Search, Filter, LayoutGrid, List, Download, Upload, Plus } from "lucide-react"
import { useState } from "react"

const userOptions = [{ value: "Closed", label: "Closed Time" }]

type UsersHeaderProps = {
    handleAddUser: () => void;
}

export function UsersHeader({ handleAddUser}: UsersHeaderProps) {
    const [selectedUser, setSelectedUser] = useState("Closed")

    return (
        <div
            className="
        flex items-center justify-between
        h-[68px]  
        px-8 py-1
        bg-background
      "
        >
            <h3 className="font-medium text-sm leading-[20px] tracking-[0px]">Users</h3>
            <Button onClick={handleAddUser} className="whitespace-nowrap bg-black">
                <Plus className="text-[#FAFAFA] h-4 w-4 " />
                <span className="text-[#FAFAFA]">Add User</span>
            </Button>
        </div>
    )
}

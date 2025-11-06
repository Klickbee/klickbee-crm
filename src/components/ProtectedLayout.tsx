"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import SideBar from "./layout/SideBar"
import NavBar from "./layout/NavBar"
import { useCompanyModalStore } from "@/feature/companies/stores/useCompanyModalStore"
import CompaniesModel from "@/feature/companies/components/CompaniesModel"
import CustomersModel from "@/feature/customers/components/CustomersModel"
import { useCustomerModalStore } from "@/feature/customers/stores/useCustomersModel"
import { useMeetingModalStore } from "@/feature/meetings/stores/meetingModelStore"
import { AddMeetingModal } from "@/feature/meetings/components/AddMeetingModal"
import { Meeting } from "@/feature/meetings/types/meeting"
import { useDealModalStore } from "@/feature/deals/stores/dealsModelStore"
import { useTaskModalStore } from "@/feature/todo/stores/taskModelStore"
import DealSlideOver from "@/feature/deals/components/DealModal"
import TodoSlideOver from "@/feature/todo/components/TodoModel"

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const { status } = useSession()
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [showChildren, setShowChildren] = useState(false)
    const router = useRouter()
    const { isOpen: isCompanyOpen, closeModal: closeCompanyModal, mode: companyMode } = useCompanyModalStore();
    const { isOpen: isCustomerOpen, closeModal: closeCustomerModal, mode: customerMode } =useCustomerModalStore();
    const { isOpen: isMeetingOpen, closeModal: closeMeetingModal, mode: MeetingMode } =useMeetingModalStore();
    const { isOpen: isDealOpen, closeModal: closeDealModal, mode: DealMode } =useDealModalStore();
    const { isOpen: isTaskOpen, closeModal: closeTaskModal, mode: TaskMode } =useTaskModalStore();

    const pathname = usePathname()
    

    useEffect(() => {
        if (status === "unauthenticated" && pathname !== "/auth" && pathname !== "/verify") {
            router.push("/auth")
            setIsAuthenticated(false)
            setShowChildren(false)
        } else if (status === "authenticated") {
            setIsAuthenticated(true)
            // Reset showChildren on route change
            setShowChildren(false)
            // Show children after 1 second delay
            const timer = setTimeout(() => {
                setShowChildren(true)
            }, 1000)
            
            return () => clearTimeout(timer)
        }
    }, [status, pathname, router])

    // Show loading while session is loading OR when unauthenticated on protected route
    if (status === "loading" || (status === "unauthenticated" && pathname !== "/auth" && pathname !== "/verify")) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="flex space-x-1">
                    <div className="w-3 h-3 bg-black rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-black rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-3 h-3 bg-black rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
            </div>
        )
    }

    return (
        <>
            {
                isAuthenticated ?
                <div>
                    <div className="flex h-[100dvh]">
                        {/* Sidebar */}
                        <SideBar />
                        {/* Main content */}
                        <div className="flex flex-col flex-1 overflow-x-hidden">
                            <NavBar />
                            {showChildren ? (
                                <div className="overflow-y-auto overflow-x-hidden flex-1 scrollbar-hide">
                                    {children}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center flex-1 bg-gray-50">
                                    <div className="flex space-x-1">
                                        <div className="w-3 h-3 bg-black rounded-full animate-bounce"></div>
                                        <div className="w-3 h-3 bg-black rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                        <div className="w-3 h-3 bg-black rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <CompaniesModel open={isCompanyOpen} onClose={closeCompanyModal} mode={companyMode} />
                    <CustomersModel open={isCustomerOpen} onClose={closeCustomerModal} mode={customerMode} />
                    <AddMeetingModal isOpen={isMeetingOpen} onClose={closeMeetingModal} mode={MeetingMode} />
                    <DealSlideOver open={isDealOpen} onClose={closeDealModal} mode={DealMode} />
                    <TodoSlideOver open={isTaskOpen} onClose={closeTaskModal} mode={TaskMode} />

                </div> :
                <>{children}</>

                
        }
        </>
    )
}

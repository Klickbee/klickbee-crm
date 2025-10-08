"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import SideBar from "./layout/SideBar"
import NavBar from "./layout/NavBar"

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const { status } = useSession()
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const router = useRouter()

    useEffect(() => {
        if (status === "unauthenticated" && window.location.pathname !== "/auth") {
            router.push("/auth")
            setIsAuthenticated(false)
        }else if (status === "authenticated") {
            setIsAuthenticated(true)
        }
    }, [status])

    if (status === "loading") {
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
                <div className="flex h-[100dvh]">
                    {/* Sidebar */}
                    <SideBar />
                    {/* Main content */}
                    <div className="flex flex-col flex-1 overflow-x-hidden">
                        <NavBar />
                        <div className=" overflow-y-auto overflow-x-hidden flex-1 scrollbar-hide">
                            {children}
                        </div>
                    </div>
                </div> :
                <>{children}</>
        }
        </>
    )
}

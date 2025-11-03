"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import SideBar from "./layout/SideBar"
import NavBar from "./layout/NavBar"

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const { status } = useSession()
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [showChildren, setShowChildren] = useState(false)
    const router = useRouter()
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
                    </div> :
                    <>{children}</>
            }
        </>
    )
}
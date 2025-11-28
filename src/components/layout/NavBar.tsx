"use client";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import IconButton from "../ui/IconButton"

export default function NavBar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Get the current page info based on pathname
  const getPageInfo = () => {
    // Remove leading slash and get the full path for nested routes
    const fullPath = pathname.startsWith('/') ? pathname.slice(1) : pathname;
    const path = fullPath || 'dashboard'; // Default to dashboard for root path
    
    switch (path) {
      case 'dashboard':
      case '':
        return {
          title: 'Dashboard',
          description: 'Your leads. Your tasks. Your momentum — in one view.'
        };
      case 'deals':
        return {
          title: 'Deals',
          description: 'Track and manage all your commercial opportunities in one place.'
        };
      case 'todo':
        return {
          title: 'To-Do',
          description: 'Organize and follow all your daily actions, from client calls to internal steps.'
        };
      case 'meetings':
        return {
          title: 'Meetings',
          description: 'Organize and follow all your daily actions, from client calls to internal steps.'
        };
      case 'contact/customers':
        return {
          title: 'Customers',
          description: 'Keep track of every customer interaction, from onboarding to retention.'
        };
      case 'contact/companies':
        return {
          title: 'Companies',
          description: 'Keep track of every companies interaction, from onboarding to retention.'
        };
      case 'prospects':
        return {
          title: 'Prospects',
          description: 'Manage and track all your prospect interactions, from first contact to qualification.'
        };
      case 'settings/ai':
        return {
          title: 'AI Settings',
          description: 'Setup AI settings for your account.'
        };
      case 'settings/users':
        return {
          title: 'User Settings',
          description: 'Manage all users of the platform.'
        };
      case 'settings/email':
        return {
          title: 'E-Mail Settings',
          description: 'Configure email sending and receiving.'
        };
      default:
        return {
          title: 'Dashboard',
          description: 'Your leads. Your tasks. Your momentum — in one view.'
        };
    }
  };

  const pageInfo = getPageInfo();

  const handleLogout = () => {
    signOut({ callbackUrl: "/auth" });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="flex items-center h-[84px] w-full justify-between px-8 py-4  border-b  border-[var(--border-gray)] relative">
      <div className="flex flex-col w-full h-[52px] gap-[4px] ">
        <h1 className="text-xl font-semibold leading-[28px] text-[var(--foreground)]">{pageInfo.title}</h1>
        <p className="text-sm  leading-[20px] text-[var(--brand-gray)]">{pageInfo.description}</p>
      </div>

      <div className="flex items-center h-[40px] gap-4">
        <div className="flex items-center gap-3">
          <IconButton icon={
            <img src="\icons\NotificationIcon.svg"
              alt="Notification"
              className="h-6 w-6" />}
          />
          <IconButton icon={
            <img src="\icons\MessageIcon.svg"
              alt="Message"
              className="h-6 w-6" />}
          />
        </div>

        <div className="h-[40px] w-px bg-[var(--border-gray)]"></div>

        <div className="flex items-center gap-2 relative" ref={dropdownRef}>
          <div className="h-10 w-10 rounded-full flex items-center justify-center">
            <img src="\icons\ProfileIcon.svg" alt="Profile" />
          </div>

          <div className="w-5">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="h-5 w-5 p-0 flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
            >
              <img src="\icons\Down-Arrow.svg" alt="Menu" className="h-5 w-5" />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-48  border border-[var(--border-gray)]
              rounded-lg shadow-lg z-50">
                <div className="py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left bg-white text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                   <span className="text-red-500"> Logout</span>  
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>


    </header>
  )
}

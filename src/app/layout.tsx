import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { QueryProvider } from '@/providers/QueryProvider'
import NavBar from '@/components/layout/NavBar'
import SideBar from '@/components/layout/SideBar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Klickbee CMS',
  description: 'A modern CMS built with Next.js',
   icons: {
    icon: '/icons/Logo.svg',
  },
  
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <div className="flex h-[100dvh]"> 
                {/* Sidebar */}
                <SideBar />
                {/* Main content */}
                <div className="flex flex-col flex-1">
                  <NavBar />
                  <div className=" overflow-y-auto flex-1 scrollbar-hide">
                    {children}
                  </div>
                </div>
              </div>
        </QueryProvider>
      </body>
    </html>
  )
}
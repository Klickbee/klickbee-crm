"use client";
import React from 'react'
import SidebarItem from '../ui/SideBarItems';
import { Home, Settings } from 'lucide-react';
import { sidebarItems } from '@/libs/sideBarLinks';

export default function SideBar() {
    return (
        <div className='w-[256px] h-[100dvh]  flex flex-col border-r  border-[var(--border-gray)]'>
            <div className='h-[68px] p-2  '>
                <div className='flex w-[239px] h-[52px] p-2 items-center gap-2'>
                    <div className='w-10 h-8'>
                        <img src="\icons\Logo.svg" alt="KlickBee" className='h-8 w-8' />
                    </div>
                    <div className='w-full'>
                        <h1 className="text-sm font-semibold leading-[20px] text-[var(--foreground)]">KlickBee</h1>
                        <p className="text-xs  leading-[16px] text-[var(--foreground)]">KlickBee.com</p>

                    </div>
                </div>
            </div>
            <div className='w-full flex-1 p-2 overflow-auto scrollbar-hide'>
                <div className='space-y-1 '>
                    {sidebarItems.map((item) => {
                        const lucideIconMap = {
                            home: Home,
                            settings: Settings,
                        } as const;

                        const IconComponent = item.lucideIcon ? lucideIconMap[item.lucideIcon] : null;
                        const iconNode = IconComponent ? (
                            <IconComponent size={16} />
                        ) : item.icon ? (
                            <img src={item.icon} alt={item.label} className='w-4 h-4' />
                        ) : undefined;

                        return (
                            <SidebarItem key={item.label} icon={iconNode} label={item.label} route={item.route}>
                                {item.children?.map((child) => (
                                    <SidebarItem key={child.label} label={child.label} route={child.route} />
                                ))}
                            </SidebarItem>
                        );
                    })}
                </div>
            </div>
            {/* Bottom profile card */}
            <div className='p-2'>
                <div className='w-full h-[52px] p-2  flex items-center space-x-2'>
                    <img src="\icons\ProfileIcon.svg" alt="User avatar" className='w-8 h-8  object-cover' />
                    <div className='min-w-0 flex-1'>
                        <p className='text-sm font-semibold text-[var(--foreground)] leading-[20px]'>Julien Mauclair</p>
                        <p className='text-xs font-normal text-[var(--foreground)] truncate leading-[16px]'>julien.mauclair@e-polaz.com</p>
                    </div>
                    <button className='p-1 rounded hover:bg-gray-100'>
                        <Settings size={16} className='text-[var(--foreground)]' />
                    </button>
                </div>
            </div>

        </div>
    )
}



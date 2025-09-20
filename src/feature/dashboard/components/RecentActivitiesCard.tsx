"use client"

import React from "react"
import { getRecentActivities } from "../libs/ActivitiesData"
import { Activity } from "../types/Types"

export default function RecentActivitiesCard() {
  const activities = getRecentActivities()

  const getActivityTitle = (activity: Activity, index: number) => {
    switch (index) {
      case 0:
        return `${activity.user} updated contact details`
      case 1:
        return `New lead "Acme Corp" added by Sarah Lee`
      case 2:
        return `Meeting scheduled with "Global Tech Ltd"`
      case 3:
        return `Proposal sent to "Bright Solutions"`
      default:
        return `${activity.user} ${activity.action}`
    }
  }
  return (

    <section className="shadow-sm rounded-xl border border-[var(--border-gray)] bg-white h-[500px] flex flex-col">
      <div className="flex h-14 items-center justify-between px-4 border-b border-[var(--border-gray)] flex-shrink-0">
        <h3 className="text-sm font-semibold text-[var(--foreground)]">Recent Activities</h3>
        <button className="text-xs font-medium text-[var(--foreground)] hover:text-gray-700">
          See Details
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide p-4 gap-4">
        <div className="space-y-4">
          {activities.map((activity, idx) => (
            <div key={activity.id} className="relative">
              <div className="flex items-start gap-4 h-[96px]">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <img
                    src={activity.avatar}
                    alt={activity.user}
                    className="h-[44px] w-[44px] rounded-full object-cover"
                  />
                  {/* Connecting dotted line */}
                  {idx < activities.length - 1 && (
                    <div
                      className="absolute left-1/2 top-8 -translate-x-1/2 mt-2.5"
                      style={{
                        height: '66px',
                        background: 'repeating-linear-gradient(to bottom, transparent 0px, transparent 3px, #E4E4E7 3px, #E4E4E7 6px)',
                        width: '1px'
                      }}
                    />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[var(--foreground)] mb-1">
                    {getActivityTitle(activity, idx)}
                  </div>
                  <div className="text-sm text-[var(--brand-gray)] leading-relaxed mb-3">
                    {activity.description}
                  </div>
                  <div className="text-sm text-[var(--brand-gray)]">
                    {activity.time}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

  )
}
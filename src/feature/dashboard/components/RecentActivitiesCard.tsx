"use client"

import React, { useState, useEffect } from "react"
import { fetchRecentActivities } from "../libs/ActivitiesData"
import { Activity } from "../types/Types"

export default function RecentActivitiesCard() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadActivities = async () => {
      setLoading(true)
      try {
        const data = await fetchRecentActivities()
        setActivities(data)
      } catch (error) {
        console.error('Error loading activities:', error)
        // Activities will fall back to mock data if fetch fails
      } finally {
        setLoading(false)
      }
    }

    loadActivities()
  }, [])

  const getActivityTitle = (activity: Activity, index: number) => {
    // Use the actual activity action and description from the API data
    return `${activity.user} ${activity.action}`;
  }

  if (loading) {
    return (
      <section className="shadow-sm rounded-xl border border-[var(--border-gray)] bg-white h-[500px] flex flex-col">
        <div className="flex h-14 items-center justify-between px-4 border-b border-[var(--border-gray)] flex-shrink-0">
          <h3 className="text-base font-semibold">Recent Activities</h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Loading activities...</p>
        </div>
      </section>
    )
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
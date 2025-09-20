"use client"

import React from "react"
import { getAgenda } from "../libs/AgendaData"
import { CalendarDays, Clock } from "lucide-react"

export default function AgendaCard() {
  const items = getAgenda()

  return (
    <section className="w-[362px] h-[500px] shadow-sm rounded-xl border border-[var(--border-gray)] bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center h-[56px] justify-between p-[16px] border-b border-[var(--border-gray)]">
        <h3 className="text-sm font-semibold text-[var(--foreground)]">Agenda (12)</h3>
        <button className="text-xs font-medium text-[var(--foreground)] hover:text-gray-700">
          See Details
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-hide">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex h-[62px] w-[330px] items-center justify-between"
          >
            {/* Left side: title + date/time */}
            <div className="flex-1 min-w-0 flex flex-col gap-1.5">
              <h4 className="text-sm font-medium text-[var(--foreground)] truncate">
                {item.title}
              </h4>

              {/* Date with calendar icon */}
              <div className="flex items-center gap-1.5">
                <CalendarDays className="h-3 w-3 text-[var(--brand-gray)]" />
                <span className="text-xs text-[var(--brand-gray)]">{item.date}</span>
              </div>

              {/* Time with clock icon */}
              <div className="flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-[var(--brand-gray)]" />
                <span className="text-xs text-[var(--brand-gray)]">{item.attendees}</span>
              </div>
            </div>

            {/* Right side: avatars */}
            <div className="flex -space-x-2 ml-3 mt-3">
              {item.images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Attendee ${index + 1}`}
                  className="h-[30px] w-[30px] rounded-full ring-2 ring-white object-cover"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

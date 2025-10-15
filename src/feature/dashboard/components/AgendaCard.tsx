"use client"

import React, { useEffect } from "react"
import { useMeetingsStore } from "../../meetings/stores/useMeetingsStore"
import { CalendarDays, Clock } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AgendaCard() {
  const { meetings, fetchMeetings } = useMeetingsStore()
  const router = useRouter()

  useEffect(() => {
    fetchMeetings()
  }, [fetchMeetings])

  // Helper function to format meeting data for display
  const formatMeetingForAgenda = (meeting: any, index: number) => {
    const startDate = meeting.startDate ? new Date(meeting.startDate) : new Date()
    const startTime = meeting.startTime ? new Date(meeting.startTime) : new Date()
    const endTime = meeting.endTime ? new Date(meeting.endTime) : new Date()

    // Format date as "Month DD, YYYY"
    const formattedDate = startDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    // Format time as "HH:MM AM/PM - HH:MM AM/PM"
    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    }

    const timeRange = `${formatTime(startTime)} - ${formatTime(endTime)}`

    return {
      id: meeting.id ? parseInt(meeting.id) : `meeting-${index}`,
      title: meeting.title,
      date: formattedDate,
      attendees: [timeRange],
      images: meeting.participants?.length > 0
        ? meeting.participants.map((_: any, index: number) => "/icons/ProfileIcon.svg")
        : ["/icons/ProfileIcon.svg"]
    }
  }

  // Transform meetings to agenda items format
  const agendaItems = meetings.slice(0, 6).map((meeting, index) => formatMeetingForAgenda(meeting, index))

  return (
    <section className="xl:w-[367px] 2xl:w-auto  h-[500px] shadow-sm rounded-xl border border-[var(--border-gray)] bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center h-[56px] justify-between p-[16px] border-b border-[var(--border-gray)]">
        <h3 className="text-sm font-semibold text-[var(--foreground)]">Agenda ({meetings.length})</h3>
        <button onClick={() => router.push("/meetings")}
        className="text-xs font-medium text-[var(--foreground)] hover:text-gray-700">
          See Details
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-hide">
        {agendaItems.map((item: any) => (
          <div
            key={item.id}
            className="flex h-[62px] w-full items-center justify-between"
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
            <div className="flex -space-x-2 ml-3">
              {item.images.map((img: string, index: number) => (
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

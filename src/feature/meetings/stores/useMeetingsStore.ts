import { create } from "zustand";
import toast from "react-hot-toast";
import { Meeting } from "../types/meeting";

interface MeetingStore {
  meetings: Meeting[];
  loading: boolean;
  error: string | null;

  fetchMeetings: (ownerId?: string) => Promise<void>;
  addMeeting: (meeting: Omit<Meeting, "id" | "ownerId" | "createdAt">) => Promise<void>;
  updateMeeting: (id: string, meeting: Partial<Meeting>) => Promise<void>;
  deleteMeeting: (id: string) => Promise<void>;
}

// Helper function to convert date strings to Date objects
const convertDates = (meeting: any): Meeting => ({
  ...meeting,
  startDate: meeting.startDate ? new Date(meeting.startDate) : meeting.startDate,
  startTime: meeting.startTime ? new Date(meeting.startTime) : meeting.startTime,
  endTime: meeting.endTime ? new Date(meeting.endTime) : meeting.endTime,
});

export const useMeetingsStore = create<MeetingStore>((set, get) => ({
  meetings: [],
  loading: false,
  error: null,

  // 🧠 Fetch meetings from API
  fetchMeetings: async (ownerId?: string) => {
    set({ loading: true });
    try {
      const query = ownerId ? `?ownerId=${ownerId}` : "";
      const res = await fetch(`/api/admin/meetings${query}`);
      if (!res.ok) throw new Error("Failed to fetch meetings");

      const data: any[] = await res.json();
      const convertedData = data.map(convertDates);
      set({ meetings: convertedData, loading: false });
    } catch (err: any) {
      console.error("fetchMeetings error:", err);
      toast.error("Failed to load meetings");
      set({ error: err.message, loading: false });
    }
  },

  // ➕ Add a new meeting
  addMeeting: async (meeting) => {
    try {
      const res = await fetch(`/api/admin/meetings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(meeting),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create meeting");
      }

      const created: any = await res.json();
      const convertedCreated = convertDates(created);
      set({ meetings: [...get().meetings, convertedCreated] });
      toast.success("Meeting created successfully!");
    } catch (err: any) {
      console.error("addMeeting error:", err);
      toast.error(err.message);
      set({ error: err.message });
    }
  },

  // ✏️ Update a meeting
  updateMeeting: async (id, meeting) => {
    try {
      const res = await fetch(`/api/admin/meetings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(meeting),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update meeting");
      }

      const updated: any = await res.json();
      const convertedUpdated = convertDates(updated);
      set({
        meetings: get().meetings.map((m) => (m.id === id ? convertedUpdated : m)),
      });

    } catch (err: any) {
      console.error("updateMeeting error:", err);
      toast.error(err.message);
      set({ error: err.message });
    }
  },

  // ❌ Delete a meeting
  deleteMeeting: async (id) => {
    try {
      const res = await fetch(`/api/admin/meetings/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete meeting");

      set({
        meetings: get().meetings.filter((m) => m.id !== id),
      });
      toast.success("Meeting deleted successfully!");
    } catch (err: any) {
      console.error("deleteMeeting error:", err);
      toast.error(err.message);
      set({ error: err.message });
    }
  },
}));
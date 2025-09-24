import { useState, useCallback } from 'react';
import { Meeting, ViewType } from '../types/meeting';
import { initialMeetings} from '../libs/meetingData'


export const useMeetings = () => {
  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [isAddMeetingOpen, setIsAddMeetingOpen] = useState(false);
  const [isMeetingDetailOpen, setIsMeetingDetailOpen] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('daily');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date()); // For sidebar date selection

  const addMeeting = useCallback((meeting: Omit<Meeting, 'id'>) => {
    const newMeeting: Meeting = {
      ...meeting,
      id: Date.now().toString(),
    };
    setMeetings(prev => [...prev, newMeeting]);
  }, []);

  const updateMeeting = useCallback((id: string, updates: Partial<Meeting>) => {
    setMeetings(prev => 
      prev.map(meeting => 
        meeting.id === id ? { ...meeting, ...updates } : meeting
      )
    );
  }, []);

  const deleteMeeting = useCallback((id: string) => {
    setMeetings(prev => prev.filter(meeting => meeting.id !== id));
  }, []);

  const openMeetingDetail = useCallback((meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setIsMeetingDetailOpen(true);
  }, []);

  const closeMeetingDetail = useCallback(() => {
    setSelectedMeeting(null);
    setIsMeetingDetailOpen(false);
  }, []);

  const openAddMeeting = useCallback(() => {
    setIsAddMeetingOpen(true);
  }, []);

  const closeAddMeeting = useCallback(() => {
    setIsAddMeetingOpen(false);
  }, []);

  const handleSelectedDateChange = useCallback((date: Date) => {
    setSelectedDate(date);
    // Also update the main calendar view to show the selected date
    setCurrentDate(date);
  }, []);

  return {
    meetings,
    selectedMeeting,
    isAddMeetingOpen,
    isMeetingDetailOpen,
    currentView,
    currentDate,
    selectedDate,
    setCurrentView,
    setCurrentDate,
    setSelectedDate: handleSelectedDateChange,
    addMeeting,
    updateMeeting,
    deleteMeeting,
    openMeetingDetail,
    closeMeetingDetail,
    openAddMeeting,
    closeAddMeeting,
  };
};
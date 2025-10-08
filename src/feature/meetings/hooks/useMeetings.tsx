import { useState, useEffect, useCallback } from 'react';
import { Meeting, ViewType } from '../types/meeting';
import { useMeetingsStore } from '../stores/useMeetingsStore';

export const useMeetings = () => {
  const {
    meetings,
    loading,
    error,
    fetchMeetings,
    addMeeting,
    updateMeeting,
    deleteMeeting
  } = useMeetingsStore();

  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [isAddMeetingOpen, setIsAddMeetingOpen] = useState(false);
  const [isMeetingDetailOpen, setIsMeetingDetailOpen] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('daily');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date()); // For sidebar date selection

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

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
    loading,
    error,
    addMeeting,
    updateMeeting,
    deleteMeeting,

    selectedMeeting,
    isAddMeetingOpen,
    isMeetingDetailOpen,
    currentView,
    currentDate,
    selectedDate,

    setCurrentView,
    setCurrentDate,
    setSelectedDate: handleSelectedDateChange,
    openMeetingDetail,
    closeMeetingDetail,
    openAddMeeting,
    closeAddMeeting,
  };
};
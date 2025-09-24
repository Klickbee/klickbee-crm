import { useMeetings } from "../hooks/useMeetings";
import { AddMeetingModal } from "./AddMeetingModal";
import { CalendarHeader } from "./CalendarHeader";
import { DailyView } from "./CalendarViews/DailyView";
import { MonthlyView } from "./CalendarViews/MonthlyView";
import { WeeklyView } from "./CalendarViews/WeeklyView";
import { YearlyView } from "./CalendarViews/YearlyView";
import { MeetingDetailModal } from "./MeetingDetailModal";
import { MeetingsSidebar } from "./MeetingsSideBar";

export const MeetingsCalendar: React.FC = () => {
  const {
    meetings,
    selectedMeeting,
    isAddMeetingOpen,
    isMeetingDetailOpen,
    currentView,
    currentDate,
    selectedDate,
    setCurrentView,
    setCurrentDate,
    setSelectedDate,
    addMeeting,
    updateMeeting,
    deleteMeeting,
    openMeetingDetail,
    closeMeetingDetail,
    openAddMeeting,
    closeAddMeeting,
  } = useMeetings();

  const renderCalendarView = () => {
    const viewProps = {
      currentDate,
      meetings,
      onMeetingClick: openMeetingDetail,
    };

    switch (currentView) {
      case 'daily':
        return <DailyView {...viewProps} />;
      case 'weekly':
        return <WeeklyView {...viewProps} />;
      case 'monthly':
        return <MonthlyView {...viewProps} />;
      case 'yearly':
        return <YearlyView {...viewProps} />;
      default:
        return <DailyView {...viewProps} />;
    }
  };

  return (
    <div className="w-full h-screen bg-gray-50">
      <div className="w-full flex flex-col">
        <CalendarHeader
          currentDate={currentDate}
          currentView={currentView}
          onDateChange={setCurrentDate}
          onViewChange={setCurrentView}
          onAddMeeting={openAddMeeting}
        />

        {/* Main Calendar Content */}
        <div className="flex flex-1 p-4 gap-4">
          {/* Sidebar - Much smaller width to match Figma design */}
          <div className="flex-shrink-0" style={{width: '22%'}}>
            <MeetingsSidebar
              meetings={meetings}
              currentDate={currentDate}
              selectedDate={selectedDate}
              onDateChange={setCurrentDate}
              onSelectedDateChange={setSelectedDate}
              onMeetingClick={openMeetingDetail}
            />
          </div>
          
          {/* Main calendar area - takes remaining space */}
          <div className="flex-1 rounded-lg shadow-sm border border-gray-200 p-2">
            {renderCalendarView()}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddMeetingModal
        isOpen={isAddMeetingOpen}
        onClose={closeAddMeeting}
        onSave={addMeeting}
      />

      <MeetingDetailModal
        isOpen={isMeetingDetailOpen}
        meeting={selectedMeeting}
        onClose={closeMeetingDetail}
        onUpdate={updateMeeting}
        onDelete={deleteMeeting}
      />
    </div>
  );
};
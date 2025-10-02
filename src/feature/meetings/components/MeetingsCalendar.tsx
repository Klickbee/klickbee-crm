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
  // helper inside MeetingsCalendar
const getHeaderDate = () => {
  switch (currentView) {
    case 'daily':
      // Full: Weekday, Month Day, Year
      return currentDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

  case 'weekly':
  const start = new Date(currentDate);
  const end = new Date(currentDate);

  // Monday as start of week
  start.setDate(currentDate.getDate() - currentDate.getDay() );
  // Sunday as end of week
  end.setDate(start.getDate() + 6);

  const startStr = start.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  });

  const endDay = end.toLocaleDateString('en-US', {
    day: 'numeric',
  });

  const year = end.getFullYear();

  return `${startStr} – ${endDay}, ${year}`;



    case 'monthly':
      // Month + Year only
      return currentDate.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });

    case 'yearly':
      // Year only
      return currentDate.getFullYear().toString();

    default:
      return currentDate.toLocaleDateString();
  }
};


  return (
    <div className="">
      <div className="w-full flex flex-col">
        <CalendarHeader
          currentDate={currentDate}
          currentView={currentView}
          onDateChange={setCurrentDate}
          onViewChange={setCurrentView}
          onAddMeeting={openAddMeeting}
        />

        {/* Main Calendar Content */}
        <div className="flex flex-1  ">
          {/* Sidebar - Much smaller width to match Figma design */}
          <div className="flex-shrink-0" style={{ width: '22%' }}>
            <MeetingsSidebar
              meetings={meetings}
              currentDate={currentDate}
              selectedDate={selectedDate}
              onDateChange={setCurrentDate}
              onSelectedDateChange={setSelectedDate}
              onMeetingClick={openMeetingDetail}
            />
          </div>

          <div className="flex-1 border-l border-[var(--border-gray)] ">
            <div className="flex items-center justify-between py-4 px-8 border-b border-[var(--border-gray)]">
              {/* Left: Date text */}
              <div className=" font-medium">
                 {getHeaderDate()}
              </div>

              {/* Right: View buttons */}
              <div className="flex gap-2 bg-gray-50 rounded-md p-1">
                {[
                  { label: 'Day', value: 'daily' },
                  { label: 'Week', value: 'weekly' },
                  { label: 'Months', value: 'monthly' },
                  { label: 'Years', value: 'yearly' },
                ].map(btn => (
                  <button
                    key={btn.value}
                    onClick={() => setCurrentView(btn.value as any)}
                    className={`px-3 py-1 text-sm rounded-md border transition
          ${currentView === btn.value
                        ? 'bg-white shadow-sm border-[var(--border-gray)]'
                        : 'hover:bg-white border-transparent'
                      }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
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
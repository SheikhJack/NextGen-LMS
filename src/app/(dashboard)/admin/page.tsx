import Announcements from "@/components/Announcements";
import EventList from "@/components/EventList";
import AttendanceChart from "@/components/AttendanceChart";
import BestStudentCard from "@/components/BestStudentCard";
import CountChart from "@/components/CountChart";
import EventCalendar from "@/components/EventCalendar";
import FinanceChart from "@/components/FinanceChart";
import SchoolStatsCard from "@/components/LineChart";

const AdminPage = () => {
  return (
    <div className="p-4 flex gap-4 flex-col md:flex-row bg-stone-200">
      {/* LEFT */}
      <div className="w-full flex flex-col gap-8">
        {/* TOP ROW - BestStudent and SchoolStats beside Calendar */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Left side cards */}
          <div className="w-full lg:w-2/3 flex flex-col gap-4">
            <div className="flex flex-row gap-3 h-[260px]">
              <div className="w-full md:w-1/2">
                <BestStudentCard />
              </div>
              <div className="w-full md:w-1/2">
                <SchoolStatsCard />
              </div>
            </div>
            {/* MIDDLE CHARTS */}
            <div className="w-full h-[450px]">
              <AttendanceChart />
            </div>
          </div>

          {/* RIGHT - Calendar */}
          <div className="w-full lg:w-1/3 gap-5">
            <EventCalendar />
            <Announcements />
            <EventList dateParam={undefined} />
          </div>
        </div>
        {/* BOTTOM CHART */}
        <div className="w-full h-[700px] mt--10">
          <FinanceChart />
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
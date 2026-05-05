import { useState, useEffect } from "react";
import { fetchDeviceStatisticsAPI } from "../services/api";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek
} from "date-fns";
import { vi } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Activity } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";

export function DeviceStatisticsPage() {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const getStats = async () => {
      try {
        setLoading(true);
        const result = await fetchDeviceStatisticsAPI();
        const rawData = result.data || [];

        const groupedMap = new Map();

        rawData.forEach((item: any) => {
          const dt = item.date;
          if (!groupedMap.has(dt)) {
            groupedMap.set(dt, {
              date: dt,
              FAN: { ON: 0, OFF: 0 },
              AC: { ON: 0, OFF: 0 },
              LIGHT: { ON: 0, OFF: 0 },
              PUMP: { ON: 0, OFF: 0 },
              HEATER: { ON: 0, OFF: 0 }
            });
          }
          const dayObj = groupedMap.get(dt);
          const dev = item.device_id.toUpperCase();
          const act = item.action?.toUpperCase(); // "ON" or "OFF"
          if (dayObj[dev] && (act === 'ON' || act === 'OFF')) {
            dayObj[dev][act] += parseInt(item.total, 10);
          }
        });

        // Convert grouped map into sorted array
        const sortedArray = Array.from(groupedMap.values()).sort((a, b) => {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });

        setChartData(sortedArray);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu thống kê: ", error);
      } finally {
        setLoading(false);
      }
    };

    getStats();
  }, []);

  const dataMap = new Map();
  chartData.forEach(item => dataMap.set(item.date, item));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarCells = eachDayOfInterval({ start: startDate, end: endDate });

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const getIntensityColor = (total: number) => {
    if (total === 0) return "bg-gray-50";
    if (total <= 3) return "bg-blue-100";
    if (total <= 10) return "bg-blue-300 transform scale-105 shadow-sm";
    return "bg-blue-500 text-white transform scale-105 shadow-md";
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-800">Thống Kê Thao Tác Thiết Bị</h2>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">

        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-700 capitalize">
            Tháng {format(currentMonth, "MM - yyyy", { locale: vi })}
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="grid grid-cols-7 bg-gray-100 border-b border-gray-200">
            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => (
              <div key={d} className="py-3 text-center text-sm font-semibold text-gray-600">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 bg-gray-200 gap-px">
            {loading ? (
              <div className="col-span-7 h-64 flex items-center justify-center bg-white">
                <span className="text-lg text-gray-400 font-medium">Đang tải dữ liệu lịch...</span>
              </div>
            ) : (
              calendarCells.map((day, idx) => {
                const dateKey = format(day, "yyyy-MM-dd");
                const dayData = dataMap.get(dateKey);
                const totalActivity = dayData ? (
                  dayData.FAN.ON + dayData.FAN.OFF +
                  dayData.AC.ON + dayData.AC.OFF +
                  dayData.LIGHT.ON + dayData.LIGHT.OFF +
                  dayData.PUMP.ON + dayData.PUMP.OFF +
                  dayData.HEATER.ON + dayData.HEATER.OFF
                ) : 0;

                const isCurrentMonth = isSameMonth(day, monthStart);
                const isTodayDate = isToday(day);

                // Use HoverCard only if there's activity to save performance
                if (totalActivity > 0) {
                  return (
                    <HoverCard key={idx} openDelay={200} closeDelay={100}>
                      <HoverCardTrigger asChild>
                        <div
                          className={`relative bg-white aspect-square flex flex-col items-center justify-center transition-all cursor-crosshair
                            ${!isCurrentMonth ? "opacity-40 bg-gray-50" : "hover:bg-blue-50"}
                          `}
                        >
                          <span
                            className={`text-sm font-medium z-10 w-8 h-8 flex items-center justify-center rounded-full transition-all
                              ${isTodayDate ? "ring-2 ring-blue-600 ring-offset-2" : ""}
                              ${getIntensityColor(totalActivity)}
                            `}
                          >
                            {format(day, "d")}
                          </span>

                          <div className="mt-1 text-[11px] font-semibold text-gray-500 uppercase flex items-center gap-1 opacity-80">
                            <Activity className="w-3 h-3" /> {totalActivity} LẦN
                          </div>
                        </div>
                      </HoverCardTrigger>

                      <HoverCardContent
                        side="top"
                        align="center"
                        sideOffset={10}
                        className="w-72 bg-gray-900 border-gray-800 text-white shadow-xl rounded-xl z-50 p-4"
                      >
                        <p className="font-semibold text-sm mb-3 text-center border-b border-gray-700 pb-2 text-gray-100">
                          Ngày {format(day, "dd/MM/yyyy")}
                        </p>
                        <div className="space-y-2 text-sm pt-1">
                          <div className="flex justify-between items-center bg-gray-800/50 p-2 rounded-lg">
                            <span className="text-gray-300 font-medium w-20">Quạt:</span>
                            <div className="flex space-x-2 text-xs">
                              <span className="bg-green-500/20 px-2 py-0.5 rounded border border-green-500/30 text-green-400">Bật: {dayData.FAN.ON}</span>
                              <span className="bg-red-500/20 px-2 py-0.5 rounded border border-red-500/30 text-red-400">Tắt: {dayData.FAN.OFF}</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center bg-gray-800/50 p-2 rounded-lg">
                            <span className="text-gray-300 font-medium w-20">Điều hoà:</span>
                            <div className="flex space-x-2 text-xs">
                              <span className="bg-green-500/20 px-2 py-0.5 rounded border border-green-500/30 text-green-400">Bật: {dayData.AC.ON}</span>
                              <span className="bg-red-500/20 px-2 py-0.5 rounded border border-red-500/30 text-red-400">Tắt: {dayData.AC.OFF}</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center bg-gray-800/50 p-2 rounded-lg">
                            <span className="text-gray-300 font-medium w-20">Đèn:</span>
                            <div className="flex space-x-2 text-xs">
                              <span className="bg-green-500/20 px-2 py-0.5 rounded border border-green-500/30 text-green-400">Bật: {dayData.LIGHT.ON}</span>
                              <span className="bg-red-500/20 px-2 py-0.5 rounded border border-red-500/30 text-red-400">Tắt: {dayData.LIGHT.OFF}</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center bg-gray-800/50 p-2 rounded-lg">
                            <span className="text-gray-300 font-medium w-20">Máy bơm:</span>
                            <div className="flex space-x-2 text-xs">
                              <span className="bg-green-500/20 px-2 py-0.5 rounded border border-green-500/30 text-green-400">Bật: {dayData.PUMP.ON}</span>
                              <span className="bg-red-500/20 px-2 py-0.5 rounded border border-red-500/30 text-red-400">Tắt: {dayData.PUMP.OFF}</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center bg-gray-800/50 p-2 rounded-lg">
                            <span className="text-gray-300 font-medium w-20">Lò sưởi:</span>
                            <div className="flex space-x-2 text-xs">
                              <span className="bg-green-500/20 px-2 py-0.5 rounded border border-green-500/30 text-green-400">Bật: {dayData.HEATER.ON}</span>
                              <span className="bg-red-500/20 px-2 py-0.5 rounded border border-red-500/30 text-red-400">Tắt: {dayData.HEATER.OFF}</span>
                            </div>
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  );
                }

                // Empty day without hover card
                return (
                  <div
                    key={idx}
                    className={`relative bg-white aspect-square flex flex-col items-center justify-center transition-all
                      ${!isCurrentMonth ? "opacity-40 bg-gray-50" : ""}
                    `}
                  >
                    <span
                      className={`text-sm font-medium z-10 w-8 h-8 flex items-center justify-center rounded-full transition-all
                        ${isTodayDate ? "ring-2 ring-gray-400 ring-offset-2" : ""}
                        ${getIntensityColor(totalActivity)}
                      `}
                    >
                      {format(day, "d")}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chú giải */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-gray-50 border"></div> Không có thao tác</div>
          <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-blue-100"></div> Ít (&lt;3 lần)</div>
          <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded shadow-sm bg-blue-300"></div> Vừa (4-10 lần)</div>
          <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded shadow-md bg-blue-500"></div> Nhiều (&gt;10 lần)</div>
        </div>

      </div>
    </div>
  );
}

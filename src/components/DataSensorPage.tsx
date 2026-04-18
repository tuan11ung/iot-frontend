import { useState, useEffect } from "react";
import { ArrowUpDown, Search } from "lucide-react";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { fetchSensorDataAPI } from "../services/api";

// Interface mới chuẩn theo ERD
interface SensorRecord {
  id: string;
  sensorName: string;
  value: number;
  unit: string; // Thêm unit để hiển thị °C, %, lux cho đẹp
  time: string;
}

export function DataSensorPage() {
  // === 1. QUẢN LÝ DỮ LIỆU & TRẠNG THÁI ===
  const [data, setData] = useState<SensorRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [sortField, setSortField] = useState<string>("timestamp");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // === 2. BỘ LỌC & TÌM KIẾM MỚI ===
  const [filterSensor, setFilterSensor] = useState<string>("all");
  const [searchBy, setSearchBy] = useState<string>("value"); // "value" hoặc "time"
  const [searchKeyword, setSearchKeyword] = useState("");

  // === 3. HÀM FETCH DỮ LIỆU ===
  const fetchSensorData = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      
      const result = await fetchSensorDataAPI({
        page: currentPage,
        limit: itemsPerPage,
        sortField: sortField,
        sortDir: sortDirection,
        sensorType: filterSensor,
        searchBy: searchBy,
        search: searchKeyword
      });

      if (result && result.data) {
        const formattedData = result.data.map((item: any) => {
          const dateObj = new Date(item.timestamp);
          // Format cứng bằng tay để đảm bảo luôn ra chuẩn DD/MM/YYYY HH:MM:SS
          const pad = (num: number) => num.toString().padStart(2, '0');
          const timeString = `${pad(dateObj.getDate())}/${pad(dateObj.getMonth() + 1)}/${dateObj.getFullYear()} ${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}:${pad(dateObj.getSeconds())}`;

          // Xử lý đơn vị hiển thị (Unit) dựa theo tên cảm biến
          let unit = "";
          let sensorDisplayName = item.sensor_name || "Unknown";
          
          if (sensorDisplayName.toLowerCase().includes("nhiệt độ") || sensorDisplayName.toLowerCase().includes("temp")) unit = "°C";
          else if (sensorDisplayName.toLowerCase().includes("độ ẩm") || sensorDisplayName.toLowerCase().includes("hum")) unit = "%";
          else if (sensorDisplayName.toLowerCase().includes("ánh sáng") || sensorDisplayName.toLowerCase().includes("light")) unit = "lux";

          return {
            id: item._id?.slice(-6).toUpperCase() || item.id,
            sensorName: sensorDisplayName,
            value: item.value,
            unit: unit,
            time: timeString
          };
        });

        setData(formattedData);
        setTotalPages(result.pagination?.totalPages || 1);
        setTotalRecords(result.pagination?.totalRecords || 0);
      }
    } catch (error) {
      console.error("Lỗi gọi API:", error);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  // Vòng lặp 2 giây/lần
  useEffect(() => {
    fetchSensorData(true);
    const intervalId = setInterval(() => fetchSensorData(false), 2000);
    return () => clearInterval(intervalId);
  }, [
    currentPage, itemsPerPage, sortField, sortDirection, 
    filterSensor, searchBy, searchKeyword
  ]);

  // === 4. UI COMPONENTS CỦA BẢNG ===
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxButtons = 5;
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage < maxButtons - 1) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      if (i < 1) continue;
      buttons.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-3 py-1 rounded min-w-[32px] border transition-colors ${
            currentPage === i
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-700 hover:bg-gray-100 border-gray-200"
          }`}
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

  const handleSort = (field: string) => {
    if (sortField === field) setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDirection("asc"); }
    setCurrentPage(1);
  };

  const getColor = (sensorName: string) => {
    const name = sensorName.toLowerCase();
    if (name.includes('nhiệt độ')) return 'text-orange-500';
    if (name.includes('độ ẩm')) return 'text-blue-500';
    if (name.includes('ánh sáng')) return 'text-yellow-500';
    return 'text-gray-800'; // Màu mặc định
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">DATA SENSOR</h2>

      {/* THANH CÔNG CỤ TÌM KIẾM & BỘ LỌC (RÚT GỌN) */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row items-center gap-4">
          
          {/* Lọc theo Cảm biến */}
          <Select value={filterSensor} onValueChange={(val) => { setFilterSensor(val); setCurrentPage(1); }}>
            <SelectTrigger className="w-full md:w-48 bg-gray-50">
              <SelectValue placeholder="Chọn cảm biến" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả cảm biến</SelectItem>
              <SelectItem value="Temperature">Nhiệt độ</SelectItem>
              <SelectItem value="Humidity">Độ ẩm</SelectItem>
              <SelectItem value="Light">Ánh sáng</SelectItem>
            </SelectContent>
          </Select>

          {/* Chọn loại tìm kiếm */}
          <Select value={searchBy} onValueChange={(val) => { setSearchBy(val); setCurrentPage(1); setSearchKeyword(""); }}>
            <SelectTrigger className="w-full md:w-40 bg-gray-50">
              <SelectValue placeholder="Tìm theo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="value">Theo Giá trị</SelectItem>
              <SelectItem value="time">Theo Thời gian</SelectItem>
            </SelectContent>
          </Select>

          {/* Input Tìm kiếm */}
          <div className="flex-1 w-full relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder={searchBy === "value" ? "Nhập giá trị (VD: 34.5, 75)..." : "VD: 2026, 04/04/2026 01:01..."}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') setCurrentPage(1); }}
              className="pl-10 border-gray-300"
            />
          </div>
        </div>
      </div>

      {/* BẢNG DỮ LIỆU */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden relative">
        {isLoading && (
            <div className="absolute inset-0 bg-white/40 flex items-center justify-center z-10 backdrop-blur-[1px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Mã (ID)</th>
                <th className="px-6 py-4 text-left">
                  <button onClick={() => handleSort("sensor_name")} className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900">
                    Cảm biến <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button onClick={() => handleSort("value")} className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900">
                    Giá trị <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button onClick={() => handleSort("timestamp")} className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900">
                    Thời gian <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.length === 0 && !isLoading ? (
                  <tr><td colSpan={4} className="text-center py-8 text-gray-500">Không tìm thấy dữ liệu nào</td></tr>
              ) : (
                data.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-500 font-mono text-sm">#{record.id}</td>
                    <td className={`px-6 py-4 font-semibold ${getColor(record.sensorName)}`}>{record.sensorName}</td>
                    <td className={`px-6 py-4 font-bold ${getColor(record.sensorName)}`}>
                      {record.value} <span className={`text-gray-500 font-normal text-sm ${getColor(record.sensorName)}`} >{record.unit}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{record.time}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PHÂN TRANG */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Rows per page:</span>
            <Select value={itemsPerPage.toString()} onValueChange={(val) => { setItemsPerPage(Number(val)); setCurrentPage(1); }}>
              <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-gray-500 ml-4 italic hidden sm:inline">
              {(currentPage - 1) * itemsPerPage + 1}-
              {Math.min(currentPage * itemsPerPage, totalRecords)} of {totalRecords} records
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ‹
            </button>
            {renderPaginationButtons()}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1 rounded border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
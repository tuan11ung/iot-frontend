import { useState, useEffect } from "react";
import {
  ArrowUpDown,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const API_BASE_URL = "http://localhost:3000/api";

interface SensorRecord {
  id: string;
  temperature: number;
  humidity: number;
  light: number;
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

  const [sortField, setSortField] = useState<string>("time");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  
  // States cho bộ lọc
  const [tempFilterValue, setTempFilterValue] = useState("");
  const [filterHour, setFilterHour] = useState("");
  const [filterMinute, setFilterMinute] = useState("");
  const [filterSecond, setFilterSecond] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [appliedFilterValue, setAppliedFilterValue] = useState("");
  const [appliedHour, setAppliedHour] = useState("");
  const [appliedMinute, setAppliedMinute] = useState("");
  const [appliedSecond, setAppliedSecond] = useState("");
  const [appliedFromDate, setAppliedFromDate] = useState("");
  const [appliedToDate, setAppliedToDate] = useState("");

  const [showTimePopover, setShowTimePopover] = useState(false);

  // === 2. HÀM FETCH DỮ LIỆU TỪ BACKEND ===
  const fetchSensorData = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        sortField: sortField,
        sortDir: sortDirection,
        search: searchKeyword,
        filterType: filterType,
        filterValue: appliedFilterValue,
        fromDate: appliedFromDate,
        toDate: appliedToDate,
        hour: appliedHour,
        minute: appliedMinute,
        second: appliedSecond
      });

      const response = await fetch(`${API_BASE_URL}/sensors/data?${params}`);
      const result = await response.json();

      const formattedData = result.data.map((item: any) => {
        const dateObj = new Date(item.timestamp);
        const timeString = dateObj.toLocaleString("en-GB", {
            day: "2-digit", month: "2-digit", year: "numeric",
            hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
        }).replace(",", "");

        return {
          id: item._id.slice(-6).toUpperCase(),
          temperature: item.temperature,
          humidity: item.humidity,
          light: item.light,
          time: timeString
        };
      });

      setData(formattedData);
      setTotalPages(result.pagination.totalPages);
      setTotalRecords(result.pagination.totalRecords);
      
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
    searchKeyword, filterType, appliedFilterValue, 
    appliedFromDate, appliedToDate, appliedHour, appliedMinute, appliedSecond
  ]);

  // === 3. LOGIC HIỂN THỊ NÚT PHÂN TRANG (GIỐNG UI BẢN 2) ===
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxButtons = 5; // Số nút tối đa hiển thị
    
    // Tính toán dải trang (Ví dụ: đang ở trang 10 thì hiện 8, 9, 10, 11, 12)
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage < maxButtons - 1) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-3 py-1 rounded min-w-[32px] transition-colors ${
            currentPage === i
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
          }`}
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

  // Các hàm phụ
  const handleSort = (field: string) => {
    if (sortField === field) setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDirection("asc"); }
    setCurrentPage(1);
  };

  const applyFilters = () => {
    setAppliedFilterValue(tempFilterValue);
    setAppliedHour(filterHour);
    setAppliedMinute(filterMinute);
    setAppliedSecond(filterSecond);
    setAppliedFromDate(fromDate);
    setAppliedToDate(toDate);
    setCurrentPage(1);
    setShowTimePopover(false);
  };

  const clearFilters = () => {
    setFilterType("all"); setSearchKeyword(""); setTempFilterValue(""); setAppliedFilterValue("");
    setFilterHour(""); setFilterMinute(""); setFilterSecond("");
    setAppliedHour(""); setAppliedMinute(""); setAppliedSecond("");
    setFromDate(""); setToDate(""); setAppliedFromDate(""); setAppliedToDate("");
    setCurrentPage(1);
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">DATA SENSOR</h2>

      {/* TOOLBAR */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search (nhấn Enter)..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') setCurrentPage(1); }}
              className="pl-10"
            />
          </div>

          <Select value={sortField} onValueChange={(value) => handleSort(value)}>
            <SelectTrigger className="w-48">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4" />
                <SelectValue placeholder="Sắp xếp" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="time">Sort by Time</SelectItem>
              <SelectItem value="temperature">Sort by Temp</SelectItem>
              <SelectItem value="humidity">Sort by Humi</SelectItem>
              <SelectItem value="light">Sort by Light</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative">
            <Button variant="outline" onClick={() => setShowTimePopover(!showTimePopover)}>
              <SlidersHorizontal className="w-4 h-4 mr-2" /> Filter
            </Button>
            {showTimePopover && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowTimePopover(false)} />
                <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl w-96 p-6 z-50 border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4">Bộ lọc</h3>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Giá trị</label>
                    <div className="flex gap-2">
                        <Select value={filterType} onValueChange={setFilterType}>
                            <SelectTrigger className="w-1/2"><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả</SelectItem>
                                <SelectItem value="temperature">Nhiệt độ</SelectItem>
                                <SelectItem value="humidity">Độ ẩm</SelectItem>
                                <SelectItem value="light">Ánh sáng</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input placeholder="Số..." value={tempFilterValue} onChange={(e) => setTempFilterValue(e.target.value)} />
                    </div>
                  </div>
                  <div className="mb-4 flex gap-2">
                    <div className="w-1/2">
                        <label className="text-xs">Từ ngày</label>
                        <Input placeholder="dd/mm/yyyy" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                    </div>
                    <div className="w-1/2">
                        <label className="text-xs">Đến ngày</label>
                        <Input placeholder="dd/mm/yyyy" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                    </div>
                  </div>
                  <div className="mb-6">
                    <label className="text-xs">Giờ:Phút:Giây</label>
                    <div className="grid grid-cols-3 gap-2">
                        <Input type="number" placeholder="HH" value={filterHour} onChange={(e) => setFilterHour(e.target.value)} />
                        <Input type="number" placeholder="MM" value={filterMinute} onChange={(e) => setFilterMinute(e.target.value)} />
                        <Input type="number" placeholder="SS" value={filterSecond} onChange={(e) => setFilterSecond(e.target.value)} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={clearFilters} className="flex-1">Xóa</Button>
                    <Button onClick={applyFilters} className="flex-1 bg-blue-600">Áp dụng</Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* TABLE */}
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
                {["temperature", "humidity", "light", "time"].map((field) => (
                  <th key={field} className="px-6 py-4 text-left">
                    <button onClick={() => handleSort(field)} className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900 capitalize">
                      {field} <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-500 font-mono text-sm">#{record.id}</td>
                  <td className="px-6 py-4 text-gray-800">{record.temperature}°C</td>
                  <td className="px-6 py-4 text-gray-800">{record.humidity}%</td>
                  <td className="px-6 py-4 text-gray-800">{record.light} lux</td>
                  <td className="px-6 py-4 text-gray-600">{record.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PHÂN TRANG (UI CHUẨN BẢN 2) */}
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
            <span className="text-sm text-gray-500 ml-4 italic">
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
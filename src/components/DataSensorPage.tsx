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
  // === 1. QUẢN LÝ DỮ LIỆU TỪ BACKEND ===
  const [data, setData] = useState<SensorRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // === 2. QUẢN LÝ PHÂN TRANG ===
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // === 3. QUẢN LÝ SẮP XẾP ===
  const [sortField, setSortField] = useState<string>("time");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // === 4. QUẢN LÝ BỘ LỌC ===
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  
  // Tạm giữ input khi đang gõ
  const [tempFilterValue, setTempFilterValue] = useState("");
  const [filterHour, setFilterHour] = useState("");
  const [filterMinute, setFilterMinute] = useState("");
  const [filterSecond, setFilterSecond] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Các giá trị đã được "Áp dụng" (Chỉ gọi API khi nhấn Áp dụng)
  const [appliedFilterValue, setAppliedFilterValue] = useState("");
  const [appliedHour, setAppliedHour] = useState("");
  const [appliedMinute, setAppliedMinute] = useState("");
  const [appliedSecond, setAppliedSecond] = useState("");
  const [appliedFromDate, setAppliedFromDate] = useState("");
  const [appliedToDate, setAppliedToDate] = useState("");

  const [showTimePopover, setShowTimePopover] = useState(false);

  // =====================================================================
  // HÀM GỌI API BACKEND KHI CÓ BẤT KỲ SỰ THAY ĐỔI NÀO VỀ TRANG/LỌC/SORT
  // =====================================================================
  const fetchSensorData = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true); // Chỉ bật loading nếu có yêu cầu
      
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
      if (showLoading) setIsLoading(false); // Tắt loading
    }
  };

  // useEffect này sẽ tự động chạy hàm fetchSensorData mỗi khi các biến bên dưới thay đổi
  useEffect(() => {
    // 1. Gọi API có hiển thị Loading (khi đổi trang, đổi bộ lọc, hoặc load lần đầu)
    fetchSensorData(true);

    // 2. Thiết lập vòng lặp gọi API ngầm định kỳ mỗi 2 giây (Không bật Loading)
    const intervalId = setInterval(() => {
      fetchSensorData(false); 
    }, 2000);

    // 3. Dọn dẹp interval khi component unmount hoặc khi deps thay đổi
    return () => clearInterval(intervalId);
  }, [
    currentPage, itemsPerPage, sortField, sortDirection, 
    searchKeyword, filterType, appliedFilterValue, 
    appliedFromDate, appliedToDate, appliedHour, appliedMinute, appliedSecond
  ]);

  // ==========================================
  // CÁC HÀM XỬ LÝ SỰ KIỆN (EVENTS)
  // ==========================================
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(1); // Trở về trang 1 khi sort
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
    setFilterType("all");
    setTempFilterValue("");
    setAppliedFilterValue("");
    setFilterHour(""); setFilterMinute(""); setFilterSecond("");
    setAppliedHour(""); setAppliedMinute(""); setAppliedSecond("");
    setFromDate(""); setToDate("");
    setAppliedFromDate(""); setAppliedToDate("");
    setCurrentPage(1);
  };

  // Tạo các nút phân trang
  const renderPaginationButtons = () => {
    const buttons = [];
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4);

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-3 py-1 rounded ${currentPage === i ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-100"}`}
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Data Sensor</h2>

      {/* THANH CÔNG CỤ TÌM KIẾM & LỌC */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center gap-4">
          
          {/* Global Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Tìm kiếm (nhấn Enter)..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              // Chỉ gọi API khi nhấn Enter để đỡ gửi request liên tục làm nghẽn server
              onKeyDown={(e) => { if (e.key === 'Enter') setCurrentPage(1); }}
              className="pl-10"
            />
          </div>

          {/* Sắp xếp */}
          <Select value={sortField} onValueChange={(value) => handleSort(value)}>
            <SelectTrigger className="w-48">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4" />
                <SelectValue placeholder="Sắp xếp" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="time">Thời gian (Mặc định)</SelectItem>
              <SelectItem value="temperature">Nhiệt độ</SelectItem>
              <SelectItem value="humidity">Độ ẩm</SelectItem>
              <SelectItem value="light">Ánh sáng</SelectItem>
            </SelectContent>
          </Select>

          {/* Nút Bộ Lọc */}
          <div className="relative">
            <Button variant="outline" onClick={() => setShowTimePopover(!showTimePopover)}>
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Bộ lọc nâng cao
            </Button>

            {/* Popup Bộ Lọc */}
            {showTimePopover && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowTimePopover(false)} />
                <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl w-96 p-6 z-50 border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4">Bộ lọc chi tiết</h3>

                  {/* Lọc theo cột */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Lọc theo giá trị</label>
                    <div className="flex gap-2">
                        <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="w-1/2">
                            <SelectValue placeholder="Chọn cột" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả</SelectItem>
                            <SelectItem value="temperature">Nhiệt độ</SelectItem>
                            <SelectItem value="humidity">Độ ẩm</SelectItem>
                            <SelectItem value="light">Ánh sáng</SelectItem>
                        </SelectContent>
                        </Select>
                        <Input 
                            placeholder="Nhập số..." 
                            value={tempFilterValue} 
                            onChange={(e) => setTempFilterValue(e.target.value)} 
                            className="w-1/2" 
                        />
                    </div>
                  </div>

                  {/* Lọc theo ngày */}
                  <div className="mb-4 flex gap-2">
                    <div className="w-1/2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Từ ngày</label>
                        <Input placeholder="dd/mm/yyyy" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                    </div>
                    <div className="w-1/2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Đến ngày</label>
                        <Input placeholder="dd/mm/yyyy" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                    </div>
                  </div>

                  {/* Lọc theo thời gian */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Chính xác tại thời điểm (Giờ:Phút:Giây)</label>
                    <div className="grid grid-cols-3 gap-2">
                      <Input type="number" placeholder="HH" max="23" value={filterHour} onChange={(e) => setFilterHour(e.target.value)} />
                      <Input type="number" placeholder="MM" max="59" value={filterMinute} onChange={(e) => setFilterMinute(e.target.value)} />
                      <Input type="number" placeholder="SS" max="59" value={filterSecond} onChange={(e) => setFilterSecond(e.target.value)} />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={clearFilters} className="flex-1">Xóa bộ lọc</Button>
                    <Button onClick={applyFilters} className="flex-1 bg-blue-600 hover:bg-blue-700">Áp dụng</Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* BẢNG DỮ LIỆU */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden relative">
        {isLoading && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Mã (ID)</th>
                <th className="px-6 py-4 text-left">
                  <button onClick={() => handleSort("temperature")} className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900">
                    Nhiệt độ <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button onClick={() => handleSort("humidity")} className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900">
                    Độ ẩm <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button onClick={() => handleSort("light")} className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900">
                    Ánh sáng <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button onClick={() => handleSort("time")} className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900">
                    Thời gian <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.length === 0 && !isLoading ? (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-500">Không tìm thấy dữ liệu nào</td></tr>
              ) : (
                  data.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-500 font-mono text-sm">#{record.id}</td>
                      <td className="px-6 py-4 text-gray-800 font-medium">{record.temperature}°C</td>
                      <td className="px-6 py-4 text-gray-800 font-medium">{record.humidity}%</td>
                      <td className="px-6 py-4 text-gray-800 font-medium">{record.light} lux</td>
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
            <span className="text-sm text-gray-600">Hiển thị:</span>
            <Select value={itemsPerPage.toString()} onValueChange={(val) => { setItemsPerPage(Number(val)); setCurrentPage(1); }}>
              <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-gray-600 ml-4">
              Tổng số bản ghi: <strong className="text-gray-900">{totalRecords}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded bg-white text-gray-700 border hover:bg-gray-100 disabled:opacity-50"
            >
              Trang trước
            </button>
            {renderPaginationButtons()}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1 rounded bg-white text-gray-700 border hover:bg-gray-100 disabled:opacity-50"
            >
              Trang sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
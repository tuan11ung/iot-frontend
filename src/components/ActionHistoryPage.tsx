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
import { API_BASE_URL } from '../utils/constants.ts';

interface ActionRecord {
  id: string;
  device: string;
  action: string;
  status: string;
  time: string;
}

export function ActionHistoryPage() {
  // === 1. QUẢN LÝ DỮ LIỆU & TRẠNG THÁI ===
  const [data, setData] = useState<ActionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [sortField, setSortField] = useState<string>("requested_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // === 2. BỘ LỌC & TÌM KIẾM MỚI ===
  const [filterDevice, setFilterDevice] = useState<string>("all");
  const [searchBy, setSearchBy] = useState<string>("info"); // "info" hoặc "time"
  const [searchKeyword, setSearchKeyword] = useState("");

  // === 3. HÀM FETCH DỮ LIỆU TỪ BACKEND ===
  const fetchHistoryData = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        sortField: sortField,
        sortDir: sortDirection,
        filterDevice: filterDevice, // all, FAN, AC, LIGHT
        searchBy: searchBy,         // info hoặc time
        search: searchKeyword
      });

      const response = await fetch(`${API_BASE_URL}/history?${params}`);
      const result = await response.json();

      if (result && result.data) {
        const formattedData = result.data.map((item: any) => {
          const dateObj = new Date(item.requested_at);

          // Format cứng bằng tay chuẩn DD/MM/YYYY HH:MM:SS
          const pad = (num: number) => num.toString().padStart(2, '0');
          const timeString = `${pad(dateObj.getDate())}/${pad(dateObj.getMonth() + 1)}/${dateObj.getFullYear()} ${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}:${pad(dateObj.getSeconds())}`;

          return {
            id: item._id.slice(-6).toUpperCase(),
            device: item.device_id,
            action: item.action,
            status: item.status,
            time: timeString
          };
        });

        setData(formattedData);
        setTotalPages(result.pagination?.totalPages || 1);
        setTotalRecords(result.pagination?.totalRecords || 0);
      }
    } catch (error) {
      console.error("Lỗi gọi API History:", error);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  // Vòng lặp cập nhật 2 giây/lần
  useEffect(() => {
    fetchHistoryData(true);
    const intervalId = setInterval(() => fetchHistoryData(false), 2000);
    return () => clearInterval(intervalId);
  }, [
    currentPage, itemsPerPage, sortField, sortDirection,
    filterDevice, searchBy, searchKeyword
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
          className={`px-3 py-1 rounded min-w-[32px] border transition-colors ${currentPage === i
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

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">ACTION HISTORY</h2>

      {/* TOOLBAR TỐI GIẢN CHUẨN MỚI */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row items-center gap-4">

          {/* Lọc theo Thiết bị */}
          <Select value={filterDevice} onValueChange={(val) => { setFilterDevice(val); setCurrentPage(1); }}>
            <SelectTrigger className="w-full md:w-48 bg-gray-50">
              <SelectValue placeholder="Chọn thiết bị" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả thiết bị</SelectItem>
              <SelectItem value="FAN">Quạt</SelectItem>
              <SelectItem value="AC">Điều hòa</SelectItem>
              <SelectItem value="LIGHT">Đèn</SelectItem>
            </SelectContent>
          </Select>

          {/* Chọn loại tìm kiếm */}
          <Select value={searchBy} onValueChange={(val) => { setSearchBy(val); setCurrentPage(1); setSearchKeyword(""); }}>
            <SelectTrigger className="w-full md:w-48 bg-gray-50">
              <SelectValue placeholder="Tìm theo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="info">Theo Thông tin</SelectItem>
              <SelectItem value="time">Theo Thời gian</SelectItem>
            </SelectContent>
          </Select>

          {/* Input Tìm kiếm */}
          <div className="flex-1 w-full relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder={searchBy === "info" ? "Nhập ID, lệnh (ON/OFF), trạng thái..." : "VD: 2026, 04/04/2026 01:01..."}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') setCurrentPage(1); }}
              className="pl-10 border-gray-300"
            />
          </div>

        </div>
      </div>

      {/* BẢNG DỮ LIỆU LỊCH SỬ */}
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
                  <button onClick={() => handleSort("device_id")} className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900">
                    Thiết bị <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button onClick={() => handleSort("action")} className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900">
                    Hành động <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button onClick={() => handleSort("status")} className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900">
                    Trạng thái <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button onClick={() => handleSort("requested_at")} className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900">
                    Thời gian <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.length === 0 && !isLoading ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-500">Không tìm thấy lịch sử nào</td></tr>
              ) : (
                data.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-500 font-mono text-sm">#{record.id}</td>
                    <td className="px-6 py-4 text-gray-800 font-medium">{record.device}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${record.action === "ON"
                        ? "bg-blue-100 text-blue-700 border-blue-200"
                        : "bg-gray-100 text-gray-700 border-gray-200"
                        }`}>
                        {record.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${record.status === "Success" ? "bg-green-100 text-green-700" :
                        record.status === "Pending" ? "bg-yellow-100 text-yellow-700 animate-pulse" :
                          "bg-red-100 text-red-700"
                        }`}>
                        {record.status}
                      </span>
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
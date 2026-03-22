import { useState, useEffect } from "react";
import { ArrowUpDown, Search, SlidersHorizontal } from "lucide-react";
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

interface ActionRecord {
  id: string;
  device: string;
  action: string;
  status: string;
  time: string;
}

export function ActionHistoryPage() {
  // === 1. QUẢN LÝ DỮ LIỆU TỪ BACKEND ===
  const [data, setData] = useState<ActionRecord[]>([]);
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

  // ==========================================
  // HÀM FETCH DỮ LIỆU (CÓ THÔNG SỐ SERVER)
  // ==========================================
  const fetchHistoryData = async (showLoading = true) => {
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

      const response = await fetch(`${API_BASE_URL}/history?${params}`);
      const result = await response.json();

      const formattedData = result.data.map((item: any) => {
        const dateObj = new Date(item.requested_at); // Lấy thời gian gửi lệnh
        const timeString = dateObj.toLocaleString("en-GB", {
            day: "2-digit", month: "2-digit", year: "numeric",
            hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
        }).replace(",", "");

        return {
          id: item._id.slice(-6).toUpperCase(),
          device: item.device_id, // Lấy tên thiết bị
          action: item.action,
          status: item.status, // Pending, Success, Failed...
          time: timeString
        };
      });

      setData(formattedData);
      setTotalPages(result.pagination.totalPages);
      setTotalRecords(result.pagination.totalRecords);

    } catch (error) {
      console.error("Lỗi gọi API History:", error);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  // ==========================================
  // VÒNG LẶP & LẮNG NGHE SỰ KIỆN
  // ==========================================
  useEffect(() => {
    fetchHistoryData(true); // Load có vòng xoay khi đổi trang/filter

    const intervalId = setInterval(() => {
      fetchHistoryData(false); // Cập nhật ngầm mỗi 2s (Polling)
    }, 2000);

    return () => clearInterval(intervalId);
  }, [
    currentPage, itemsPerPage, sortField, sortDirection, 
    searchKeyword, filterType, appliedFilterValue, 
    appliedFromDate, appliedToDate, appliedHour, appliedMinute, appliedSecond
  ]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
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
    setFilterType("all");
    setSearchKeyword("");
    setTempFilterValue(""); setAppliedFilterValue("");
    setFilterHour(""); setFilterMinute(""); setFilterSecond("");
    setAppliedHour(""); setAppliedMinute(""); setAppliedSecond("");
    setFromDate(""); setToDate("");
    setAppliedFromDate(""); setAppliedToDate("");
    setCurrentPage(1);
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4);

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button key={i} onClick={() => setCurrentPage(i)}
          className={`px-3 py-1 rounded ${currentPage === i ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-100"}`}
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

  // ==========================================
  // UI RENDERING
  // ==========================================
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Action History</h2>

      {/* THANH CÔNG CỤ TÌM KIẾM & LỌC */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Tìm kiếm (nhấn Enter)..."
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
              <SelectItem value="time">Thời gian (Mặc định)</SelectItem>
              <SelectItem value="id">ID</SelectItem>
              <SelectItem value="device">Thiết bị</SelectItem>
              <SelectItem value="action">Hành động</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative">
            <Button variant="outline" onClick={() => setShowTimePopover(!showTimePopover)}>
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Bộ lọc nâng cao
            </Button>

            {showTimePopover && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowTimePopover(false)} />
                <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl w-96 p-6 z-50 border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4">Bộ lọc</h3>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm theo cột</label>
                    <div className="flex gap-2">
                      <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="w-1/2">
                          <SelectValue placeholder="Chọn..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tất cả</SelectItem>
                          <SelectItem value="device">Thiết bị</SelectItem>
                          <SelectItem value="action">Hành động</SelectItem>
                          <SelectItem value="status">Trạng thái</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input 
                        placeholder="Nhập giá trị..." 
                        value={tempFilterValue} 
                        onChange={(e) => setTempFilterValue(e.target.value)} 
                        className="w-1/2" 
                      />
                    </div>
                  </div>

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

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian (Giờ:Phút:Giây)</label>
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
                  <button onClick={() => handleSort("device")} className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900">
                    Thiết bị <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button onClick={() => handleSort("action")} className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900">
                    Hành động <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Trạng thái</th>
                <th className="px-6 py-4 text-left">
                  <button onClick={() => handleSort("time")} className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900">
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
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 border">
                          {record.action}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {/* Style màu sắc tùy theo trạng thái Database thực tế */}
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            record.status === "Success" ? "bg-green-100 text-green-700" :
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
            <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}
              className="px-3 py-1 rounded bg-white text-gray-700 border hover:bg-gray-100 disabled:opacity-50"
            >
              Trang trước
            </button>
            {renderPaginationButtons()}
            <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages || totalPages === 0}
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
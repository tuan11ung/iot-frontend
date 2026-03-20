import { useState, useMemo } from "react";
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

interface SensorRecord {
  id: number;
  temperature: number;
  humidity: number;
  light: number;
  time: string;
}

export function DataSensorPage() {
  // Generate mock data
  const generateMockData = (): SensorRecord[] => {
    const data: SensorRecord[] = [];
    const baseDate = new Date("2024-11-05T17:00:00");

    for (let i = 0; i < 100; i++) {
      const recordDate = new Date(
        baseDate.getTime() + i * 2000,
      ); // 2 seconds apart
      data.push({
        id: 4352 + i,
        temperature: 31,
        humidity: 94,
        light: Math.random() > 0.5 ? 87 : 80,
        time: recordDate
          .toLocaleString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          })
          .replace(",", ""),
      });
    }
    return data.reverse();
  };

  const [allData] = useState<SensorRecord[]>(
    generateMockData(),
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<
    keyof SensorRecord | null
  >(null);
  const [sortDirection, setSortDirection] = useState<
    "asc" | "desc"
  >("asc");

  // Time popover states
  const [showTimePopover, setShowTimePopover] = useState(false);
  const [filterHour, setFilterHour] = useState("");
  const [filterMinute, setFilterMinute] = useState("");
  const [filterSecond, setFilterSecond] = useState("");
  const [appliedHour, setAppliedHour] = useState("");
  const [appliedMinute, setAppliedMinute] = useState("");
  const [appliedSecond, setAppliedSecond] = useState("");

  // Date range states
  const [showDateRangePopover, setShowDateRangePopover] =
    useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [appliedFromDate, setAppliedFromDate] = useState("");
  const [appliedToDate, setAppliedToDate] = useState("");

  // Filter states
  const [filterType, setFilterType] = useState<string>("all");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterId, setFilterId] = useState("");
  const [filterTemperature, setFilterTemperature] =
    useState("");
  const [filterHumidity, setFilterHumidity] = useState("");
  const [filterLight, setFilterLight] = useState("");
  const [filterTime, setFilterTime] = useState("");

  // Handle sorting
  const handleSort = (field: keyof SensorRecord) => {
    if (sortField === field) {
      setSortDirection(
        sortDirection === "asc" ? "desc" : "asc",
      );
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Parse date from DD/MM/YYYY format
  const parseDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    const parts = dateStr.split("/");
    if (parts.length !== 3) return null;
    // Create date from DD/MM/YYYY
    return new Date(
      parseInt(parts[2]),
      parseInt(parts[1]) - 1,
      parseInt(parts[0]),
    );
  };

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = [...allData];

    // Apply date range filter
    if (appliedFromDate || appliedToDate) {
      filtered = filtered.filter((item) => {
        const timeParts = item.time.split(" ");
        const itemDate = parseDate(timeParts[0]);
        if (!itemDate) return false;

        if (appliedFromDate) {
          const fromDateParsed = parseDate(appliedFromDate);
          if (fromDateParsed && itemDate < fromDateParsed)
            return false;
        }

        if (appliedToDate) {
          const toDateParsed = parseDate(appliedToDate);
          if (toDateParsed) {
            // Set to end of day for toDate
            toDateParsed.setHours(23, 59, 59, 999);
            if (itemDate > toDateParsed) return false;
          }
        }

        return true;
      });
    }

    // Apply time filter (hour, minute, second)
    if (appliedHour || appliedMinute || appliedSecond) {
      filtered = filtered.filter((item) => {
        const timeParts = item.time.split(" ");
        const clockParts = timeParts[1].split(":");

        const hour = clockParts[0];
        const minute = clockParts[1];
        const second = clockParts[2];

        if (
          appliedHour &&
          hour !== appliedHour.padStart(2, "0")
        )
          return false;
        if (
          appliedMinute &&
          minute !== appliedMinute.padStart(2, "0")
        )
          return false;
        if (
          appliedSecond &&
          second !== appliedSecond.padStart(2, "0")
        )
          return false;

        return true;
      });
    }

    // Apply keyword search
    if (searchKeyword) {
      filtered = filtered.filter(
        (item) =>
          item.id.toString().includes(searchKeyword) ||
          item.temperature.toString().includes(searchKeyword) ||
          item.humidity.toString().includes(searchKeyword) ||
          item.light.toString().includes(searchKeyword) ||
          item.time
            .toLowerCase()
            .includes(searchKeyword.toLowerCase()),
      );
    }

    // Apply filters
    if (filterType !== "all") {
      if (filterType === "id" && filterId) {
        filtered = filtered.filter((item) =>
          item.id.toString().includes(filterId),
        );
      } else if (
        filterType === "temperature" &&
        filterTemperature
      ) {
        filtered = filtered.filter((item) =>
          item.temperature
            .toString()
            .includes(filterTemperature),
        );
      } else if (filterType === "humidity" && filterHumidity) {
        filtered = filtered.filter((item) =>
          item.humidity.toString().includes(filterHumidity),
        );
      } else if (filterType === "light" && filterLight) {
        filtered = filtered.filter((item) =>
          item.light.toString().includes(filterLight),
        );
      } else if (filterType === "time" && filterTime) {
        filtered = filtered.filter((item) =>
          item.time
            .toLowerCase()
            .includes(filterTime.toLowerCase()),
        );
      }
    } else {
      const searchTerm =
        filterId ||
        filterTemperature ||
        filterHumidity ||
        filterLight ||
        filterTime;
      if (searchTerm) {
        filtered = filtered.filter(
          (item) =>
            item.id.toString().includes(searchTerm) ||
            item.temperature.toString().includes(searchTerm) ||
            item.humidity.toString().includes(searchTerm) ||
            item.light.toString().includes(searchTerm) ||
            item.time
              .toLowerCase()
              .includes(searchTerm.toLowerCase()),
        );
      }
    }

    // Apply sorting
    if (sortField) {
      filtered.sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];

        if (
          typeof aValue === "string" &&
          typeof bValue === "string"
        ) {
          return sortDirection === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        return sortDirection === "asc"
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      });
    }

    return filtered;
  }, [
    allData,
    sortField,
    sortDirection,
    appliedFromDate,
    appliedToDate,
    appliedHour,
    appliedMinute,
    appliedSecond,
    searchKeyword,
    filterType,
    filterId,
    filterTemperature,
    filterHumidity,
    filterLight,
    filterTime,
  ]);

  // Pagination
  const totalPages = Math.ceil(
    filteredAndSortedData.length / itemsPerPage,
  );
  const paginatedData = filteredAndSortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Reset to page 1 when filters change
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilterType("all");
    setSearchKeyword("");
    setFilterId("");
    setFilterTemperature("");
    setFilterHumidity("");
    setFilterLight("");
    setFilterTime("");
    setAppliedHour("");
    setAppliedMinute("");
    setAppliedSecond("");
    setFilterHour("");
    setFilterMinute("");
    setFilterSecond("");
    setAppliedFromDate("");
    setAppliedToDate("");
    setFromDate("");
    setToDate("");
    setCurrentPage(1);
  };

  const applyTimeFilter = () => {
    setAppliedHour(filterHour);
    setAppliedMinute(filterMinute);
    setAppliedSecond(filterSecond);
    setShowTimePopover(false);
    setCurrentPage(1);
  };

  const clearTimeFilter = () => {
    setFilterHour("");
    setFilterMinute("");
    setFilterSecond("");
  };

  const applyDateRangeFilter = () => {
    setAppliedFromDate(fromDate);
    setAppliedToDate(toDate);
    setShowDateRangePopover(false);
    setCurrentPage(1);
  };

  const clearDateRangeFilter = () => {
    setFromDate("");
    setToDate("");
  };

  const selectQuickHourRange = (hour: number) => {
    setFilterHour(hour.toString());
    setFilterMinute("");
    setFilterSecond("");
  };

  const getTimeFilterDisplay = () => {
    if (!appliedHour && !appliedMinute && !appliedSecond)
      return "Chọn thời gian";
    const parts = [];
    if (appliedHour)
      parts.push(`${appliedHour.padStart(2, "0")}h`);
    if (appliedMinute)
      parts.push(`${appliedMinute.padStart(2, "0")}m`);
    if (appliedSecond)
      parts.push(`${appliedSecond.padStart(2, "0")}s`);
    return parts.join(":");
  };

  const getDateRangeDisplay = () => {
    if (!appliedFromDate && !appliedToDate) return "Chọn ngày";
    if (appliedFromDate && appliedToDate)
      return `${appliedFromDate} - ${appliedToDate}`;
    if (appliedFromDate) return `Từ ${appliedFromDate}`;
    if (appliedToDate) return `Đến ${appliedToDate}`;
    return "Chọn ngày";
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxButtons = 5;
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(
      totalPages,
      startPage + maxButtons - 1,
    );

    if (endPage - startPage < maxButtons - 1) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-3 py-1 rounded ${
            currentPage === i
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          {i}
        </button>,
      );
    }

    return buttons;
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        DATA SENSOR
      </h2>

      {/* Search, Sort, Filter Toolbar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search"
              value={searchKeyword}
              onChange={(e) => {
                setSearchKeyword(e.target.value);
                handleFilterChange();
              }}
              className="pl-10"
            />
          </div>

          {/* Sort */}
          <Select
            value={sortField || "none"}
            onValueChange={(value) => {
              if (value === "none") {
                setSortField(null);
              } else {
                setSortField(value as keyof SensorRecord);
                setSortDirection("asc");
              }
            }}
          >
            <SelectTrigger className="w-48">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4" />
                <SelectValue placeholder="SORT: A-Z" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Sort</SelectItem>
              <SelectItem value="id">Sort by ID</SelectItem>
              <SelectItem value="temperature">
                Sort by Temperature
              </SelectItem>
              <SelectItem value="humidity">
                Sort by Humidity
              </SelectItem>
              <SelectItem value="light">
                Sort by Light
              </SelectItem>
              <SelectItem value="time">Sort by Time</SelectItem>
            </SelectContent>
          </Select>

          {/* Filter Button */}
          <div className="relative">
            <Button
              variant="outline"
              onClick={() =>
                setShowTimePopover(!showTimePopover)
              }
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filter
            </Button>

            {/* Filter Popover */}
            {showTimePopover && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowTimePopover(false)}
                />
                <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl w-96 p-6 z-50 border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4">
                    Bộ lọc
                  </h3>

                  {/* Filter Type */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tìm kiếm theo
                    </label>
                    <Select
                      value={filterType}
                      onValueChange={(value) => {
                        setFilterType(value);
                        handleFilterChange();
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tìm kiếm bất kỳ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          Tìm kiếm bất kỳ
                        </SelectItem>
                        <SelectItem value="id">ID</SelectItem>
                        <SelectItem value="temperature">
                          Nhiệt độ
                        </SelectItem>
                        <SelectItem value="humidity">
                          Độ ẩm
                        </SelectItem>
                        <SelectItem value="light">
                          Ánh sáng
                        </SelectItem>
                        <SelectItem value="time">
                          Thời gian
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date Range */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Từ ngày
                    </label>
                    <Input
                      type="text"
                      placeholder="dd/mm/yyyy"
                      value={fromDate}
                      onChange={(e) =>
                        setFromDate(e.target.value)
                      }
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Đến ngày
                    </label>
                    <Input
                      type="text"
                      placeholder="dd/mm/yyyy"
                      value={toDate}
                      onChange={(e) =>
                        setToDate(e.target.value)
                      }
                    />
                  </div>

                  {/* Time Filter */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thời gian (Giờ:Phút:Giây)
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        type="number"
                        placeholder="HH"
                        min="0"
                        max="23"
                        value={filterHour}
                        onChange={(e) =>
                          setFilterHour(e.target.value)
                        }
                        className="text-center"
                      />
                      <Input
                        type="number"
                        placeholder="MM"
                        min="0"
                        max="59"
                        value={filterMinute}
                        onChange={(e) =>
                          setFilterMinute(e.target.value)
                        }
                        className="text-center"
                      />
                      <Input
                        type="number"
                        placeholder="SS"
                        min="0"
                        max="59"
                        value={filterSecond}
                        onChange={(e) =>
                          setFilterSecond(e.target.value)
                        }
                        className="text-center"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        clearFilters();
                        setShowTimePopover(false);
                      }}
                      className="flex-1"
                    >
                      Xóa bộ lọc
                    </Button>
                    <Button
                      onClick={() => {
                        setAppliedHour(filterHour);
                        setAppliedMinute(filterMinute);
                        setAppliedSecond(filterSecond);
                        setAppliedFromDate(fromDate);
                        setAppliedToDate(toDate);
                        setShowTimePopover(false);
                        setCurrentPage(1);
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      Áp dụng
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort("id")}
                    className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900"
                  >
                    ID
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort("temperature")}
                    className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900"
                  >
                    Temperature
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort("humidity")}
                    className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900"
                  >
                    Humidity
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort("light")}
                    className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900"
                  >
                    Light
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort("time")}
                    className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900"
                  >
                    Time
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedData.map((record) => (
                <tr
                  key={record.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 text-gray-800">
                    {record.id}
                  </td>
                  <td className="px-6 py-4 text-gray-800">
                    {record.temperature}
                  </td>
                  <td className="px-6 py-4 text-gray-800">
                    {record.humidity}
                  </td>
                  <td className="px-6 py-4 text-gray-800">
                    {record.light}
                  </td>
                  <td className="px-6 py-4 text-gray-800">
                    {record.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Rows per page:
            </span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => {
                setItemsPerPage(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-gray-600 ml-4">
              {(currentPage - 1) * itemsPerPage + 1}-
              {Math.min(
                currentPage * itemsPerPage,
                filteredAndSortedData.length,
              )}{" "}
              of {filteredAndSortedData.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setCurrentPage(Math.max(1, currentPage - 1))
              }
              disabled={currentPage === 1}
              className="px-3 py-1 rounded bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ‹
            </button>
            {renderPaginationButtons()}
            <button
              onClick={() =>
                setCurrentPage(
                  Math.min(totalPages, currentPage + 1),
                )
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
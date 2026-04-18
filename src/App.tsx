import { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { DashboardPage } from "./components/DashboardPage";
import { ProfilePage } from "./components/ProfilePage";
import { DataSensorPage } from "./components/DataSensorPage";
import { ActionHistoryPage } from "./components/ActionHistoryPage";
import { API_BASE_URL } from './utils/constants.ts'

function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    const savedPage = localStorage.getItem("iot_current_page");
    return savedPage ? savedPage : "dashboard"; // Nếu có thì dùng, không thì về dashboard
  });

  useEffect(() => {
    localStorage.setItem("iot_current_page", currentPage);
  }, [currentPage]);

  const [devices, setDevices] = useState({
    fan: false,
    ac: false,
    light: false,
    pump: false,
    heater: false
  });

  // 1. THÊM STATE ĐỂ QUẢN LÝ TRẠNG THÁI LOADING CỦA TỪNG NÚT
  const [loadingDevices, setLoadingDevices] = useState({
    fan: false,
    ac: false,
    light: false,
    pump: false,
    heater: false
  });

  const [sensorData, setSensorData] = useState({
    temperature: 0,
    humidity: 0,
    light: 0,
  });

  const [chartData, setChartData] = useState<any[]>([]);

  // 1. Hàm gọi API lấy dữ liệu cảm biến (Gộp dữ liệu cho ERD mới)
  const fetchSensorData = async () => {
    try {
      // Lấy 60 bản ghi mới nhất để đảm bảo có đủ dữ liệu vẽ 20 điểm trên biểu đồ 
      // (Vì bây giờ 1 điểm thời gian cần tới 3 bản ghi riêng biệt)
      const response = await fetch(`${API_BASE_URL}/sensors/data?limit=60`);
      const result = await response.json();
      const sensorList = result.data;

      if (sensorList && sensorList.length > 0) {
        // A. LẤY DỮ LIỆU MỚI NHẤT CHO 3 THẺ CARD (Tìm dòng đầu tiên chứa tên cảm biến tương ứng)
        const latestTemp = sensorList.find((s: any) => s.sensor_name.toLowerCase().includes('nhiệt độ'))?.value || 0;
        const latestHumi = sensorList.find((s: any) => s.sensor_name.toLowerCase().includes('độ ẩm'))?.value || 0;
        const latestLux = sensorList.find((s: any) => s.sensor_name.toLowerCase().includes('ánh sáng'))?.value || 0;

        setSensorData({
          temperature: latestTemp,
          humidity: latestHumi,
          light: latestLux,
        });

        // B. GỘP DỮ LIỆU CHO BIỂU ĐỒ (Dùng Map để nhóm theo thời gian HH:mm:ss)
        const chartMap = new Map();

        sensorList.forEach((item: any) => {
          const dateObj = new Date(item.timestamp);
          const timeString = `${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}:${dateObj.getSeconds().toString().padStart(2, '0')}`;

          if (!chartMap.has(timeString)) {
            chartMap.set(timeString, { time: timeString });
          }

          const row = chartMap.get(timeString);
          const name = (item.sensor_name || "").toLowerCase();

          // Bơm giá trị vào nếu chưa có (vì mảng sort DESC, ta lấy giá trị mới nhất của giây đó)
          if (name.includes('nhiệt độ') && row.temperature === undefined) row.temperature = item.value;
          if (name.includes('độ ẩm') && row.humidity === undefined) row.humidity = item.value;
          if (name.includes('ánh sáng') && row.light === undefined) row.light = item.value;
        });

        // Chuyển Map thành Array, lấy 20 điểm đầu tiên, rồi đảo ngược để vẽ đồ thị từ trái sang phải
        const formattedChartData = Array.from(chartMap.values()).slice(0, 20).reverse();

        setChartData(formattedChartData);
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu cảm biến từ Backend:", error);
    }
  };

  useEffect(() => {
    fetchSensorData();
    const interval = setInterval(fetchSensorData, 2000);
    return () => clearInterval(interval);
  }, []);

  // 2. NÂNG CẤP HÀM ĐIỀU KHIỂN (CÓ THÊM TIMEOUT 10 GIÂY VÀ ROLLBACK)
  const handleDeviceToggle = async (device: "fan" | "ac" | "light") => {
    // Nếu nút đang trong trạng thái chờ (loading), chặn không cho bấm tiếp để tránh spam lỗi
    if (loadingDevices[device]) return;

    const currentState = devices[device];
    const newState = !currentState;
    const actionCommand = `${device.toUpperCase()}_${newState ? "ON" : "OFF"}`;

    // A. Bật trạng thái quay Loading và gạt công tắc sang trạng thái mới ngay lập tức
    setLoadingDevices((prev) => ({ ...prev, [device]: true }));
    setDevices((prev) => ({ ...prev, [device]: newState }));

    try {
      // B. Gửi lệnh xuống Server
      const response = await fetch(`${API_BASE_URL}/control`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ device_id: device.toUpperCase(), action: actionCommand }),
      });
      const result = await response.json();
      const actionId = result.data?._id; // Lấy ID của lệnh Pending vừa được tạo

      if (!actionId) throw new Error("Không nhận được ID lệnh");

      // C. Bắt đầu vòng lặp kiểm tra trạng thái mỗi 1 giây (Tối đa 10 lần = 10 giây)
      let attempts = 0;
      const checkInterval = setInterval(async () => {
        attempts++;
        try {
          // Gọi API History lấy 10 lệnh mới nhất để check
          const historyRes = await fetch(`${API_BASE_URL}/history?limit=10`);
          const historyResult = await historyRes.json();

          // Tìm đúng lệnh của mình
          const myAction = historyResult.data.find((item: any) => item._id === actionId);

          if (myAction && myAction.status === 'Success') {
            // 🎉 ESP32 đã phản hồi thành công! Tắt Loading, chốt trạng thái mới
            clearInterval(checkInterval);
            setLoadingDevices((prev) => ({ ...prev, [device]: false }));
            console.log(`Lệnh ${actionCommand} đã chạy thành công!`);
          }
          else if (attempts >= 10) {
            // ⏰ HẾT 10 GIÂY MÀ ESP32 VẪN IM LẶNG (TIMEOUT)
            clearInterval(checkInterval);
            setLoadingDevices((prev) => ({ ...prev, [device]: false })); // Tắt loading
            setDevices((prev) => ({ ...prev, [device]: currentState })); // Trả công tắc về trạng thái cũ (Rollback)
            alert(`⏳ Quá thời gian chờ! Lệnh "${actionCommand}" thất bại do thiết bị không phản hồi.`);
          }
        } catch (e) {
          console.error("Lỗi khi kiểm tra trạng thái lệnh:", e);
        }
      }, 1000); // 1000ms = 1 giây

    } catch (error) {
      // Lỗi sập Server hoặc rớt mạng hoàn toàn
      console.error("Lỗi kết nối:", error);
      setLoadingDevices((prev) => ({ ...prev, [device]: false }));
      setDevices((prev) => ({ ...prev, [device]: currentState })); // Trả về trạng thái cũ
      alert("❌ Không thể kết nối đến máy chủ Backend!");
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return (
          <DashboardPage
            sensorData={sensorData}
            chartData={chartData}
            devices={devices}
            // 3. TRUYỀN BIẾN LOADING XUỐNG DASHBOARD ĐỂ NÓ XỬ LÝ GIAO DIỆN
            loadingDevices={loadingDevices}
            onDeviceToggle={handleDeviceToggle}
          />
        );
      case "profile": return <ProfilePage />;
      case "data-sensor": return <DataSensorPage />;
      case "action-history": return <ActionHistoryPage />;
      default: return <DashboardPage sensorData={sensorData} chartData={chartData} devices={devices} loadingDevices={loadingDevices} onDeviceToggle={handleDeviceToggle} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <div className="ml-64">{renderPage()}</div>
    </div>
  );
}

export default App;
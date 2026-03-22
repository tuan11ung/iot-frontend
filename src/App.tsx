import { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { DashboardPage } from "./components/DashboardPage";
import { ProfilePage } from "./components/ProfilePage";
import { DataSensorPage } from "./components/DataSensorPage";
import { ActionHistoryPage } from "./components/ActionHistoryPage";

// Khai báo Base URL của Backend Node.js
const API_BASE_URL = "http://localhost:3000/api";

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
  });

  // 1. THÊM STATE ĐỂ QUẢN LÝ TRẠNG THÁI LOADING CỦA TỪNG NÚT
  const [loadingDevices, setLoadingDevices] = useState({
    fan: false,
    ac: false,
    light: false,
  });

  const [sensorData, setSensorData] = useState({
    temperature: 0,
    humidity: 0,
    light: 0,
  });

  const [chartData, setChartData] = useState<any[]>([]);

  // Hàm lấy dữ liệu cảm biến (Giữ nguyên)
  const fetchSensorData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/sensors/data`);
      const result = await response.json();
      const sensorList = result.data; 

      if (sensorList && sensorList.length > 0) {
        const latest = sensorList[0];
        setSensorData({
          temperature: latest.temperature,
          humidity: latest.humidity,
          light: latest.light,
        });

        const formattedChartData = sensorList.slice(0, 20).reverse().map((item: any) => {
          const time = new Date(item.timestamp);
          const timeString = `${time.getHours()}:${time.getMinutes().toString().padStart(2, '0')}:${time.getSeconds().toString().padStart(2, '0')}`;
          
          return {
            time: timeString,
            temperature: item.temperature,
            humidity: item.humidity,
            light: item.light,
          };
        });

        setChartData(formattedChartData);
      }
    } catch (error) {
      console.error("Lỗi lấy dữ liệu:", error);
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
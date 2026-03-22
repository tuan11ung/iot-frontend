import { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { DashboardPage } from "./components/DashboardPage";
import { ProfilePage } from "./components/ProfilePage";
import { DataSensorPage } from "./components/DataSensorPage";
import { ActionHistoryPage } from "./components/ActionHistoryPage";

function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [devices, setDevices] = useState({
    fan: false,
    ac: false,
    light: true,
  });

  // Simulated sensor data that updates over time
  const [sensorData, setSensorData] = useState({
    temperature: 28,
    humidity: 65,
    light: 450,
  });

  // Chart data with historical values
  const [chartData, setChartData] = useState(() => {
    // Tạo 12 điểm dữ liệu ban đầu
    const initialData = [];
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 2000); // Mỗi điểm cách nhau 2 giây
      const timeString = `${time.getHours()}:${time.getMinutes().toString().padStart(2, '0')}:${time.getSeconds().toString().padStart(2, '0')}`;
      
      initialData.push({
        time: timeString,
        temperature: 26 + Math.random() * 4, // 26-30
        humidity: 60 + Math.random() * 10, // 60-70
        light: 350 + Math.random() * 200, // 350-550
      });
    }
    
    return initialData;
  });

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Generate new sensor readings with slight variations
      const newTemp = 28 + Math.random() * 4 - 2; // 26-30
      const newHumidity = 65 + Math.random() * 10 - 5; // 60-70
      const newLight = 450 + Math.random() * 200 - 100; // 350-550

      setSensorData({
        temperature: Math.round(newTemp * 10) / 10,
        humidity: Math.round(newHumidity),
        light: Math.round(newLight),
      });

      // Update chart data - Thêm điểm mới vào cuối, xóa điểm cũ ở đầu
      const now = new Date();
      const timeString = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

      setChartData((prevData) => {
        // Giữ tối đa 20 điểm (hiển thị 12, dự trữ 8)
        const newDataPoint = {
          time: timeString,
          temperature: Math.round(newTemp * 10) / 10,
          humidity: Math.round(newHumidity),
          light: Math.round(newLight),
        };
        
        // Thêm điểm mới vào cuối và xóa điểm cũ nhất nếu vượt quá 20 điểm
        const updatedData = [...prevData, newDataPoint];
        if (updatedData.length > 20) {
          return updatedData.slice(-20); // Giữ 20 điểm gần nhất
        }
        return updatedData;
      });
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, []);

  const handleDeviceToggle = (
    device: "fan" | "ac" | "light",
  ) => {
    setDevices((prev) => ({
      ...prev,
      [device]: !prev[device],
    }));
  };

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return (
          <DashboardPage
            sensorData={sensorData}
            chartData={chartData}
            devices={devices}
            onDeviceToggle={handleDeviceToggle}
          />
        );
      case "profile":
        return <ProfilePage />;
      case "data-sensor":
        return <DataSensorPage />;
      case "action-history":
        return <ActionHistoryPage />;
      default:
        return (
          <DashboardPage
            sensorData={sensorData}
            chartData={chartData}
            devices={devices}
            onDeviceToggle={handleDeviceToggle}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
      <div className="ml-64">{renderPage()}</div>
    </div>
  );
}

export default App;
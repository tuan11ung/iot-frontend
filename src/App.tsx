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
  const [chartData, setChartData] = useState([
    {
      time: "10:00",
      temperature: 26,
      humidity: 70,
      light: 300,
    },
    {
      time: "10:30",
      temperature: 26.5,
      humidity: 69,
      light: 350,
    },
    {
      time: "11:00",
      temperature: 27,
      humidity: 68,
      light: 400,
    },
    {
      time: "11:30",
      temperature: 27.5,
      humidity: 67,
      light: 450,
    },
    {
      time: "12:00",
      temperature: 28,
      humidity: 66,
      light: 500,
    },
    {
      time: "12:30",
      temperature: 29,
      humidity: 64,
      light: 550,
    },
    {
      time: "13:00",
      temperature: 28.5,
      humidity: 65,
      light: 480,
    },
    {
      time: "13:30",
      temperature: 28,
      humidity: 65,
      light: 450,
    },
    {
      time: "13:30",
      temperature: 28,
      humidity: 65,
      light: 450,
    },
    {
      time: "13:30",
      temperature: 28,
      humidity: 65,
      light: 450,
    },
  ]);

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

      // Update chart data
      const now = new Date();
      const timeString = `${now.getHours()}:${now.getMinutes().toString().padStart(2, "0")}`;

      setChartData((prevData) => {
        const newData = [
          ...prevData.slice(1),
          {
            time: timeString,
            temperature: Math.round(newTemp * 10) / 10,
            humidity: Math.round(newHumidity),
            light: Math.round(newLight),
          },
        ];
        return newData;
      });
    }, 5000); // Update every 5 seconds

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
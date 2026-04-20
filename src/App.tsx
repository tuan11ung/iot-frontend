import { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { DashboardPage } from "./components/DashboardPage";
import { DataSensorPage } from "./components/DataSensorPage";
import { ActionHistoryPage } from "./components/ActionHistoryPage";
import { DeviceStatisticsPage } from "./components/DeviceStatisticsPage";
import { ProfilePage } from "./components/ProfilePage";

function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    const savedPage = localStorage.getItem("iot_current_page");
    return savedPage ? savedPage : "dashboard"; // Nếu có thì dùng, không thì về dashboard
  });

  useEffect(() => {
    localStorage.setItem("iot_current_page", currentPage);
  }, [currentPage]);

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return (
          <DashboardPage />
        );
      case "profile": return <ProfilePage />;
      case "data-sensor": return <DataSensorPage />;
      case "action-history": return <ActionHistoryPage />;
      case "statistics": return <DeviceStatisticsPage />;
      default: return <DashboardPage />;
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
import { useState, useEffect } from "react";
import { Thermometer, Droplets, Sun } from 'lucide-react';
import { SensorChart } from './SensorChart';
import { DeviceControls } from './DeviceControls';
import { fetchSensorDataAPI } from "../services/api";

export function DashboardPage() {
  const [sensorData, setSensorData] = useState({
    temperature: 0,
    humidity: 0,
    light: 0,
  });

  const [chartData, setChartData] = useState<any[]>([]);

  const fetchSensorData = async () => {
    try {
      const result = await fetchSensorDataAPI({ limit: 60 });
      const sensorList = result.data;

      if (sensorList && sensorList.length > 0) {
        const latestTemp = sensorList.find((s: any) => s.sensor_name.toLowerCase().includes('nhiệt độ'))?.value || 0;
        const latestHumi = sensorList.find((s: any) => s.sensor_name.toLowerCase().includes('độ ẩm'))?.value || 0;
        const latestLux = sensorList.find((s: any) => s.sensor_name.toLowerCase().includes('ánh sáng'))?.value || 0;

        setSensorData({
          temperature: latestTemp,
          humidity: latestHumi,
          light: latestLux,
        });

        const chartMap = new Map();

        sensorList.forEach((item: any) => {
          const dateObj = new Date(item.timestamp);
          const timeString = `${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}:${dateObj.getSeconds().toString().padStart(2, '0')}`;

          if (!chartMap.has(timeString)) {
            chartMap.set(timeString, { time: timeString });
          }

          const row = chartMap.get(timeString);
          const name = (item.sensor_name || "").toLowerCase();

          if (name.includes('nhiệt độ') && row.temperature === undefined) row.temperature = item.value;
          if (name.includes('độ ẩm') && row.humidity === undefined) row.humidity = item.value;
          if (name.includes('ánh sáng') && row.light === undefined) row.light = item.value;
        });

        const formattedChartData = Array.from(chartMap.values()).slice(0, 20).reverse();

        setChartData(formattedChartData);
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu cảm biến từ Backend:", error);
    }
  };

  useEffect(() => {
    fetchSensorData();
    const interval = setInterval(() => {
      fetchSensorData();
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>

      {/* Sensor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-linear-to-br from-orange-500 to-red-500 rounded-lg p-6 text-white shadow-lg transform transition duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Nhiệt độ</p>
              <p className="text-4xl font-bold mt-2">{sensorData.temperature}°C</p>
            </div>
            <Thermometer className="w-12 h-12 text-orange-100" />
          </div>
        </div>

        <div className="bg-linear-to-br from-blue-500 to-cyan-500 rounded-lg p-6 text-white shadow-lg transform transition duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Độ ẩm</p>
              <p className="text-4xl font-bold mt-2">{sensorData.humidity}%</p>
            </div>
            <Droplets className="w-12 h-12 text-blue-100" />
          </div>
        </div>

        <div className="bg-linear-to-br from-yellow-400 to-orange-400 rounded-lg p-6 text-white shadow-lg transform transition duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Ánh sáng</p>
              <p className="text-4xl font-bold mt-2">{sensorData.light} lux</p>
            </div>
            <Sun className="w-12 h-12 text-yellow-100" />
          </div>
        </div>
      </div>

      {/* Chart and Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SensorChart data={chartData} />
        </div>
        <div>
          <DeviceControls />
        </div>
      </div>
    </div>
  );
}
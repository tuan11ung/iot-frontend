import { Thermometer, Droplets, Sun } from 'lucide-react';
import { SensorChart } from './SensorChart';
import { DeviceControls } from './DeviceControls';

interface SensorData {
  temperature: number;
  humidity: number;
  light: number;
}

interface DashboardPageProps {
  sensorData: SensorData;
  chartData: Array<{
    time: string;
    temperature: number;
    humidity: number;
    light: number;
  }>;
  devices: {
    fan: boolean;
    ac: boolean;
    light: boolean;
  };
  onDeviceToggle: (device: 'fan' | 'ac' | 'light') => void;
}

export function DashboardPage({ sensorData, chartData, devices, onDeviceToggle }: DashboardPageProps) {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>
      
      {/* Sensor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Nhiệt độ</p>
              <p className="text-4xl font-bold mt-2">{sensorData.temperature}°C</p>
            </div>
            <Thermometer className="w-12 h-12 text-orange-100" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Độ ẩm</p>
              <p className="text-4xl font-bold mt-2">{sensorData.humidity}%</p>
            </div>
            <Droplets className="w-12 h-12 text-blue-100" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-400 to-orange-400 rounded-lg p-6 text-white shadow-lg">
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
          <DeviceControls devices={devices} onToggle={onDeviceToggle} />
        </div>
      </div>
    </div>
  );
}

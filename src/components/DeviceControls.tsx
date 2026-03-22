import { Fan, Wind, Lightbulb } from 'lucide-react';
import { Switch } from './ui/switch';

interface DeviceControlsProps {
  devices: {
    fan: boolean;
    ac: boolean;
    light: boolean;
  };
  // 1. Thêm loadingDevices vào Interface
  loadingDevices: {
    fan: boolean;
    ac: boolean;
    light: boolean;
  };
  onToggle: (device: 'fan' | 'ac' | 'light') => void;
}

export function DeviceControls({ devices, loadingDevices, onToggle }: DeviceControlsProps) {
  return (
    <div className="p-6">
      <h3 className="text-gray-800 mb-4 font-semibold">Điều khiển thiết bị</h3>
      
      <div className="space-y-3">
        {/* Fan Control */}
        {/* Thêm hiệu ứng opacity và pulse khi đang loading */}
        <div className={`bg-white border border-gray-200 rounded-xl p-4 shadow-sm transition-all duration-300 ${
          loadingDevices.fan ? 'opacity-60 animate-pulse pointer-events-none' : ''
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                devices.fan ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                <Fan className={`w-5 h-5 transition-all ${
                  devices.fan ? 'text-blue-600 animate-spin' : 'text-gray-400'
                }`} />
              </div>
              <div className="flex flex-col">
                <span className="text-gray-900 font-medium">Quạt</span>
                {/* Hiện dòng chữ nhỏ khi loading */}
                {loadingDevices.fan && <span className="text-xs text-blue-500 font-medium">Loading...</span>}
              </div>
            </div>
            <Switch
              checked={devices.fan}
              disabled={loadingDevices.fan} // Khóa Switch
              onCheckedChange={() => onToggle('fan')}
            />
          </div>
        </div>

        {/* AC Control */}
        <div className={`bg-white border border-gray-200 rounded-xl p-4 shadow-sm transition-all duration-300 ${
          loadingDevices.ac ? 'opacity-60 animate-pulse pointer-events-none' : ''
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                devices.ac ? 'bg-cyan-100' : 'bg-gray-100'
              }`}>
                <Wind className={`w-5 h-5 transition-all ${
                  devices.ac ? 'text-cyan-500 animate-pulse' : 'text-gray-400'
                }`} />
              </div>
              <div className="flex flex-col">
                <span className="text-gray-900 font-medium">Điều hòa</span>
                {loadingDevices.ac && <span className="text-xs text-cyan-500 font-medium">Loading...</span>}
              </div>
            </div>
            <Switch
              checked={devices.ac}
              disabled={loadingDevices.ac} // Khóa Switch
              onCheckedChange={() => onToggle('ac')}
            />
          </div>
        </div>

        {/* Light Control */}
        <div className={`bg-white border border-gray-200 rounded-xl p-4 shadow-sm transition-all duration-300 ${
          loadingDevices.light ? 'opacity-60 animate-pulse pointer-events-none' : ''
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                devices.light ? 'bg-yellow-100' : 'bg-gray-100'
              }`}>
                <Lightbulb className={`w-5 h-5 transition-all ${
                  devices.light ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'
                }`} />
              </div>
              <div className="flex flex-col">
                <span className="text-gray-900 font-medium">Đèn</span>
                {loadingDevices.light && <span className="text-xs text-yellow-500 font-medium">Loading...</span>}
              </div>
            </div>
            <Switch
              checked={devices.light}
              disabled={loadingDevices.light} // Khóa Switch
              onCheckedChange={() => onToggle('light')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
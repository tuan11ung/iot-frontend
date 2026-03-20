import { Fan, Wind, Lightbulb } from 'lucide-react';
import { Switch } from './ui/switch';

interface DeviceControlsProps {
  devices: {
    fan: boolean;
    ac: boolean;
    light: boolean;
  };
  onToggle: (device: 'fan' | 'ac' | 'light') => void;
}

export function DeviceControls({ devices, onToggle }: DeviceControlsProps) {
  return (
    <div className="p-6">
      <h3 className="text-gray-800 mb-4">Điều khiển thiết bị</h3>
      
      <div className="space-y-3">
        {/* Fan Control */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                devices.fan ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                <Fan className={`w-5 h-5 transition-all ${
                  devices.fan ? 'text-blue-600 animate-spin' : 'text-gray-400'
                }`} />
              </div>
              <span className="text-gray-900 font-medium">Quat</span>
            </div>
            <Switch
              checked={devices.fan}
              onCheckedChange={() => onToggle('fan')}
            />
          </div>
        </div>

        {/* AC Control */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                devices.ac ? 'bg-cyan-100' : 'bg-gray-100'
              }`}>
                <Wind className={`w-5 h-5 transition-all ${
                  devices.ac ? 'text-cyan-500 animate-pulse' : 'text-gray-400'
                }`} />
              </div>
              <span className="text-gray-900 font-medium">Điều hòa</span>
            </div>
            <Switch
              checked={devices.ac}
              onCheckedChange={() => onToggle('ac')}
            />
          </div>
        </div>

        {/* Light Control */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                devices.light ? 'bg-yellow-100' : 'bg-gray-100'
              }`}>
                <Lightbulb className={`w-5 h-5 transition-all ${
                  devices.light ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'
                }`} />
              </div>
              <span className="text-gray-900 font-medium">Đèn</span>
            </div>
            <Switch
              checked={devices.light}
              onCheckedChange={() => onToggle('light')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
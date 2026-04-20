import { useState, useEffect, useRef } from 'react';
import { Fan, Wind, Lightbulb, Droplets, Flame } from 'lucide-react';
import { Switch } from './ui/switch';
import { fetchHistoryDataAPI, controlDeviceAPI, fetchDevicesStatusAPI } from '../services/api';

export function DeviceControls() {
  const [devices, setDevices] = useState({
    fan: false,
    ac: false,
    light: false,
    pump: false,
    heater: false
  });

  const [loadingDevices, setLoadingDevices] = useState({
    fan: false,
    ac: false,
    light: false,
    pump: false,
    heater: false
  });

  const loadingDevicesRef = useRef(loadingDevices);
  useEffect(() => {
    loadingDevicesRef.current = loadingDevices;
  }, [loadingDevices]);

  const fetchDevicesStatus = async () => {
    try {
      const result = await fetchDevicesStatusAPI();
      const deviceList = result.data;

      if (deviceList && deviceList.length > 0) {
        setDevices((prev) => {
          const newDevices = { ...prev };
          let hasChanges = false;

          deviceList.forEach((d: any) => {
            const name = d.name.toLowerCase() as keyof typeof newDevices;

            if (['fan', 'ac', 'light', 'pump', 'heater'].includes(name) && !loadingDevicesRef.current[name]) {
              const dbState = d.current_state === 'ON';
              if (newDevices[name] !== dbState) {
                newDevices[name] = dbState;
                hasChanges = true;
              }
            }
          });

          return hasChanges ? newDevices : prev;
        });
      }
    } catch (error) {
      console.error("Lỗi khi lấy trạng thái thiết bị từ Backend:", error);
    }
  };

  useEffect(() => {
    fetchDevicesStatus();
    const interval = setInterval(() => {
      fetchDevicesStatus();
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleDeviceToggle = async (device: "fan" | "ac" | "light" | "pump" | "heater") => {
    if (loadingDevices[device]) return;

    const currentState = devices[device];
    const newState = !currentState;
    const actionCommand = `${device.toUpperCase()}_${newState ? "ON" : "OFF"}`;

    setLoadingDevices((prev) => ({ ...prev, [device]: true }));
    setDevices((prev) => ({ ...prev, [device]: newState }));

    try {
      const result = await controlDeviceAPI(device.toUpperCase(), actionCommand);
      const actionId = result.data?._id;

      if (!actionId) throw new Error("Không nhận được ID lệnh");

      let attempts = 0;
      const checkInterval = setInterval(async () => {
        attempts++;
        try {
          const historyResult = await fetchHistoryDataAPI({ limit: 10 });
          const myAction = historyResult.data.find((item: any) => item._id === actionId);

          if (myAction && myAction.status === 'Success') {
            clearInterval(checkInterval);
            setLoadingDevices((prev) => ({ ...prev, [device]: false }));
            console.log(`Lệnh ${actionCommand} đã chạy thành công!`);
          }
          else if (attempts >= 10) {
            clearInterval(checkInterval);
            setLoadingDevices((prev) => ({ ...prev, [device]: false }));
            setDevices((prev) => ({ ...prev, [device]: currentState }));
            alert(`⏳ Quá thời gian chờ! Lệnh "${actionCommand}" thất bại do thiết bị không phản hồi.`);
          }
        } catch (e) {
          console.error("Lỗi khi kiểm tra trạng thái lệnh:", e);
        }
      }, 1000);

    } catch (error) {
      console.error("Lỗi kết nối:", error);
      setLoadingDevices((prev) => ({ ...prev, [device]: false }));
      setDevices((prev) => ({ ...prev, [device]: currentState }));
      alert("❌ Không thể kết nối đến máy chủ Backend!");
    }
  };

  return (
    <div className="p-6">
      <h3 className="text-gray-800 mb-4 font-semibold">Điều khiển thiết bị</h3>

      <div className="space-y-3">
        {/* Fan Control */}
        {/* Thêm hiệu ứng opacity và pulse khi đang loading */}
        <div className={`bg-white border border-gray-200 rounded-xl p-4 shadow-sm transition-all duration-300 ${loadingDevices.fan ? 'opacity-60 animate-pulse pointer-events-none' : ''
          }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${devices.fan ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                <Fan className={`w-5 h-5 transition-all ${devices.fan ? 'text-blue-600 animate-spin' : 'text-gray-400'
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
              onCheckedChange={() => handleDeviceToggle('fan')}
            />
          </div>
        </div>

        {/* AC Control */}
        <div className={`bg-white border border-gray-200 rounded-xl p-4 shadow-sm transition-all duration-300 ${loadingDevices.ac ? 'opacity-60 animate-pulse pointer-events-none' : ''
          }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${devices.ac ? 'bg-cyan-100' : 'bg-gray-100'
                }`}>
                <Wind className={`w-5 h-5 transition-all ${devices.ac ? 'text-cyan-500 animate-pulse' : 'text-gray-400'
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
              onCheckedChange={() => handleDeviceToggle('ac')}
            />
          </div>
        </div>

        {/* Light Control */}
        <div className={`bg-white border border-gray-200 rounded-xl p-4 shadow-sm transition-all duration-300 ${loadingDevices.light ? 'opacity-60 animate-pulse pointer-events-none' : ''
          }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${devices.light ? 'bg-yellow-100' : 'bg-gray-100'
                }`}>
                <Lightbulb className={`w-5 h-5 transition-all ${devices.light ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'
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
              onCheckedChange={() => handleDeviceToggle('light')}
            />
          </div>
        </div>
        {/* Pump Control */}
        <div className={`bg-white border border-gray-200 rounded-xl p-4 shadow-sm transition-all duration-300 ${loadingDevices.pump ? 'opacity-60 animate-pulse pointer-events-none' : ''
          }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${devices.pump ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                <Droplets className={`w-5 h-5 transition-all ${devices.pump ? 'text-blue-600 animate-bounce' : 'text-gray-400'
                  }`} />
              </div>
              <div className="flex flex-col">
                <span className="text-gray-900 font-medium">Máy bơm</span>
                {loadingDevices.pump && <span className="text-xs text-blue-500 font-medium">Loading...</span>}
              </div>
            </div>
            <Switch
              checked={devices.pump}
              disabled={loadingDevices.pump}
              onCheckedChange={() => handleDeviceToggle('pump')}
            />
          </div>
        </div>

        {/* Heater Control */}
        <div className={`bg-white border border-gray-200 rounded-xl p-4 shadow-sm transition-all duration-300 ${loadingDevices.heater ? 'opacity-60 animate-pulse pointer-events-none' : ''
          }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${devices.heater ? 'bg-red-100' : 'bg-gray-100'
                }`}>
                <Flame className={`w-5 h-5 transition-all ${devices.heater ? 'text-red-500 animate-pulse' : 'text-gray-400'
                  }`} />
              </div>
              <div className="flex flex-col">
                <span className="text-gray-900 font-medium">Lò sưởi</span>
                {loadingDevices.heater && <span className="text-xs text-red-500 font-medium">Loading...</span>}
              </div>
            </div>
            <Switch
              checked={devices.heater}
              disabled={loadingDevices.heater}
              onCheckedChange={() => handleDeviceToggle('heater')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartData {
  time: string;
  temperature: number;
  humidity: number;
  light: number;
}

interface SensorChartProps {
  data: ChartData[];
}

// Custom tooltip để hiển thị đầy đủ thông tin
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-300 rounded-lg p-3 shadow-lg">
        <p className="text-gray-600 font-medium mb-2">{payload[0].payload.time}</p>
        <div className="space-y-1">
          <p className="text-orange-600 font-semibold">
            🌡️ Nhiệt độ: {payload[0].value}°C
          </p>
          <p className="text-blue-600 font-semibold">
            💧 Độ ẩm: {payload[1].value}%
          </p>
          <p className="text-yellow-600 font-semibold">
            💡 Ánh sáng: {payload[2].value} lux
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export function SensorChart({ data }: SensorChartProps) {
  // Chỉ lấy 12 điểm dữ liệu gần nhất để biểu đồ không bị chật
  const displayData = data.slice(-10);

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      <h3 className="font-bold text-gray-800 mb-4">
        Biểu đồ theo thời gian (Real-time)
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart 
          data={displayData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          
          {/* Trục X - Thời gian */}
          <XAxis 
            dataKey="time" 
            stroke="#666"
            style={{ fontSize: '12px' }}
            angle={-30}
            textAnchor="end"
            height={60}
            interval={0}
          />
          
          {/* 1. Trục Y thứ nhất: Nhiệt độ (Bên trái, Màu Cam) */}
          <YAxis 
            yAxisId="temp"
            orientation="left"
            stroke="#f97316" // Cùng màu với đường nhiệt độ
            style={{ fontSize: '12px', fontWeight: 'bold' }}
            domain={[20, 40]} // Biên độ nhiệt độ dự kiến
            hide={true}
            label={{ 
              value: 'Nhiệt độ (°C)', 
              angle: -90, 
              position: 'insideLeft',
              offset: 10,
              style: { fill: '#f97316', fontSize: '12px' }
            }}
          />
          
          {/* 2. Trục Y thứ hai: Độ ẩm (Bên trái, xếp ngoài cùng, Màu Xanh) */}
          <YAxis 
            yAxisId="humid"
            // hide={true}
            orientation="left"
            stroke="#666" // Cùng màu với đường độ ẩm
            style={{ fontSize: '12px', fontWeight: 'bold' }}
            domain={[0, 100]} // Biên độ độ ẩm dự kiến
            ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
            label={{ 
              value: 'Độ ẩm (%) và Nhiệt độ (°C)', 
              angle: -90, 
              position: 'insideLeft',
              offset: -10,
              style: { fill: '#666', fontSize: '12px' }
            }}
          />
          
          {/* 3. Trục Y thứ ba: Ánh sáng (Bên phải, Màu Vàng) */}
          <YAxis 
            yAxisId="light"
            orientation="right"
            stroke="#fbbf24" // Cùng màu với đường ánh sáng
            style={{ fontSize: '12px', fontWeight: 'bold' }}
            domain={[0, 1000]} // Biên độ ánh sáng
            label={{ 
              value: 'Ánh sáng (lux)', 
              angle: 90, 
              position: 'insideRight',
              offset: 10,
              style: { fill: '#fbbf24', fontSize: '12px' }
            }}
          />
          
          {/* Custom Tooltip */}
          <Tooltip content={<CustomTooltip />} />
          
          <Legend 
            wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }}
            iconType="line"
          />
          
          {/* Line Nhiệt độ - Trục trái */}
          <Line 
            yAxisId="humid"
            type="monotone" 
            dataKey="temperature" 
            stroke="#f97316" 
            strokeWidth={3}
            name="Nhiệt độ (°C)"
            dot={{ fill: '#f97316', r: 4, strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 7, strokeWidth: 2 }}
            animationDuration={0}
          />
          
          {/* Line Độ ẩm - Trục trái */}
          <Line 
            yAxisId="humid"
            type="monotone" 
            dataKey="humidity" 
            stroke="#3b82f6" 
            strokeWidth={3}
            name="Độ ẩm (%)"
            dot={{ fill: '#3b82f6', r: 4, strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 7, strokeWidth: 2 }}
            animationDuration={0}
          />
          
          {/* Line Ánh sáng - Trục phải */}
          <Line 
            yAxisId="light"
            type="monotone" 
            dataKey="light" 
            stroke="#fbbf24" 
            strokeWidth={3}
            name="Ánh sáng (lux)"
            dot={{ fill: '#fbbf24', r: 4, strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 7, strokeWidth: 2 }}
            animationDuration={0}
          />
        </LineChart>
      </ResponsiveContainer>
      
    </div>
  );
}
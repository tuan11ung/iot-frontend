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

export function SensorChart({ data }: SensorChartProps) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      <h3 className="font-bold text-gray-800 mb-4">Biểu đồ theo thời gian</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis 
            dataKey="time" 
            stroke="#666"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#666"
            style={{ fontSize: '12px' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '10px'
            }}
          />
          <Legend 
            wrapperStyle={{ fontSize: '14px' }}
          />
          <Line 
            type="monotone" 
            dataKey="temperature" 
            stroke="#f97316" 
            strokeWidth={2}
            name="Nhiệt độ (°C)"
            dot={{ fill: '#f97316', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="humidity" 
            stroke="#3b82f6" 
            strokeWidth={2}
            name="Độ ẩm (%)"
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="light" 
            stroke="#fbbf24" 
            strokeWidth={2}
            name="Ánh sáng (lux)"
            dot={{ fill: '#fbbf24', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

import { useState } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, TrendingUp } from 'lucide-react';
import type { HistoricalData } from '@/lib/weatherApi';

interface HistoricalTrendsProps {
  data: HistoricalData[];
  stationName: string;
  isLoading: boolean;
  onDateRangeChange: (startDate: string, endDate: string) => void;
}

export default function HistoricalTrends({
  data,
  stationName,
  isLoading,
  onDateRangeChange,
}: HistoricalTrendsProps) {
  const [startDate, setStartDate] = useState<string>(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const handleDateChange = () => {
    onDateRangeChange(startDate, endDate);
  };

  const handleQuickRange = (days: number) => {
    const end = new Date();
    const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
    onDateRangeChange(start.toISOString().split('T')[0], end.toISOString().split('T')[0]);
  };

  // Calculate statistics
  const stats = {
    avgTemp: data.length > 0 ? (data.reduce((sum, d) => sum + d.temperature, 0) / data.length).toFixed(1) : 'N/A',
    maxTemp: data.length > 0 ? Math.max(...data.map((d) => d.temperature)).toFixed(1) : 'N/A',
    minTemp: data.length > 0 ? Math.min(...data.map((d) => d.temperature)).toFixed(1) : 'N/A',
    avgHumidity: data.length > 0 ? (data.reduce((sum, d) => sum + d.humidity, 0) / data.length).toFixed(1) : 'N/A',
    totalRainfall: data.length > 0 ? data.reduce((sum, d) => sum + d.rainfall, 0).toFixed(2) : '0.00',
  };

  if (data.length === 0) {
    return (
      <div className="glass-card bg-white/35 border-white/40 backdrop-blur-md">
        <h3 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-6 h-6" />
          Historical Trend Analysis
        </h3>
        <div className="text-center py-8 text-slate-600">
          No historical data available for the selected date range
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="glass-card bg-white/35 border-white/40 backdrop-blur-md">
        <h3 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Calendar className="w-6 h-6" />
          Historical Trend Analysis - {stationName}
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-slate-900 font-medium mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="glass-input text-slate-900 bg-white/60 border-white/50 w-full"
            />
          </div>
          <div>
            <label className="block text-slate-900 font-medium mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="glass-input text-slate-900 bg-white/60 border-white/50 w-full"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleDateChange}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-teal-500/40 hover:bg-teal-500/50 border border-teal-400/60 text-white rounded-lg font-medium transition-all duration-300 disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Load Data'}
            </button>
          </div>
          <div className="flex items-end">
            <div className="flex gap-2 w-full">
              <button
                onClick={() => handleQuickRange(7)}
                className="flex-1 px-3 py-2 bg-white/25 hover:bg-white/40 text-slate-900 border border-white/40 rounded-lg text-sm font-medium transition-all duration-300"
              >
                7d
              </button>
              <button
                onClick={() => handleQuickRange(30)}
                className="flex-1 px-3 py-2 bg-white/25 hover:bg-white/40 text-slate-900 border border-white/40 rounded-lg text-sm font-medium transition-all duration-300"
              >
                30d
              </button>
              <button
                onClick={() => handleQuickRange(90)}
                className="flex-1 px-3 py-2 bg-white/25 hover:bg-white/40 text-slate-900 border border-white/40 rounded-lg text-sm font-medium transition-all duration-300"
              >
                90d
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-white/20 rounded-lg p-3">
            <div className="text-xs text-slate-700 mb-1">Avg Temp</div>
            <div className="text-xl font-bold text-slate-900">{stats.avgTemp}°F</div>
          </div>
          <div className="bg-white/20 rounded-lg p-3">
            <div className="text-xs text-slate-700 mb-1">Max Temp</div>
            <div className="text-xl font-bold text-slate-900">{stats.maxTemp}°F</div>
          </div>
          <div className="bg-white/20 rounded-lg p-3">
            <div className="text-xs text-slate-700 mb-1">Min Temp</div>
            <div className="text-xl font-bold text-slate-900">{stats.minTemp}°F</div>
          </div>
          <div className="bg-white/20 rounded-lg p-3">
            <div className="text-xs text-slate-700 mb-1">Avg Humidity</div>
            <div className="text-xl font-bold text-slate-900">{stats.avgHumidity}%</div>
          </div>
          <div className="bg-white/20 rounded-lg p-3">
            <div className="text-xs text-slate-700 mb-1">Total Rain</div>
            <div className="text-xl font-bold text-slate-900">{stats.totalRainfall}"</div>
          </div>
        </div>
      </div>

      {/* Temperature Trend Chart */}
      <div className="glass-card bg-white/35 border-white/40 backdrop-blur-md">
        <h4 className="text-lg font-semibold text-slate-900 mb-4">Temperature Trend</h4>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
            <XAxis
              dataKey="date"
              stroke="rgba(0,0,0,0.4)"
              tick={{ fontSize: 12 }}
              interval={Math.floor(data.length / 6)}
            />
            <YAxis stroke="rgba(0,0,0,0.4)" label={{ value: '°F', angle: -90, position: 'insideLeft' }} />
            <Tooltip
              contentStyle={{
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#1f2937' }}
            />
            <Area type="monotone" dataKey="temperature" stroke="#f59e0b" fillOpacity={1} fill="url(#colorTemp)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Humidity & Rainfall Chart */}
      <div className="glass-card bg-white/35 border-white/40 backdrop-blur-md">
        <h4 className="text-lg font-semibold text-slate-900 mb-4">Humidity & Rainfall Trend</h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
            <XAxis
              dataKey="date"
              stroke="rgba(0,0,0,0.4)"
              tick={{ fontSize: 12 }}
              interval={Math.floor(data.length / 6)}
            />
            <YAxis stroke="rgba(0,0,0,0.4)" label={{ value: '%', angle: -90, position: 'insideLeft' }} />
            <Tooltip
              contentStyle={{
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#1f2937' }}
            />
            <Legend />
            <Line type="monotone" dataKey="humidity" stroke="#06b6d4" dot={false} name="Humidity (%)" />
            <Line type="monotone" dataKey="rainfall" stroke="#3b82f6" dot={false} name="Rainfall (in)" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Wind Speed & Pressure Chart */}
      <div className="glass-card bg-white/35 border-white/40 backdrop-blur-md">
        <h4 className="text-lg font-semibold text-slate-900 mb-4">Wind Speed & Pressure Trend</h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
            <XAxis
              dataKey="date"
              stroke="rgba(0,0,0,0.4)"
              tick={{ fontSize: 12 }}
              interval={Math.floor(data.length / 6)}
            />
            <YAxis stroke="rgba(0,0,0,0.4)" label={{ value: 'mph / in', angle: -90, position: 'insideLeft' }} />
            <Tooltip
              contentStyle={{
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#1f2937' }}
            />
            <Legend />
            <Line type="monotone" dataKey="windSpeed" stroke="#8b5cf6" dot={false} name="Wind Speed (mph)" />
            <Line type="monotone" dataKey="pressure" stroke="#ec4899" dot={false} name="Pressure (in)" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

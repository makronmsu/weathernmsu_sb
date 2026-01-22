import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Droplets, Wind, Gauge, Sun } from 'lucide-react';

interface WeatherStation {
  id: string;
  name: string;
  region: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  pressure: number;
  rainfall: number;
  solarRadiation: number;
  uvIndex: number;
  dewPoint: number;
  visibility: number;
}

interface ComparisonChartsProps {
  stations: WeatherStation[];
  selectedStations: string[];
}

export default function ComparisonCharts({ stations, selectedStations }: ComparisonChartsProps) {
  // Filter selected stations
  const comparisonStations = stations.filter((s) => selectedStations.includes(s.id));

  if (comparisonStations.length === 0) {
    return (
      <div className="glass-card bg-white/40 border-white/50 backdrop-blur-md">
        <h3 className="text-2xl font-semibold text-slate-900 mb-4">Station Comparison</h3>
        <div className="text-center py-8 text-slate-600">
          Select multiple stations to compare their metrics
        </div>
      </div>
    );
  }

  // Prepare data for comparison charts
  const comparisonData = comparisonStations.map((station) => ({
    name: station.name.split(' - ')[0], // Short name
    temperature: station.temperature,
    humidity: station.humidity,
    windSpeed: station.windSpeed,
    pressure: station.pressure,
    solarRadiation: station.solarRadiation,
    uvIndex: station.uvIndex,
  }));

  const colors = ['#009DB8', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#10b981', '#f97316'];

  return (
    <div className="space-y-6">
      {/* Temperature & Humidity Comparison */}
      <div className="glass-card bg-white/40 border-white/50 backdrop-blur-md">
        <h3 className="text-2xl font-semibold text-slate-900 mb-4">Temperature & Humidity Comparison</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
            <XAxis dataKey="name" stroke="rgba(0,0,0,0.4)" />
            <YAxis stroke="rgba(0,0,0,0.4)" />
            <Tooltip
              contentStyle={{
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#1f2937' }}
            />
            <Legend />
            <Bar dataKey="temperature" fill="#f59e0b" name="Temperature (°F)" />
            <Bar dataKey="humidity" fill="#06b6d4" name="Humidity (%)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Wind & Pressure Comparison */}
      <div className="glass-card bg-white/40 border-white/50 backdrop-blur-md">
        <h3 className="text-2xl font-semibold text-slate-900 mb-4">Wind & Pressure Comparison</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
            <XAxis dataKey="name" stroke="rgba(0,0,0,0.4)" />
            <YAxis stroke="rgba(0,0,0,0.4)" />
            <Tooltip
              contentStyle={{
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#1f2937' }}
            />
            <Legend />
            <Bar dataKey="windSpeed" fill="#8b5cf6" name="Wind Speed (mph)" />
            <Bar dataKey="pressure" fill="#0094ad" name="Pressure (in)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Solar Radiation & UV Index */}
      <div className="glass-card bg-white/40 border-white/50 backdrop-blur-md">
        <h3 className="text-2xl font-semibold text-slate-900 mb-4">Solar Radiation & UV Index</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
            <XAxis dataKey="name" stroke="rgba(0,0,0,0.4)" />
            <YAxis stroke="rgba(0,0,0,0.4)" />
            <Tooltip
              contentStyle={{
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#1f2937' }}
            />
            <Legend />
            <Bar dataKey="solarRadiation" fill="#fbbf24" name="Solar Radiation (W/m²)" />
            <Bar dataKey="uvIndex" fill="#f97316" name="UV Index" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Metrics Table */}
      <div className="glass-card bg-white/40 border-white/50 backdrop-blur-md">
        <h3 className="text-2xl font-semibold text-slate-900 mb-4">Detailed Metrics</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left py-3 px-4 text-slate-900 font-semibold">Station</th>
                <th className="text-center py-3 px-4 text-slate-900 font-semibold">Temp (°F)</th>
                <th className="text-center py-3 px-4 text-slate-900 font-semibold">Humidity (%)</th>
                <th className="text-center py-3 px-4 text-slate-900 font-semibold">Wind (mph)</th>
                <th className="text-center py-3 px-4 text-slate-900 font-semibold">Pressure (")</th>
                <th className="text-center py-3 px-4 text-slate-900 font-semibold">Solar (W/m²)</th>
                <th className="text-center py-3 px-4 text-slate-900 font-semibold">UV Index</th>
              </tr>
            </thead>
            <tbody>
              {comparisonStations.map((station, idx) => (
                <tr key={station.id} className="border-b border-white/10 hover:bg-white/10 transition-colors">
                  <td className="py-3 px-4 text-slate-900 font-medium">{station.name}</td>
                  <td className="text-center py-3 px-4 text-slate-700">{station.temperature}°</td>
                  <td className="text-center py-3 px-4 text-slate-700">{station.humidity}%</td>
                  <td className="text-center py-3 px-4 text-slate-700">{station.windSpeed}</td>
                  <td className="text-center py-3 px-4 text-slate-700">{station.pressure.toFixed(2)}</td>
                  <td className="text-center py-3 px-4 text-slate-700">{station.solarRadiation}</td>
                  <td className="text-center py-3 px-4 text-slate-700">{station.uvIndex}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

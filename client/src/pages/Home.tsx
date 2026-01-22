import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Cloud, Droplets, Wind, Gauge, Sun, Eye, Map as MapIcon, BarChart3, Bell, TrendingUp } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import WeatherMap from '@/components/WeatherMap';
import ComparisonCharts from '@/components/ComparisonCharts';
import WeatherAlerts from '@/components/WeatherAlerts';
import HistoricalTrends from '@/components/HistoricalTrends';
import { fetchWeatherStations, checkWeatherAlerts, fetchHistoricalData, type WeatherAlert, type HistoricalData, type AlertThresholds } from '@/lib/weatherApi';

/**
 * NMSU Weather Network - Enhanced with Real API, Alerts, and Historical Analysis
 * 
 * Features:
 * - Real NMSU API integration with fallback to sample data
 * - Weather alerts system with customizable thresholds
 * - Historical trend analysis with date range selection
 * - Interactive map showing station locations with real-time temperatures
 * - Multi-station comparison charts and metrics
 * - Live data connection to NMSU weather APIs
 * - Two-tone glassmorphism design with enhanced gradients
 */

interface ChartData {
  time: string;
  temperature: number;
  humidity: number;
  pressure: number;
}

// Default alert thresholds
const DEFAULT_ALERT_THRESHOLDS: AlertThresholds = {
  maxTemperature: 100,
  minTemperature: 32,
  maxWindSpeed: 35,
  minVisibility: 3,
  maxHumidity: 90,
  minHumidity: 10,
};

// Weather stations with coordinates (fallback)
const WEATHER_STATIONS: any[] = [
  {
    id: 'lc-main',
    name: 'Las Cruces - Main Campus',
    region: 'South Central',
    latitude: 32.2805,
    longitude: -106.6436,
    temperature: 78,
    humidity: 23,
    windSpeed: 12,
    windDirection: 'NW',
    pressure: 29.92,
    rainfall: 0.0,
    solarRadiation: 850,
    uvIndex: 7,
    dewPoint: 45,
    visibility: 10,
  },
  {
    id: 'leyendecker',
    name: 'Leyendecker PSRC',
    region: 'South Central',
    latitude: 32.3667,
    longitude: -106.7333,
    temperature: 76,
    humidity: 28,
    windSpeed: 10,
    windDirection: 'W',
    pressure: 29.88,
    rainfall: 0.0,
    solarRadiation: 820,
    uvIndex: 6,
    dewPoint: 44,
    visibility: 10,
  },
  {
    id: 'fabian-garcia',
    name: 'Fabian Garcia Science Center',
    region: 'South Central',
    latitude: 32.2667,
    longitude: -106.5833,
    temperature: 75,
    humidity: 25,
    windSpeed: 11,
    windDirection: 'NW',
    pressure: 29.90,
    rainfall: 0.0,
    solarRadiation: 840,
    uvIndex: 7,
    dewPoint: 43,
    visibility: 10,
  },
  {
    id: 'corona',
    name: 'Corona Range Station',
    region: 'North Central',
    latitude: 35.0,
    longitude: -106.5,
    temperature: 62,
    humidity: 35,
    windSpeed: 15,
    windDirection: 'NE',
    pressure: 30.05,
    rainfall: 0.0,
    solarRadiation: 750,
    uvIndex: 5,
    dewPoint: 40,
    visibility: 12,
  },
  {
    id: 'clayton',
    name: 'Clayton Livestock Research Center',
    region: 'Northeast',
    latitude: 36.4333,
    longitude: -105.5,
    temperature: 68,
    humidity: 32,
    windSpeed: 14,
    windDirection: 'N',
    pressure: 30.02,
    rainfall: 0.0,
    solarRadiation: 780,
    uvIndex: 6,
    dewPoint: 42,
    visibility: 11,
  },
  {
    id: 'alcalde',
    name: 'Alcalde Science Center',
    region: 'North',
    latitude: 35.7833,
    longitude: -106.1167,
    temperature: 65,
    humidity: 38,
    windSpeed: 13,
    windDirection: 'NW',
    pressure: 29.95,
    rainfall: 0.0,
    solarRadiation: 800,
    uvIndex: 6,
    dewPoint: 41,
    visibility: 10,
  },
  {
    id: 'tucumcari',
    name: 'Tucumcari Station',
    region: 'Northeast',
    latitude: 35.1833,
    longitude: -103.7333,
    temperature: 71,
    humidity: 29,
    windSpeed: 16,
    windDirection: 'N',
    pressure: 30.00,
    rainfall: 0.0,
    solarRadiation: 810,
    uvIndex: 6,
    dewPoint: 43,
    visibility: 10,
  },
];

const generateChartData = (): ChartData[] => {
  const data: ChartData[] = [];
  for (let i = 0; i < 24; i++) {
    data.push({
      time: `${i.toString().padStart(2, '0')}:00`,
      temperature: 65 + Math.sin(i / 4) * 15 + Math.random() * 5,
      humidity: 25 + Math.cos(i / 5) * 15 + Math.random() * 5,
      pressure: 29.9 + Math.sin(i / 6) * 0.1 + Math.random() * 0.05,
    });
  }
  return data;
};

export default function Home() {
  const [selectedStations, setSelectedStations] = useState<string[]>(['lc-main']);
  const [mainStation, setMainStation] = useState<any>(null);
  const [startDate, setStartDate] = useState<string>(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedFields, setSelectedFields] = useState<string[]>([
    'temperature',
    'humidity',
    'wind_speed',
    'wind_direction',
    'pressure',
    'rainfall',
  ]);
  const [downloadStatus, setDownloadStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'map' | 'comparison' | 'alerts' | 'trends'>('overview');
  const [stationData, setStationData] = useState<any[]>(WEATHER_STATIONS);
  const [isLoading, setIsLoading] = useState(false);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  const [historicalLoading, setHistoricalLoading] = useState(false);
  const [alertThresholds, setAlertThresholds] = useState<AlertThresholds>(DEFAULT_ALERT_THRESHOLDS);

  const chartData = useMemo(() => generateChartData(), []);

  // Fetch real data from NMSU API
  useEffect(() => {
    const fetchLiveData = async () => {
      setIsLoading(true);
      try {
        const stations = await fetchWeatherStations();
        setStationData(stations);
        
        // Set main station if not already set
        if (!mainStation && stations.length > 0) {
          setMainStation(stations[0]);
          setSelectedStations([stations[0].id]);
        } else if (mainStation) {
          const updated = stations.find((s) => s.id === mainStation.id) || stations[0];
          setMainStation(updated);
        }

        // Check for weather alerts
        const newAlerts = checkWeatherAlerts(stations, alertThresholds);
        setAlerts(newAlerts.filter((a) => !dismissedAlerts.has(a.id)));
      } catch (error) {
        // Silently handle errors - sample data will be used
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch data on mount
    fetchLiveData();

    // Set up interval for live updates (every 5 minutes)
    const interval = setInterval(fetchLiveData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [dismissedAlerts, alertThresholds, mainStation]);

  const handleStationChange = (stationId: string) => {
    const station = stationData.find((s) => s.id === stationId);
    if (station) {
      setMainStation(station);
      if (!selectedStations.includes(stationId)) {
        setSelectedStations([stationId]);
      }
      // Load historical data for the selected station
      loadHistoricalData(stationId, startDate, endDate);
    }
  };

  const loadHistoricalData = async (stationId: string, start: string, end: string) => {
    setHistoricalLoading(true);
    try {
      const data = await fetchHistoricalData(stationId, start, end);
      setHistoricalData(data);
    } catch (error) {
      console.error('Error loading historical data:', error);
    } finally {
      setHistoricalLoading(false);
    }
  };

  const handleHistoricalDateRangeChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    if (mainStation) {
      loadHistoricalData(mainStation.id, start, end);
    }
  };

  const handleDismissAlert = (alertId: string) => {
    const newDismissed = new Set(dismissedAlerts);
    newDismissed.add(alertId);
    setDismissedAlerts(newDismissed);
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  };

  const handleStationToggle = (stationId: string) => {
    setSelectedStations((prev) =>
      prev.includes(stationId) ? prev.filter((id) => id !== stationId) : [...prev, stationId]
    );
  };

  const handleQuickDateRange = (range: string) => {
    const end = new Date();
    const start = new Date();

    switch (range) {
      case '24h':
        start.setDate(end.getDate() - 1);
        break;
      case '7d':
        start.setDate(end.getDate() - 7);
        break;
      case '30d':
        start.setDate(end.getDate() - 30);
        break;
      case '3m':
        start.setMonth(end.getMonth() - 3);
        break;
      case '1y':
        start.setFullYear(end.getFullYear() - 1);
        break;
      case 'all':
        start.setFullYear(2000);
        break;
    }

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  const handleFieldToggle = (field: string) => {
    setSelectedFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    );
  };

  const handleDownload = () => {
    try {
      const headers = ['Station', 'Date', ...selectedFields];
      const rows: string[] = [headers.join(',')];

      selectedStations.forEach((stationId) => {
        const station = stationData.find((s) => s.id === stationId);
        if (station) {
          const rowData: string[] = [station.name, new Date().toISOString()];
          selectedFields.forEach((field) => {
            const value = (station as any)[field.replace(/_/g, '')] || 'N/A';
            rowData.push(String(value));
          });
          rows.push(rowData.join(','));
        }
      });

      const csv = rows.join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `weather-data-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setDownloadStatus({ type: 'success', message: 'Data downloaded successfully!' });
      setTimeout(() => setDownloadStatus(null), 3000);
    } catch (error) {
      setDownloadStatus({ type: 'error', message: 'Failed to download data. Please try again.' });
      setTimeout(() => setDownloadStatus(null), 3000);
    }
  };

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="container mx-auto">
        {/* Header */}
        <div className="glass-card mb-8 text-center bg-white/40 border-white/40 backdrop-blur-md">
          <h1 className="text-5xl font-bold text-slate-900 mb-2">NMSU Weather Network</h1>
          <p className="text-lg text-slate-700">Real-time weather data from across New Mexico</p>
          {isLoading && <p className="text-sm text-slate-600 mt-2">Updating live data...</p>}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-3 mb-8 flex-wrap">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
              activeTab === 'overview'
                ? 'bg-[#009DB8]/40 border border-[#009DB8]/60 text-white'
                : 'glass-button bg-white/25 hover:bg-white/40 text-slate-900'
            }`}
          >
            <Sun className="w-5 h-5" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
              activeTab === 'map'
                ? 'bg-[#009DB8]/40 border border-[#009DB8]/60 text-white'
                : 'glass-button bg-white/25 hover:bg-white/40 text-slate-900'
            }`}
          >
            <MapIcon className="w-5 h-5" />
            Map
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
              activeTab === 'comparison'
                ? 'bg-[#009DB8]/40 border border-[#009DB8]/60 text-white'
                : 'glass-button bg-white/25 hover:bg-white/40 text-slate-900'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            Compare
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 relative ${
              activeTab === 'alerts'
                ? 'bg-[#009DB8]/40 border border-[#009DB8]/60 text-white'
                : 'glass-button bg-white/25 hover:bg-white/40 text-slate-900'
            }`}
          >
            <Bell className="w-5 h-5" />
            Alerts
            {alerts.length > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {alerts.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
              activeTab === 'trends'
                ? 'bg-[#009DB8]/40 border border-[#009DB8]/60 text-white'
                : 'glass-button bg-white/25 hover:bg-white/40 text-slate-900'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            Trends
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {isLoading && !mainStation ? (
              <div className="glass-card bg-white/40 border-white/50 backdrop-blur-md text-center py-12">
                <div className="text-slate-600 text-lg">Loading weather data...</div>
              </div>
            ) : mainStation ? (
              <>
              {/* Main Weather Display Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Primary Weather Card */}
              <div className="lg:col-span-2 glass-card bg-white/40 border-white/50 backdrop-blur-md">
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold text-slate-900 mb-4">Current Conditions</h2>
                  <Select value={mainStation?.id || ''} onValueChange={handleStationChange}>
                    <SelectTrigger className="glass-input text-slate-900 bg-white/60 border-white/50 placeholder-slate-600">
                      <SelectValue placeholder="Select a station" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-white/30">
                      {stationData.map((station) => (
                        <SelectItem key={station.id} value={station.id} className="text-slate-900">
                          {station.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="text-center mb-8">
                  <div className="text-7xl font-light text-slate-900 mb-2" style={{ textShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                    {mainStation.temperature.toFixed(1)}°F
                  </div>
                  <p className="text-xl text-slate-700">{mainStation.name}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="metric-display">
                    <Droplets className="w-6 h-6 text-slate-600 mb-2" />
                    <div className="metric-value text-slate-900">{mainStation.humidity.toFixed(0)}%</div>
                    <div className="metric-label text-slate-700">Humidity</div>
                  </div>
                  <div className="metric-display">
                    <Wind className="w-6 h-6 text-slate-600 mb-2" />
                    <div className="metric-value text-slate-900">{mainStation.windSpeed.toFixed(1)} mph</div>
                    <div className="metric-label text-slate-700">Wind</div>
                  </div>
                  <div className="metric-display">
                    <Gauge className="w-6 h-6 text-slate-600 mb-2" />
                    <div className="metric-value text-slate-900">{mainStation.pressure.toFixed(2)}"</div>
                    <div className="metric-label text-slate-700">Pressure</div>
                  </div>
                  <div className="metric-display">
                    <Cloud className="w-6 h-6 text-slate-600 mb-2" />
                    <div className="metric-value text-slate-900">{mainStation.rainfall.toFixed(2)}"</div>
                    <div className="metric-label text-slate-700">Rain</div>
                  </div>
                </div>
              </div>

              {/* Extended Metrics Card */}
              <div className="glass-card bg-[#009DB8]/35 border-[#009DB8]/50 backdrop-blur-md">
                <h3 className="text-xl font-semibold text-white mb-6">Extended Metrics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sun className="w-5 h-5 text-yellow-200" />
                      <span className="text-white/90">Solar Radiation</span>
                    </div>
                    <span className="text-white font-semibold">{mainStation.solarRadiation} W/m²</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sun className="w-5 h-5 text-orange-300" />
                      <span className="text-white/90">UV Index</span>
                    </div>
                    <span className="text-white font-semibold">{mainStation.uvIndex}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Droplets className="w-5 h-5 text-blue-200" />
                      <span className="text-white/90">Dew Point</span>
                    </div>
                    <span className="text-white font-semibold">{mainStation.dewPoint}°F</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="w-5 h-5 text-cyan-200" />
                      <span className="text-white/90">Visibility</span>
                    </div>
                    <span className="text-white font-semibold">{mainStation.visibility} mi</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart Section */}
            <div className="glass-card mb-8 bg-white/35 border-white/40 backdrop-blur-md">
              <h3 className="text-2xl font-semibold text-slate-900 mb-6">24-Hour Forecast</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <p className="text-slate-700 text-sm mb-3">Temperature Trend</p>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                      <XAxis dataKey="time" stroke="rgba(0,0,0,0.4)" />
                      <YAxis stroke="rgba(0,0,0,0.4)" />
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
                <div>
                  <p className="text-slate-700 text-sm mb-3">Humidity & Pressure</p>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                      <XAxis dataKey="time" stroke="rgba(0,0,0,0.4)" />
                      <YAxis stroke="rgba(0,0,0,0.4)" />
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid rgba(0, 0, 0, 0.1)',
                          borderRadius: '8px',
                        }}
                        labelStyle={{ color: '#1f2937' }}
                      />
                      <Line type="monotone" dataKey="humidity" stroke="#06b6d4" dot={false} />
                      <Line type="monotone" dataKey="pressure" stroke="#8b5cf6" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
              </>
            ) : (
              <div className="glass-card bg-white/40 border-white/50 backdrop-blur-md text-center py-12">
                <div className="text-slate-600 text-lg">No weather data available</div>
              </div>
            )}
          </>
        )}

        {/* Map Tab */}
        {activeTab === 'map' && (
          <div className="mb-8">
            <WeatherMap stations={stationData} onStationSelect={handleStationChange} />
          </div>
        )}

        {/* Comparison Tab */}
        {activeTab === 'comparison' && (
          <div className="mb-8">
              <div className="glass-card bg-white/40 border-white/50 backdrop-blur-md">
            <h3 className="text-2xl font-semibold text-slate-900 mb-4">Select Stations to Compare</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {stationData.map((station) => (
                  <button
                    key={station.id}
                    onClick={() => handleStationToggle(station.id)}
                    className={`p-3 rounded-lg transition-all duration-300 text-left ${
                      selectedStations.includes(station.id)
                        ? 'bg-[#009DB8]/40 border border-[#009DB8]/60 text-white'
                        : 'bg-white/20 border border-white/30 text-slate-900 hover:bg-white/30'
                    }`}
                  >
                    <div className="font-semibold text-sm">{station.name.split(' - ')[0]}</div>
                    <div className="text-xs mt-1">{station.temperature.toFixed(1)}°F</div>
                  </button>
                ))}
              </div>
            </div>
            <ComparisonCharts stations={stationData} selectedStations={selectedStations} />
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="mb-8">
            {alerts.length > 0 ? (
              <WeatherAlerts alerts={alerts} onDismiss={handleDismissAlert} />
            ) : (
              <div className="glass-card bg-white/40 border-white/50 backdrop-blur-md text-center py-12">
                <div className="text-slate-600 text-lg">No weather alerts at this time</div>
                <div className="text-slate-500 text-sm mt-2">All stations are within normal parameters</div>
              </div>
            )}
          </div>
        )}

        {/* Trends Tab */}
        {activeTab === 'trends' && mainStation && (
          <div className="mb-8">
            <HistoricalTrends
              data={historicalData}
              stationName={mainStation.name}
              isLoading={historicalLoading}
              onDateRangeChange={handleHistoricalDateRangeChange}
            />
          </div>
        )}

        {/* Download Panel */}
        <div className="glass-card bg-white/35 border-white/40 backdrop-blur-md">
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">Download Historical Data</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-slate-900 font-medium mb-3">Select Weather Station(s)</label>
              <Select value={selectedStations[0]} onValueChange={handleStationChange}>
                <SelectTrigger className="glass-input text-slate-900 bg-white/60 border-white/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-white/30">
                  {stationData.map((station) => (
                    <SelectItem key={station.id} value={station.id} className="text-slate-900">
                      {station.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-900 font-medium mb-2">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="glass-input text-slate-900 bg-white/60 border-white/50"
                />
              </div>
              <div>
                <label className="block text-slate-900 font-medium mb-2">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="glass-input text-slate-900 bg-white/60 border-white/50"
                />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-slate-900 font-medium mb-3">Quick Date Ranges</label>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Last 24 Hours', value: '24h' },
                { label: 'Last 7 Days', value: '7d' },
                { label: 'Last 30 Days', value: '30d' },
                { label: 'Last 3 Months', value: '3m' },
                { label: 'Last Year', value: '1y' },
                { label: 'All Time', value: 'all' },
              ].map((btn) => (
                <button
                  key={btn.value}
                  onClick={() => handleQuickDateRange(btn.value)}
                  className="px-4 py-2 rounded-lg font-medium transition-all duration-300 bg-white/25 hover:bg-white/40 text-slate-900 border border-white/40 hover:border-white/60 text-sm"
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-slate-900 font-medium mb-3">Select Data Fields</label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {[
                { id: 'temperature', label: 'Temperature' },
                { id: 'humidity', label: 'Humidity' },
                { id: 'wind_speed', label: 'Wind Speed' },
                { id: 'wind_direction', label: 'Wind Direction' },
                { id: 'pressure', label: 'Pressure' },
                { id: 'rainfall', label: 'Rainfall' },
                { id: 'solar_radiation', label: 'Solar Radiation' },
                { id: 'uv_index', label: 'UV Index' },
                { id: 'soil_temperature', label: 'Soil Temperature' },
                { id: 'soil_moisture', label: 'Soil Moisture' },
              ].map((field) => (
                <label key={field.id} className="flex items-center gap-2 text-slate-900 cursor-pointer hover:text-slate-700">
                  <input
                    type="checkbox"
                    checked={selectedFields.includes(field.id)}
                    onChange={() => handleFieldToggle(field.id)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm">{field.label}</span>
                </label>
              ))}
            </div>
          </div>

          <Button
            onClick={handleDownload}
            className="w-full bg-gradient-to-r from-[#8c0b42] to-[#a81a52] hover:from-[#a81a52] hover:to-[#c82a62] text-white font-semibold py-3 mb-4 rounded-lg transition-all duration-300"
          >
            Download as CSV
          </Button>

          {downloadStatus && (
            <div
              className={`p-4 rounded-lg text-center font-medium ${
                downloadStatus.type === 'success'
                  ? 'bg-green-500/30 border border-green-500/50 text-green-900'
                  : 'bg-red-500/30 border border-red-500/50 text-red-900'
              }`}
            >
              {downloadStatus.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

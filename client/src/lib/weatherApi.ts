/**
 * Weather API Integration Module
 * Handles fetching data from NMSU weather API endpoints
 * Includes fallback to sample data for development
 */

export interface WeatherStation {
  id: string;
  name: string;
  region: string;
  latitude: number;
  longitude: number;
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
  lastUpdated?: string;
}

export interface HistoricalData {
  date: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  pressure: number;
  rainfall: number;
}

const NMSU_API_BASE = 'https://weather.nmsu.edu/api';

// Sample data for fallback/development
const SAMPLE_STATIONS: WeatherStation[] = [
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
    lastUpdated: new Date().toISOString(),
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
    lastUpdated: new Date().toISOString(),
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
    lastUpdated: new Date().toISOString(),
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
    lastUpdated: new Date().toISOString(),
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
    lastUpdated: new Date().toISOString(),
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
    lastUpdated: new Date().toISOString(),
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
    lastUpdated: new Date().toISOString(),
  },
];

/**
 * Fetch current weather data from NMSU API
 * Falls back to sample data if API is unavailable
 */
export async function fetchWeatherStations(): Promise<WeatherStation[]> {
  try {
    const response = await fetch(`${NMSU_API_BASE}/stations`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn(`NMSU API returned status ${response.status}, using sample data`);
      return SAMPLE_STATIONS;
    }

    const data = await response.json();
    
    // Transform API response to match our interface
    if (Array.isArray(data)) {
      return data.map((station: any) => ({
        id: station.id || station.code,
        name: station.name || station.station_name,
        region: station.region || 'Unknown',
        latitude: parseFloat(station.latitude || station.lat),
        longitude: parseFloat(station.longitude || station.lon),
        temperature: parseFloat(station.temperature || station.temp),
        humidity: parseFloat(station.humidity || station.rh),
        windSpeed: parseFloat(station.wind_speed || station.ws),
        windDirection: station.wind_direction || station.wd || 'N',
        pressure: parseFloat(station.pressure || station.press),
        rainfall: parseFloat(station.rainfall || station.rain || 0),
        solarRadiation: parseFloat(station.solar_radiation || station.sr || 0),
        uvIndex: parseFloat(station.uv_index || station.uv || 0),
        dewPoint: parseFloat(station.dew_point || station.dp),
        visibility: parseFloat(station.visibility || station.vis || 10),
        lastUpdated: station.last_updated || new Date().toISOString(),
      }));
    }

    return SAMPLE_STATIONS;
  } catch (error) {
    console.error('Error fetching weather data from NMSU API:', error);
    return SAMPLE_STATIONS;
  }
}

/**
 * Fetch historical weather data for a specific station
 */
export async function fetchHistoricalData(
  stationId: string,
  startDate: string,
  endDate: string
): Promise<HistoricalData[]> {
  try {
    const response = await fetch(
      `${NMSU_API_BASE}/stations/${stationId}/historical?start=${startDate}&end=${endDate}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.warn(`Failed to fetch historical data, generating sample data`);
      return generateSampleHistoricalData(startDate, endDate);
    }

    const data = await response.json();
    
    if (Array.isArray(data)) {
      return data.map((record: any) => ({
        date: record.date || record.timestamp,
        temperature: parseFloat(record.temperature || record.temp),
        humidity: parseFloat(record.humidity || record.rh),
        windSpeed: parseFloat(record.wind_speed || record.ws),
        pressure: parseFloat(record.pressure || record.press),
        rainfall: parseFloat(record.rainfall || record.rain || 0),
      }));
    }

    return generateSampleHistoricalData(startDate, endDate);
  } catch (error) {
    console.error('Error fetching historical data:', error);
    return generateSampleHistoricalData(startDate, endDate);
  }
}

/**
 * Generate sample historical data for development/fallback
 */
function generateSampleHistoricalData(startDate: string, endDate: string): HistoricalData[] {
  const data: HistoricalData[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    data.push({
      date: d.toISOString().split('T')[0],
      temperature: 65 + Math.sin(d.getTime() / 86400000) * 15 + Math.random() * 5,
      humidity: 30 + Math.cos(d.getTime() / 86400000) * 20 + Math.random() * 10,
      windSpeed: 10 + Math.random() * 10,
      pressure: 29.9 + (Math.random() - 0.5) * 0.2,
      rainfall: Math.random() > 0.8 ? Math.random() * 0.5 : 0,
    });
  }
  
  return data;
}

/**
 * Check for weather alerts based on thresholds
 */
export interface WeatherAlert {
  id: string;
  stationId: string;
  stationName: string;
  type: 'temperature' | 'wind' | 'visibility' | 'humidity' | 'pressure';
  severity: 'low' | 'medium' | 'high';
  message: string;
  value: number;
  threshold: number;
  timestamp: string;
}

export interface AlertThresholds {
  maxTemperature: number;
  minTemperature: number;
  maxWindSpeed: number;
  minVisibility: number;
  maxHumidity: number;
  minHumidity: number;
}

const DEFAULT_THRESHOLDS: AlertThresholds = {
  maxTemperature: 100,
  minTemperature: 32,
  maxWindSpeed: 35,
  minVisibility: 3,
  maxHumidity: 90,
  minHumidity: 10,
};

export function checkWeatherAlerts(
  stations: WeatherStation[],
  thresholds: AlertThresholds = DEFAULT_THRESHOLDS
): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];

  stations.forEach((station) => {
    // Temperature alerts
    if (station.temperature > thresholds.maxTemperature) {
      alerts.push({
        id: `alert-${station.id}-temp-high-${Date.now()}`,
        stationId: station.id,
        stationName: station.name,
        type: 'temperature',
        severity: 'high',
        message: `High temperature alert: ${station.temperature.toFixed(1)}°F`,
        value: station.temperature,
        threshold: thresholds.maxTemperature,
        timestamp: new Date().toISOString(),
      });
    }

    if (station.temperature < thresholds.minTemperature) {
      alerts.push({
        id: `alert-${station.id}-temp-low-${Date.now()}`,
        stationId: station.id,
        stationName: station.name,
        type: 'temperature',
        severity: 'high',
        message: `Low temperature alert: ${station.temperature.toFixed(1)}°F`,
        value: station.temperature,
        threshold: thresholds.minTemperature,
        timestamp: new Date().toISOString(),
      });
    }

    // Wind speed alerts
    if (station.windSpeed > thresholds.maxWindSpeed) {
      alerts.push({
        id: `alert-${station.id}-wind-${Date.now()}`,
        stationId: station.id,
        stationName: station.name,
        type: 'wind',
        severity: 'high',
        message: `High wind speed alert: ${station.windSpeed.toFixed(1)} mph`,
        value: station.windSpeed,
        threshold: thresholds.maxWindSpeed,
        timestamp: new Date().toISOString(),
      });
    }

    // Visibility alerts
    if (station.visibility < thresholds.minVisibility) {
      alerts.push({
        id: `alert-${station.id}-visibility-${Date.now()}`,
        stationId: station.id,
        stationName: station.name,
        type: 'visibility',
        severity: 'medium',
        message: `Low visibility alert: ${station.visibility.toFixed(1)} miles`,
        value: station.visibility,
        threshold: thresholds.minVisibility,
        timestamp: new Date().toISOString(),
      });
    }

    // Humidity alerts
    if (station.humidity > thresholds.maxHumidity) {
      alerts.push({
        id: `alert-${station.id}-humidity-high-${Date.now()}`,
        stationId: station.id,
        stationName: station.name,
        type: 'humidity',
        severity: 'low',
        message: `High humidity alert: ${station.humidity.toFixed(0)}%`,
        value: station.humidity,
        threshold: thresholds.maxHumidity,
        timestamp: new Date().toISOString(),
      });
    }

    if (station.humidity < thresholds.minHumidity) {
      alerts.push({
        id: `alert-${station.id}-humidity-low-${Date.now()}`,
        stationId: station.id,
        stationName: station.name,
        type: 'humidity',
        severity: 'low',
        message: `Low humidity alert: ${station.humidity.toFixed(0)}%`,
        value: station.humidity,
        threshold: thresholds.minHumidity,
        timestamp: new Date().toISOString(),
      });
    }
  });

  return alerts;
}

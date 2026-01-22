import { useEffect, useRef } from 'react';
import { Droplets, Wind, Gauge } from 'lucide-react';

interface WeatherStation {
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
}

interface WeatherMapProps {
  stations: WeatherStation[];
  onStationSelect: (stationId: string) => void;
}

export default function WeatherMap({ stations, onStationSelect }: WeatherMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Create iframe with OpenStreetMap
    const bounds = {
      minLat: 31.78,
      maxLat: 37.0,
      minLon: -109.05,
      maxLon: -103.0,
    };

    const centerLat = (bounds.minLat + bounds.maxLat) / 2;
    const centerLon = (bounds.minLon + bounds.maxLon) / 2;

    const mapHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>
        <style>
          body { margin: 0; padding: 0; }
          #map { position: absolute; top: 0; bottom: 0; width: 100%; }
          .weather-popup { font-family: system-ui, -apple-system, sans-serif; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const map = L.map('map').setView([${centerLat}, ${centerLon}], 7);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
          
          const stations = ${JSON.stringify(stations)};
          
          stations.forEach(station => {
            const html = \`
              <div style="font-family: system-ui; min-width: 200px;">
                <h4 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #1f2937;">\${station.name}</h4>
                <div style="font-size: 12px; color: #4b5563;">
                  <div style="margin-bottom: 4px;"><strong style="color: #1f2937; font-size: 16px;">\${station.temperature}°F</strong></div>
                  <div>Humidity: \${station.humidity}%</div>
                  <div>Wind: \${station.windSpeed} mph</div>
                  <div>Pressure: \${station.pressure.toFixed(2)}"</div>
                </div>
              </div>
            \`;
            
            const marker = L.circleMarker([station.latitude, station.longitude], {
              radius: 15,
              fillColor: '#0094ad',
              color: 'rgba(255, 255, 255, 0.6)',
              weight: 2,
              opacity: 0.8,
              fillOpacity: 0.7
            }).bindPopup(html).addTo(map);
            
            const label = L.tooltip({
              permanent: false,
              direction: 'center',
              className: 'leaflet-tooltip-own'
            });
            label.setContent(\`\${station.temperature}°\`);
            marker.bindTooltip(label);
          });
        </script>
      </body>
      </html>
    `;

    mapRef.current.innerHTML = '';
    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '0.5rem';
    iframe.sandbox.add('allow-scripts', 'allow-same-origin');
    
    mapRef.current.appendChild(iframe);
    iframe.contentDocument?.write(mapHTML);
    iframe.contentDocument?.close();
  }, [stations]);

  return (
    <div className="glass-card bg-white/35 border-white/40 backdrop-blur-md h-full">
      <h3 className="text-2xl font-semibold text-slate-900 mb-4">Weather Stations Map</h3>
      <div
        ref={mapRef}
        className="rounded-lg overflow-hidden"
        style={{ height: '500px', width: '100%' }}
      />
    </div>
  );
}

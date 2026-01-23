cat > client/src/App.tsx << 'EOF'
import './styles/theme.css';

export default function App() {
  return (
    <div className="container">
      {/* Header */}
      <div className="header">
        <h1>NMSU Weather Network</h1>
        <p>Real-time weather data from across New Mexico</p>
      </div>

      {/* Navigation */}
      <div className="nav-tabs">
        <a href="#" className="nav-tab active">
          <span>☀️</span> Overview
        </a>
        <a href="#" className="nav-tab">
          <span>🗺️</span> Map
        </a>
        <a href="#" className="nav-tab">
          <span>📊</span> Compare
        </a>
        <a href="#" className="nav-tab">
          <span>🔔</span> Alerts
        </a>
        <a href="#" className="nav-tab">
          <span>📈</span> Trends
        </a>
      </div>

      {/* Main Grid */}
      <div className="grid grid-2">
        {/* Current Conditions */}
        <div className="card">
          <div className="card-header">Current Conditions</div>
          <div className="station-select">Las Cruces - Main Campus ▼</div>
          
          <div className="temperature-display">
            <div className="temperature-value">78.0°F</div>
            <div className="station-name">Las Cruces - Main Campus</div>
          </div>

          <div className="metrics-grid">
            <div className="metric-item">
              <span className="metric-icon">💧</span>
              <div className="metric-value">23%</div>
              <div className="metric-label">Humidity</div>
            </div>
            <div className="metric-item">
              <span className="metric-icon">💨</span>
              <div className="metric-value">12.0 mph</div>
              <div className="metric-label">Wind</div>
            </div>
            <div className="metric-item">
              <span className="metric-icon">🌡️</span>
              <div className="metric-value">29.92"</div>
              <div className="metric-label">Pressure</div>
            </div>
            <div className="metric-item">
              <span className="metric-icon">☁️</span>
              <div className="metric-value">0.00"</div>
              <div className="metric-label">Rain</div>
            </div>
          </div>
        </div>

        {/* Extended Metrics */}
        <div className="card glass">
          <div className="card-header" style={{color: 'white'}}>Extended Metrics</div>
          <div className="extended-metrics">
            <div className="extended-metric">
              <span className="extended-metric-label">
                <span>☀️</span> Solar Radiation
              </span>
              <span className="extended-metric-value">850 W/m²</span>
            </div>
            <div className="extended-metric">
              <span className="extended-metric-label">
                <span>🌞</span> UV Index
              </span>
              <span className="extended-metric-value">7</span>
            </div>
            <div className="extended-metric">
              <span className="extended-metric-label">
                <span>💧</span> Dew Point
              </span>
              <span className="extended-metric-value">45°F</span>
            </div>
            <div className="extended-metric">
              <span className="extended-metric-label">
                <span>👁️</span> Visibility
              </span>
              <span className="extended-metric-value">10 mi</span>
            </div>
          </div>
        </div>
      </div>

      {/* 24-Hour Forecast */}
      <div className="card forecast-section">
        <div className="card-header">24-Hour Forecast</div>
        <div className="grid" style={{gridTemplateColumns: '1fr 1fr', gap: '24px'}}>
          <div>
            <div style={{fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px'}}>Temperature Trend</div>
            <div className="chart-container"></div>
          </div>
          <div>
            <div style={{fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px'}}>Humidity & Pressure</div>
            <div className="chart-container" style={{background: 'linear-gradient(180deg, rgba(125, 211, 252, 0.2) 0%, rgba(125, 211, 252, 0.05) 100%)'}}></div>
          </div>
        </div>
      </div>

      {/* Download Historical Data */}
      <div className="card download-section">
        <div className="card-header">Download Historical Data</div>
        
        <div className="form-grid">
          <div className="form-group">
            <label>Select Weather Station(s)</label>
            <select className="form-control">
              <option>Las Cruces - Main Campus</option>
            </select>
          </div>
          <div className="form-group">
            <label>Start Date</label>
            <input type="date" className="form-control" value="2026-01-16" />
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input type="date" className="form-control" value="2026-01-23" />
          </div>
        </div>

        <div>
          <label style={{fontSize: '14px', fontWeight: 600, marginBottom: '8px', display: 'block'}}>Quick Date Ranges</label>
          <div className="quick-ranges">
            <button className="range-btn">Last 24 Hours</button>
            <button className="range-btn">Last 7 Days</button>
            <button className="range-btn">Last 30 Days</button>
            <button className="range-btn">Last 3 Months</button>
            <button className="range-btn">Last Year</button>
            <button className="range-btn">All Time</button>
          </div>
        </div>

        <div>
          <label style={{fontSize: '14px', fontWeight: 600, marginBottom: '12px', display: 'block'}}>Select Data Fields</label>
          <div className="checkbox-grid">
            <label className="checkbox-label">
              <input type="checkbox" defaultChecked /> Temperature
            </label>
            <label className="checkbox-label">
              <input type="checkbox" defaultChecked /> Humidity
            </label>
            <label className="checkbox-label">
              <input type="checkbox" defaultChecked /> Wind Speed
            </label>
            <label className="checkbox-label">
              <input type="checkbox" defaultChecked /> Wind Direction
            </label>
            <label className="checkbox-label">
              <input type="checkbox" defaultChecked /> Pressure
            </label>
            <label className="checkbox-label">
              <input type="checkbox" /> Rainfall
            </label>
            <label className="checkbox-label">
              <input type="checkbox" /> Solar Radiation
            </label>
            <label className="checkbox-label">
              <input type="checkbox" /> UV Index
            </label>
            <label className="checkbox-label">
              <input type="checkbox" /> Soil Temperature
            </label>
            <label className="checkbox-label">
              <input type="checkbox" /> Soil Moisture
            </label>
          </div>
        </div>

        <button className="btn-download">Download as CSV</button>
      </div>
    </div>
  );
}
EOF
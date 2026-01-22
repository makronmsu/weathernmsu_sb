import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useState } from 'react';
import type { WeatherAlert } from '@/lib/weatherApi';

interface WeatherAlertsProps {
  alerts: WeatherAlert[];
  onDismiss: (alertId: string) => void;
}

export default function WeatherAlerts({ alerts, onDismiss }: WeatherAlertsProps) {
  const [expandedAlerts, setExpandedAlerts] = useState<Set<string>>(new Set());

  if (alerts.length === 0) {
    return null;
  }

  const toggleExpanded = (alertId: string) => {
    const newExpanded = new Set(expandedAlerts);
    if (newExpanded.has(alertId)) {
      newExpanded.delete(alertId);
    } else {
      newExpanded.add(alertId);
    }
    setExpandedAlerts(newExpanded);
  };

  const highAlerts = alerts.filter((a) => a.severity === 'high');
  const mediumAlerts = alerts.filter((a) => a.severity === 'medium');
  const lowAlerts = alerts.filter((a) => a.severity === 'low');

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'medium':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'low':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getAlertBgColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-500/20 border-red-500/40';
      case 'medium':
        return 'bg-yellow-500/20 border-yellow-500/40';
      case 'low':
        return 'bg-blue-500/20 border-blue-500/40';
      default:
        return 'bg-slate-500/20 border-slate-500/40';
    }
  };

  const getAlertTextColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-900';
      case 'medium':
        return 'text-yellow-900';
      case 'low':
        return 'text-blue-900';
      default:
        return 'text-slate-900';
    }
  };

  return (
    <div className="glass-card bg-white/35 border-white/40 backdrop-blur-md mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
          <AlertCircle className="w-6 h-6" />
          Weather Alerts ({alerts.length})
        </h3>
        <div className="text-sm text-slate-600">
          {highAlerts.length > 0 && (
            <span className="inline-block mr-3 px-2 py-1 bg-red-500/30 text-red-900 rounded">
              {highAlerts.length} High
            </span>
          )}
          {mediumAlerts.length > 0 && (
            <span className="inline-block mr-3 px-2 py-1 bg-yellow-500/30 text-yellow-900 rounded">
              {mediumAlerts.length} Medium
            </span>
          )}
          {lowAlerts.length > 0 && (
            <span className="inline-block px-2 py-1 bg-blue-500/30 text-blue-900 rounded">
              {lowAlerts.length} Low
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`border rounded-lg p-4 transition-all duration-300 ${getAlertBgColor(alert.severity)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                {getAlertIcon(alert.severity)}
                <div className="flex-1">
                  <div className={`font-semibold ${getAlertTextColor(alert.severity)}`}>
                    {alert.stationName}
                  </div>
                  <div className={`text-sm mt-1 ${getAlertTextColor(alert.severity)}`}>
                    {alert.message}
                  </div>
                  {expandedAlerts.has(alert.id) && (
                    <div className={`text-xs mt-2 space-y-1 ${getAlertTextColor(alert.severity)}`}>
                      <div>Type: {alert.type}</div>
                      <div>Current: {alert.value.toFixed(2)}</div>
                      <div>Threshold: {alert.threshold.toFixed(2)}</div>
                      <div>Time: {new Date(alert.timestamp).toLocaleTimeString()}</div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2 ml-3">
                <button
                  onClick={() => toggleExpanded(alert.id)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${getAlertTextColor(alert.severity)} hover:opacity-70`}
                >
                  {expandedAlerts.has(alert.id) ? 'Less' : 'More'}
                </button>
                <button
                  onClick={() => onDismiss(alert.id)}
                  className={`p-1 rounded transition-colors ${getAlertTextColor(alert.severity)} hover:opacity-70`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

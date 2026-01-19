import React, { useState, useEffect } from 'react';
import { AlertTriangle, Info, ShieldAlert } from 'lucide-react';
import { Alert } from '../types';

interface AlertTickerProps {
  alerts: Alert[];
}

const AlertTicker: React.FC<AlertTickerProps> = ({ alerts }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-rotate alerts if there are multiple
  useEffect(() => {
    if (alerts.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % alerts.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [alerts.length]);

  if (alerts.length === 0) return null;

  const currentAlert = alerts[currentIndex];

  const getIcon = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical': return <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      default: return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getBorderColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical': return 'border-red-500/50 bg-red-950/20';
      case 'warning': return 'border-amber-500/50 bg-amber-950/20';
      default: return 'border-blue-500/50 bg-blue-950/20';
    }
  };

  return (
    <div className={`w-full border-y backdrop-blur-sm transition-colors duration-500 ${getBorderColor(currentAlert.severity)}`}>
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between overflow-hidden">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <span className="shrink-0 uppercase text-xs font-bold tracking-wider opacity-70">
            System Alert
          </span>
          <div className="h-4 w-px bg-current opacity-30 mx-2"></div>
          {getIcon(currentAlert.severity)}
          <div className="flex flex-col sm:flex-row sm:items-center truncate">
             <span className="font-mono text-sm font-semibold mr-3 truncate text-white">
              {currentAlert.timestamp}
            </span>
            <span className="text-sm font-medium truncate text-gray-200">
              {currentAlert.message}
            </span>
          </div>
        </div>
        
        <div className="hidden sm:flex shrink-0 space-x-1 ml-4">
          {alerts.map((_, idx) => (
            <div 
              key={idx}
              className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-cyan-400 w-4' : 'bg-gray-600'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AlertTicker;

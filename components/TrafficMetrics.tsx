import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Wind, Car } from 'lucide-react';
import { MetricData } from '../types';

interface TrafficMetricsProps {
  trafficData: MetricData[];
  aqiLevel: number;
  avgSpeed: number;
}

const TrafficMetrics: React.FC<TrafficMetricsProps> = ({ trafficData, aqiLevel, avgSpeed }) => {
  
  const getAQIColor = (level: number) => {
    if (level < 50) return 'text-emerald-400';
    if (level < 100) return 'text-amber-400';
    return 'text-red-400';
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-600 p-2 rounded shadow-xl">
          <p className="text-slate-300 font-mono text-xs">{label}</p>
          <p className="text-cyan-400 font-bold text-sm">
            {payload[0].value.toFixed(0)}% Flow
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      
      {/* Traffic Flow Card */}
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-5 shadow-xl flex flex-col flex-1 min-h-0">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-slate-400 text-xs uppercase font-bold tracking-wider flex items-center gap-2">
              <Car className="w-4 h-4 text-cyan-500" />
              Traffic Density
            </h3>
            <p className="text-3xl font-mono font-bold text-white mt-2">
              87<span className="text-lg text-slate-500 ml-1 font-normal">%</span>
            </p>
          </div>
          <span className="text-xs font-mono bg-slate-800 text-cyan-400 px-2 py-1 rounded border border-slate-700/50">
            AVG {avgSpeed} km/h
          </span>
        </div>
        
        <div className="flex-1 w-full min-h-[100px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trafficData}>
              <defs>
                <linearGradient id="colorFlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
              <XAxis dataKey="time" hide />
              <YAxis hide domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#475569', strokeWidth: 1 }} />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#06b6d4" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorFlow)" 
                isAnimationActive={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Air Quality Card */}
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-5 shadow-xl flex flex-col justify-between flex-1 min-h-0">
        <div className="flex justify-between items-start">
          <h3 className="text-slate-400 text-xs uppercase font-bold tracking-wider flex items-center gap-2">
            <Wind className="w-4 h-4 text-emerald-500" />
            Air Quality Index
          </h3>
          <Activity className={`w-5 h-5 ${getAQIColor(aqiLevel)}`} />
        </div>

        <div className="flex items-baseline gap-3 my-2">
          <span className={`text-5xl font-mono font-bold tracking-tighter ${getAQIColor(aqiLevel)}`}>
            {aqiLevel}
          </span>
          <span className="text-sm text-slate-400 font-medium bg-slate-800 px-2 py-0.5 rounded-full">
            {aqiLevel < 50 ? 'Good Condition' : aqiLevel < 100 ? 'Moderate Risk' : 'Unhealthy'}
          </span>
        </div>

        <div>
            {/* Pseudo-gauge bar */}
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
            <div 
                className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 transition-all duration-1000 relative"
                style={{ width: '100%' }}
            >
                <div 
                className="absolute top-0 bottom-0 w-1.5 bg-white shadow-[0_0_8px_white] transform -translate-x-1/2" 
                style={{ left: `${Math.min((aqiLevel / 150) * 100, 100)}%`, transition: 'left 1s ease-in-out' }}
                />
            </div>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-mono uppercase tracking-wider">
            <span>0 AQI</span>
            <span>75</span>
            <span>150+</span>
            </div>
        </div>
      </div>

    </div>
  );
};

export default TrafficMetrics;
import React from 'react';
import { RouteInfo, Status } from '../types';
import { Clock, ArrowRight } from 'lucide-react';

interface RouteScheduleProps {
  routes: RouteInfo[];
  highlightedRouteId: string | null;
}

const RouteSchedule: React.FC<RouteScheduleProps> = ({ routes, highlightedRouteId }) => {
  const getStatusColor = (status: Status) => {
    switch (status) {
      case Status.ON_TIME: return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case Status.DELAYED: return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case Status.OUT_OF_SERVICE: return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 border border-slate-700 rounded-lg shadow-xl overflow-hidden dashboard-panel">
      <div className="p-5 border-b border-slate-700 bg-slate-800/30 flex justify-between items-center backdrop-blur-sm">
        <h2 className="text-lg font-bold text-cyan-100 uppercase tracking-widest flex items-center gap-3">
          <Clock className="w-5 h-5 text-cyan-500" />
          Live Schedule
        </h2>
        <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-[10px] font-mono text-slate-400 tracking-wider">LIVE FEED</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-800/80 sticky top-0 z-10 text-xs uppercase font-semibold text-slate-400 backdrop-blur-md">
            <tr>
              <th className="p-4 border-b border-slate-700/80 w-28">Route</th>
              <th className="p-4 border-b border-slate-700/80">Destination</th>
              <th className="p-4 border-b border-slate-700/80 text-right w-24">ETA</th>
              <th className="p-4 border-b border-slate-700/80 text-center w-36">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 text-sm">
            {routes.map((route) => {
              const isHighlighted = route.routeNumber === highlightedRouteId;
              
              return (
                <tr 
                  key={route.id} 
                  className={`
                    transition-all duration-500 group transit-row
                    ${isHighlighted 
                      ? 'bg-cyan-900/20 border-l-2 border-l-cyan-400' 
                      : 'hover:bg-slate-800/60 border-l-2 border-l-transparent'}
                  `}
                >
                  <td className="p-4 font-mono font-bold text-cyan-300">
                    <span className={`
                      px-3 py-1.5 rounded transition-colors shadow-sm border whitespace-nowrap inline-block text-center min-w-[70px]
                      ${isHighlighted ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-200' : 'bg-slate-800 border-slate-600 group-hover:border-cyan-500/50'}
                    `}>
                      {route.routeNumber}
                    </span>
                  </td>
                  <td className="p-4 text-slate-200">
                    <div className="flex items-center gap-2">
                      <span className={`truncate max-w-[140px] font-medium ${isHighlighted ? 'text-white' : ''}`}>
                        {route.destination}
                      </span>
                      <ArrowRight className={`w-3 h-3 text-cyan-500 transition-all transform 
                        ${isHighlighted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'}
                      `} />
                    </div>
                  </td>
                  <td className="p-4 text-right font-mono text-slate-300">
                    <span className="text-white font-bold">{route.eta}</span> <span className="text-xs text-slate-500">min</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`text-[10px] uppercase tracking-wide px-2.5 py-1 rounded border font-bold ${getStatusColor(route.status)} live-status-badge block w-full whitespace-nowrap`}>
                      {route.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RouteSchedule;
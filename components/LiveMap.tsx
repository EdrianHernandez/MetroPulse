import React, { useState, useEffect, useRef } from 'react';
import { TransitVehicle, VehicleType, Status } from '../types';
import { MapPin, Navigation, Gauge, Users, Clock, X } from 'lucide-react';

interface LiveMapProps {
  vehicles: TransitVehicle[];
  selectedVehicleId: string | null;
  onSelectVehicle: (id: string | null) => void;
}

// Define route geometries
const ROUTES = [
  { id: '101', type: 'line', d: 'M 50 300 L 750 300', color: '#06b6d4' }, // Cyan (Bus)
  { id: 'RED', type: 'line', d: 'M 400 50 L 400 550', color: '#d946ef' }, // Fuchsia (Train)
  { id: 'C-LOOP', type: 'circle', cx: 400, cy: 300, r: 150, color: '#eab308' }, // Yellow (Tram)
];

// Generate some static city blocks for visual background
const generateCityBlocks = (width: number, height: number, count: number) => {
  const blocks = [];
  for (let i = 0; i < count; i++) {
    const w = Math.random() * 80 + 40;
    const h = Math.random() * 80 + 40;
    const x = Math.floor(Math.random() * (width / 50)) * 50;
    const y = Math.floor(Math.random() * (height / 50)) * 50;
    blocks.push({ x, y, w: w - 10, h: h - 10 });
  }
  return blocks;
};

const LiveMap: React.FC<LiveMapProps> = ({ vehicles, selectedVehicleId, onSelectVehicle }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  
  // Static city geometry
  const [cityBlocks] = useState(() => generateCityBlocks(800, 600, 40));

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);
  const activeRouteId = selectedVehicle?.routeId;

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    
    window.addEventListener('resize', updateSize);
    updateSize();
    
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const getVehicleColor = (type: VehicleType) => {
    switch (type) {
      case VehicleType.BUS: return '#06b6d4'; // Cyan
      case VehicleType.TRAIN: return '#d946ef'; // Fuchsia
      case VehicleType.TRAM: return '#eab308'; // Yellow
      default: return '#ffffff';
    }
  };

  const getHeadingText = (deg: number) => {
    const val = Math.floor((deg / 45) + 0.5);
    const arr = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    return arr[(val % 8)];
  };

  const getStatusColor = (s: Status) => {
      switch (s) {
          case Status.ON_TIME: return 'text-emerald-400';
          case Status.DELAYED: return 'text-amber-400';
          case Status.OUT_OF_SERVICE: return 'text-red-400';
          default: return 'text-slate-400';
      }
  };

  const getOccupancy = (id: string) => {
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const levels = ['Low', 'Medium', 'High', 'Full'];
    const colors = ['text-emerald-400', 'text-cyan-400', 'text-amber-400', 'text-red-400'];
    const idx = hash % 4;
    return { level: levels[idx], color: colors[idx] };
  };

  const getSpeed = (type: VehicleType) => {
      switch(type) {
          case VehicleType.TRAIN: return '85 km/h';
          case VehicleType.BUS: return '45 km/h';
          case VehicleType.TRAM: return '30 km/h';
          default: return '0 km/h';
      }
  };

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full bg-slate-950 overflow-hidden rounded-lg border border-slate-700 shadow-2xl dashboard-map-container"
    >
      {/* Grid Overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ 
             backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)', 
             backgroundSize: '50px 50px' 
           }}>
      </div>

      <svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 800 600" 
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 cursor-crosshair"
        onClick={() => onSelectVehicle(null)}
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* City Blocks (Background) */}
        <g className="opacity-30">
          {cityBlocks.map((block, i) => (
            <rect 
              key={i} 
              x={block.x} 
              y={block.y} 
              width={block.w} 
              height={block.h} 
              fill="#1e293b" 
              stroke="#334155"
              strokeWidth="1"
            />
          ))}
        </g>

        {/* Routes Layers */}
        {ROUTES.map(route => {
          const isActive = route.id === activeRouteId;
          const strokeColor = isActive ? route.color : '#334155';
          const strokeWidth = isActive ? 4 : 2;
          const strokeDasharray = isActive ? 'none' : '5,5';
          const opacity = isActive ? 1 : 0.6;
          const filter = isActive ? 'url(#glow)' : undefined;

          if (route.type === 'circle') {
            return (
              <circle
                key={route.id}
                cx={route.cx}
                cy={route.cy}
                r={route.r}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                fill="none"
                opacity={opacity}
                filter={filter}
                className="transition-all duration-300 ease-in-out"
              />
            );
          }
          return (
            <path
              key={route.id}
              d={route.d}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              fill="none"
              opacity={opacity}
              filter={filter}
              className="transition-all duration-300 ease-in-out"
            />
          );
        })}

        {/* Vehicles */}
        {vehicles.map((vehicle) => {
          const isActive = selectedVehicleId === vehicle.id;
          const color = getVehicleColor(vehicle.type);
          
          return (
            <g 
              key={vehicle.id} 
              transform={`translate(${vehicle.position.x}, ${vehicle.position.y})`}
              className="cursor-pointer transition-all duration-500 ease-linear"
              onClick={(e) => {
                  e.stopPropagation();
                  onSelectVehicle(isActive ? null : vehicle.id);
              }}
            >
              {/* Range ring (visible when active) */}
              {isActive && (
                <circle 
                  r="40" 
                  fill="none" 
                  stroke={color} 
                  strokeWidth="1" 
                  strokeOpacity="0.3"
                  className="animate-ping" 
                />
              )}
              
              {/* Vehicle Body */}
              <circle 
                r={isActive ? 8 : 5} 
                fill={color}
                filter="url(#glow)"
                className="transition-all duration-300"
              />
              
              {/* Direction Indicator */}
              <g transform={`rotate(${vehicle.heading})`}>
                 <path d="M 0 -8 L 4 4 L 0 2 L -4 4 Z" fill={color} opacity={0.8} />
              </g>

              {/* Label */}
              <text 
                y={-15} 
                x={0} 
                textAnchor="middle" 
                fill="white" 
                fontSize="10" 
                fontFamily="monospace"
                className={`transition-opacity duration-300 select-none ${isActive ? 'opacity-100' : 'opacity-0 hover:opacity-100'}`}
                style={{ textShadow: '0 1px 2px black' }}
              >
                {vehicle.routeId}
              </text>
            </g>
          );
        })}
      </svg>
      
      {/* Map Controls / Legend Overlay */}
      <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur border border-slate-700 p-3 rounded-lg shadow-lg pointer-events-none">
        <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Map Legend</h4>
        <div className="space-y-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_5px_cyan]"></span>
            <span className="text-slate-300">Bus Network (101)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-fuchsia-500 shadow-[0_0_5px_fuchsia]"></span>
            <span className="text-slate-300">Metro Lines (RED)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_5px_yellow]"></span>
            <span className="text-slate-300">Tram Service (C-LOOP)</span>
          </div>
        </div>
      </div>

      {selectedVehicle && (
        <div className="absolute top-4 right-4 bg-slate-900/95 backdrop-blur border-l-4 border-cyan-500 p-5 rounded shadow-2xl w-80 animate-in slide-in-from-right z-10 pointer-events-auto">
          <div className="flex justify-between items-start mb-4 border-b border-slate-700 pb-3">
            <div>
               <div className="flex items-center gap-3">
                   <h3 className="text-cyan-400 font-bold text-xl tracking-tight">{selectedVehicle.id}</h3>
                   <span className="text-[10px] uppercase font-bold bg-slate-800 border border-slate-600 px-2 py-0.5 rounded text-slate-300 tracking-wider">
                       {selectedVehicle.type}
                   </span>
               </div>
               <p className="text-slate-400 text-sm flex items-center gap-1.5 mt-1 font-medium">
                 <Navigation className="w-3.5 h-3.5 text-cyan-500" /> 
                 Heading {getHeadingText(selectedVehicle.heading)}
               </p>
            </div>
            <button 
                onClick={() => onSelectVehicle(null)}
                className="text-slate-500 hover:text-white transition-colors"
            >
                <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/50 p-3 rounded border border-slate-700/50 hover:border-slate-600 transition-colors">
                    <div className="flex items-center gap-2 mb-1.5">
                        <Gauge className="w-3.5 h-3.5 text-cyan-500" />
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Speed</span>
                    </div>
                    <span className="font-mono text-white text-lg font-bold">{getSpeed(selectedVehicle.type)}</span>
                </div>
                <div className="bg-slate-800/50 p-3 rounded border border-slate-700/50 hover:border-slate-600 transition-colors">
                    <div className="flex items-center gap-2 mb-1.5">
                        <Users className="w-3.5 h-3.5 text-fuchsia-500" />
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Occupancy</span>
                    </div>
                    {(() => {
                        const occ = getOccupancy(selectedVehicle.id);
                        return <span className={`font-mono text-lg font-bold ${occ.color}`}>{occ.level}</span>;
                    })()}
                </div>
              </div>

              <div className="bg-slate-800/50 p-3 rounded border border-slate-700/50 flex justify-between items-center hover:border-slate-600 transition-colors">
                  <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="text-xs text-slate-300 font-bold uppercase tracking-wide">Status</span>
                  </div>
                  <span className={`font-mono font-bold text-sm ${getStatusColor(selectedVehicle.status)}`}>
                      {selectedVehicle.status.replace('_', ' ')}
                  </span>
              </div>
              
              <div className="flex justify-between items-center pt-2 text-[10px] text-slate-600 font-mono border-t border-slate-800 mt-2">
                  <span>COORD: {selectedVehicle.position.x.toFixed(0)}, {selectedVehicle.position.y.toFixed(0)}</span>
                  <span>RT: {selectedVehicle.routeId}</span>
              </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveMap;
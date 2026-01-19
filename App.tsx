import React, { useState, useEffect } from 'react';
import { RouteInfo, TransitVehicle, Status, VehicleType, Alert, MetricData } from './types';
import LiveMap from './components/LiveMap';
import RouteSchedule from './components/RouteSchedule';
import TrafficMetrics from './components/TrafficMetrics';
import AlertTicker from './components/AlertTicker';
import { Layers, Radio, Settings } from 'lucide-react';

// --- MOCK DATA GENERATORS ---

const INITIAL_VEHICLES: TransitVehicle[] = [
  { id: 'V-101', type: VehicleType.BUS, routeId: '101', position: { x: 100, y: 300 }, heading: 90, status: Status.ON_TIME },
  { id: 'V-102', type: VehicleType.BUS, routeId: '101', position: { x: 300, y: 300 }, heading: 90, status: Status.ON_TIME },
  { id: 'T-404', type: VehicleType.TRAIN, routeId: 'RED', position: { x: 400, y: 100 }, heading: 180, status: Status.DELAYED },
  { id: 'T-405', type: VehicleType.TRAIN, routeId: 'RED', position: { x: 400, y: 500 }, heading: 0, status: Status.ON_TIME },
  { id: 'R-22',  type: VehicleType.TRAM, routeId: 'C-LOOP', position: { x: 400, y: 300 }, heading: 45, status: Status.ON_TIME },
];

const INITIAL_ROUTES: RouteInfo[] = [
  { id: 'r1', routeNumber: '101', destination: 'Central Station', eta: 4, status: Status.ON_TIME },
  { id: 'r2', routeNumber: '101', destination: 'North Harbor', eta: 12, status: Status.ON_TIME },
  { id: 'r3', routeNumber: 'RED', destination: 'Airport Terminal', eta: 8, status: Status.DELAYED },
  { id: 'r4', routeNumber: 'RED', destination: 'Downtown', eta: 2, status: Status.ON_TIME },
  { id: 'r5', routeNumber: 'C-LOOP', destination: 'Financial Dist', eta: 5, status: Status.ON_TIME },
  { id: 'r6', routeNumber: '205', destination: 'Westside Mall', eta: 18, status: Status.OUT_OF_SERVICE },
];

const ALERTS: Alert[] = [
  { id: 'a1', message: 'Signal failure at Downtown crossing. Expect delays on Red Line.', severity: 'warning', timestamp: '10:42 AM' },
  { id: 'a2', message: 'Accident cleared on 5th Ave. Traffic returning to normal.', severity: 'info', timestamp: '10:30 AM' },
  { id: 'a3', message: 'Severe weather warning in effect for Northern Sector.', severity: 'critical', timestamp: '10:15 AM' },
];

const generateTrafficData = (): MetricData[] => {
  return Array.from({ length: 12 }, (_, i) => ({
    time: `${i * 5}m`,
    value: 60 + Math.random() * 30
  }));
};

const App: React.FC = () => {
  const [vehicles, setVehicles] = useState<TransitVehicle[]>(INITIAL_VEHICLES);
  const [routes, setRoutes] = useState<RouteInfo[]>(INITIAL_ROUTES);
  const [trafficData, setTrafficData] = useState<MetricData[]>(generateTrafficData());
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Lifted state for selection coordination
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  
  // Derived state
  const selectedRouteId = vehicles.find(v => v.id === selectedVehicleId)?.routeId || null;

  // Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      // Update Time
      setCurrentTime(new Date());

      // Animate Vehicles (Mock movement)
      setVehicles(prev => prev.map(v => {
        let { x, y } = v.position;
        const speed = 2;
        
        // Simple logic to move vehicles around a "virtual" track
        if (v.type === VehicleType.BUS) { // Horizontal movement
           x += speed; 
           if (x > 800) x = 0;
        } else if (v.type === VehicleType.TRAIN) { // Vertical movement
           y += v.heading === 180 ? speed : -speed;
           if (y > 600) y = 0;
           if (y < 0) y = 600;
        } else { // Circle movement
           // Basic orbital math logic around center (400, 300)
           const cx = 400, cy = 300, r = 150;
           const angle = Math.atan2(y - cy, x - cx) + 0.02;
           x = cx + r * Math.cos(angle);
           y = cy + r * Math.sin(angle);
        }

        return { ...v, position: { x, y } };
      }));

      // Randomize route ETAs occasionally
      if (Math.random() > 0.9) {
        setRoutes(prev => prev.map(r => ({
          ...r,
          eta: Math.max(0, r.eta + (Math.random() > 0.5 ? 1 : -1))
        })));
      }

      // Live update chart data
      if (Math.random() > 0.8) {
         setTrafficData(curr => {
            const newVal = 60 + Math.random() * 30;
            return [...curr.slice(1), { time: 'now', value: newVal }];
         });
      }

    }, 100); // 60fps-ish animation for vehicles

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500 selection:text-white flex flex-col">
      
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 relative z-20 shadow-2xl">
        <div className="max-w-[1920px] mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-cyan-500 p-2.5 rounded shadow-lg shadow-cyan-500/20">
              <Layers className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white leading-none">MetroPulse</h1>
              <span className="text-xs text-cyan-500 uppercase tracking-[0.2em] font-medium">Urban Transit Command</span>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="hidden md:flex flex-col items-end border-r border-slate-800 pr-8">
              <span className="text-[10px] font-mono text-slate-400 tracking-wider">SYSTEM STATUS</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-emerald-500 font-bold text-sm tracking-wide">OPERATIONAL</span>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-3xl font-mono font-bold leading-none text-white tracking-tight">
                {currentTime.toLocaleTimeString([], { hour12: false })}
              </div>
              <div className="text-xs text-slate-500 uppercase font-medium mt-1">
                {currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
              </div>
            </div>

            <button className="p-3 hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-700">
              <Settings className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Alert Ticker */}
      <div className="sticky top-0 z-10 shadow-lg">
        <AlertTicker alerts={ALERTS} />
      </div>

      {/* Main Content Grid */}
      <main className="flex-1 p-6 lg:p-8 overflow-hidden max-w-[1920px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full min-h-[800px]">
          
          {/* Left Column: Live Map (Dominant) */}
          <div className="lg:col-span-8 flex flex-col h-full min-h-[500px] lg:min-h-0">
            <div className="flex justify-between items-center mb-5 px-1">
               <h2 className="text-xl font-bold text-white flex items-center gap-3">
                 <Radio className="w-5 h-5 text-fuchsia-500" />
                 Live Network Topology
               </h2>
               <div className="flex gap-2">
                 <span className="text-xs font-mono bg-slate-900 text-slate-400 px-3 py-1.5 rounded border border-slate-700">ZONE A</span>
                 <span className="text-xs font-mono bg-slate-900 text-slate-400 px-3 py-1.5 rounded border border-slate-700">ZONE B</span>
               </div>
            </div>
            <div className="flex-1 relative shadow-2xl rounded-lg">
              <LiveMap 
                vehicles={vehicles} 
                selectedVehicleId={selectedVehicleId} 
                onSelectVehicle={setSelectedVehicleId} 
              />
            </div>
          </div>

          {/* Right Column: Metrics & Schedule */}
          <div className="lg:col-span-4 flex flex-col gap-8 h-full">
            
            {/* Metrics Section */}
            <div className="h-[45%] min-h-[380px]">
              <TrafficMetrics 
                trafficData={trafficData} 
                aqiLevel={42} 
                avgSpeed={38} 
              />
            </div>

            {/* Schedule Section */}
            <div className="flex-1 min-h-[350px]">
              <RouteSchedule 
                routes={routes} 
                highlightedRouteId={selectedRouteId} 
              />
            </div>
            
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;
export enum VehicleType {
  BUS = 'BUS',
  TRAIN = 'TRAIN',
  TRAM = 'TRAM'
}

export enum Status {
  ON_TIME = 'ON_TIME',
  DELAYED = 'DELAYED',
  OUT_OF_SERVICE = 'OUT_OF_SERVICE'
}

export interface Coordinates {
  x: number;
  y: number;
}

export interface TransitVehicle {
  id: string;
  type: VehicleType;
  routeId: string;
  position: Coordinates;
  heading: number; // 0-360 degrees
  status: Status;
}

export interface RouteInfo {
  id: string;
  routeNumber: string;
  destination: string;
  eta: number; // minutes
  status: Status;
}

export interface Alert {
  id: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: string;
}

export interface MetricData {
  time: string;
  value: number;
}

import { LatLng } from 'react-native-maps';

export interface ShuttlePoint {
  ID: string;
  Latitude: number;
  Longitude: number;
  IconImage?: string;
}

export interface ShuttleStop {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface ShuttleDepartureInfo {
  departureTime: string;
  waitTime: number;
}

export interface ShuttleRoute {
  points: LatLng[];
  stops: ShuttleStop[];
  nextDeparture: ShuttleDepartureInfo;
}

export type CampusType = 'SGW' | 'LOYOLA'; 
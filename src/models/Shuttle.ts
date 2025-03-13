import { Audit } from './Audit';
import { LatLng } from 'react-native-maps';

export interface ShuttlePoint extends Audit {
  id: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  icon: string;
}

export interface ShuttleStop extends Audit {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  campusType: 'SGW' | 'LOYOLA';
}

export interface ShuttleRoute extends Audit {
  id: string;
  name: string;
  points: LatLng[];
  color: string;
  width: number;
}

export interface ShuttleDepartureInfo extends Audit {
  departureTime: Date;
  waitTime: number;
  campus: 'SGW' | 'LOYOLA';
}

export interface ShuttleState extends Audit {
  locations: ShuttlePoint[];
  route: ShuttleRoute | null;
  estimatedWaitTime: number | null;
  isLoading: boolean;
  error: string | null;
}

export type CampusType = 'SGW' | 'LOYOLA';

export interface ShuttleLocation {
  ID: string;
  Latitude: number;
  Longitude: number;
}

export interface ShuttleStop {
  name: string;
  latitude: number;
  longitude: number;
}

export interface ShuttleDepartureInfo {
  departureTime: string;
  waitTime: number;
}

export interface ShuttleRoute {
  points: LatLng[];
  isActive: boolean;
}

export interface LatLng {
  latitude: number;
  longitude: number;
} 
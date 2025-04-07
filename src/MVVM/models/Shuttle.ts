import { Audit } from './Audit';

export interface ShuttlePoint extends Audit {
  latitude?: number;
  longitude?: number;
  speed?: number;
  heading?: number;
  icon?: string;
}

export interface ShuttleStop extends Audit {
  name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  campusType?: 'SGW' | 'LOYOLA';
}

export interface ShuttleRoute extends Audit {
  name?: string;
  points?: LatLng[];
  color?: string;
  width?: number;
}

export interface ShuttleDepartureInfo extends Audit {
  departureTime?: Date;
  waitTime?: number;
  campus?: 'SGW' | 'LOYOLA';
}

export interface ShuttleState extends Audit {
  locations?: ShuttlePoint[];
  route?: ShuttleRoute | null;
  estimatedWaitTime?: number | null;
  isLoading?: boolean;
  error?: string | null;
}

export type CampusType = 'SGW' | 'LOYOLA';

export interface ShuttleLocation extends Audit {
  ID?: string;
  Latitude?: number;
  Longitude?: number;
}

// Already defined above but with different fields - resolving duplication
export interface ShuttleStop extends Audit {
  name?: string;
  latitude?: number;
  longitude?: number;
}

// Already defined above but with different fields - resolving duplication
export interface ShuttleDepartureInfo extends Audit {
  departureTime?: Date;
  waitTime?: number;
}

// Already defined above but with different fields - resolving duplication
export interface ShuttleRoute extends Audit {
  points?: LatLng[];
  isActive?: boolean;
}

export interface LatLng{
  latitude?: number;
  longitude?: number;
}
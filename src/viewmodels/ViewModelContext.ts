import React, { createContext } from "react";
import { CampusViewModel } from "./CampusViewModel";
import { BuildingViewModel } from './BuildingViewModel';
import { RouteViewModel } from './RouteViewModel';
import { ShuttleViewModel } from './ShuttleViewModel';

export interface ViewModelContextType {
  buildingViewModel: BuildingViewModel;
  campusViewModel: CampusViewModel;
  routeViewModel: RouteViewModel;
  shuttleViewModel: ShuttleViewModel;
}

export const ViewModelContext = createContext<ViewModelContextType | null>(null);

export const useViewModel = <T>(ViewModelClass: new () => T): T => {
  const context = React.useContext(ViewModelContext);
  if (!context) {
    throw new Error("useViewModel must be used within a ViewModelProvider");
  }
  return context as T;
};

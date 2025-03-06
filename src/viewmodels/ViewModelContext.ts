import React from "react";
import { CampusViewModel } from "./CampusViewModel";

export const ViewModelContext = React.createContext<CampusViewModel | null>(
  null
);

export const useViewModel = <T>(ViewModelClass: new () => T): T => {
  const context = React.useContext(ViewModelContext);
  if (!context) {
    throw new Error("useViewModel must be used within a ViewModelProvider");
  }
  return context as T;
};

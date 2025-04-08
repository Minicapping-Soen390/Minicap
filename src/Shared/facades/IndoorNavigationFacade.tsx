import { Alert } from "react-native";

/**
 * Creates a facade for Indoor Navigation operations.
 * @param params - Object containing state setters and values for indoor navigation
 * @returns Object containing indoor navigation utility functions
 */
export const createIndoorNavigationFacade = (params: {
  setIsIndoorNavVisible: (visible: boolean) => void;
  setCurrentFloorIndex: (index: number) => void;
  currentFloorIndex: number;
  buildingInfo: any | null;
  Alert: typeof Alert;
}) => {
  const {
    setIsIndoorNavVisible,
    setCurrentFloorIndex,
    currentFloorIndex,
    buildingInfo,
    Alert,
  } = params;

  /**
   * Handles the start of indoor navigation.
   */
  const handleIndoorNavigation = () => {
    console.log("handleIndoorNavigation triggered");

    if (buildingInfo) {
      console.log("Building info found for:", buildingInfo.name);
      console.log("Floor info:", buildingInfo.floors);

      if (buildingInfo.floors && buildingInfo.floors.length > 0) {
        console.log(
          `Found ${buildingInfo.floors.length} floors for ${buildingInfo.name}.`
        );
        setCurrentFloorIndex(0); // Reset to first floor
        setIsIndoorNavVisible(true);
        console.log(
          "Indoor navigation modal is now visible. Starting at floor 0."
        );
      } else {
        console.log("No floors data available for this building.");
        Alert.alert("No floor information available for this building.");
      }
    } else {
      console.log("No building info available.");
      Alert.alert("Building information is missing.");
    }
  };

  /**
   * Closes indoor navigation view.
   */
  const closeIndoorNavigation = () => {
    console.log("Closing indoor navigation...");
    setIsIndoorNavVisible(false);
    console.log("Indoor navigation modal is now closed.");
  };

  /**
   * Changes floor in indoor navigation view.
   * @param direction - Direction to change floor (up or down)
   */
  const changeFloor = (direction: "up" | "down") => {
    console.log(
      `Change floor triggered: direction ${direction}, current floor index: ${currentFloorIndex}`
    );

    if (buildingInfo && buildingInfo.floors) {
      console.log(
        `Building ${buildingInfo.name} has ${buildingInfo.floors.length} floors.`
      );
      if (
        direction === "up" &&
        currentFloorIndex < buildingInfo.floors.length - 1
      ) {
        console.log("Moving up to the next floor...");
        setCurrentFloorIndex(currentFloorIndex + 1);
        console.log(`Current floor index updated to: ${currentFloorIndex + 1}`);
      } else if (direction === "down" && currentFloorIndex > 0) {
        console.log("Moving down to the previous floor...");
        setCurrentFloorIndex(currentFloorIndex - 1);
        console.log(`Current floor index updated to: ${currentFloorIndex - 1}`);
      } else {
        if (direction === "up") {
          console.log("Already on the top floor.");
        } else {
          console.log("Already on the bottom floor.");
        }
      }
    } else {
      console.log("No floor data available.");
    }
  };
  
  return {
    handleIndoorNavigation,
    closeIndoorNavigation,
    changeFloor,
  };
};

export default createIndoorNavigationFacade;
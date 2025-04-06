import { View, Text, TouchableOpacity, StyleSheet, TextInput, TouchableWithoutFeedback, Keyboard } from "react-native";
import { Svg, Rect } from 'react-native-svg';
import React, { useState, useRef } from "react";
import Hall8 from "../data/svgFloorMaps/Annotated-Hall-8.svg";
import Hall9 from "../data/svgFloorMaps/Hall-9.svg";
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

interface Marker {
  id: string;
  x: number;
  y: number;
}

interface IndoorNavigationModalProps {
  buildingInfo: any;
  currentFloorIndex: number;
  closeIndoorNavigation: () => void;
  changeFloor: (direction: 'up' | 'down') => void;
}

// Toggle strategies
const toggleStrategies = {
  stairs: (currentState: boolean) => !currentState,
  elevators: (currentState: boolean) => !currentState,
  accessibility: (currentState: boolean) => !currentState,
};

const IndoorNavigationModal: React.FC<IndoorNavigationModalProps> = ({
  buildingInfo,
  currentFloorIndex,
  closeIndoorNavigation,
  changeFloor,
}) => {
  const [isAccessibilityEnabled, setAccessibilityEnabled] = useState(false);
  const [showStairsMarkers, setShowStairsMarkers] = useState(false);
  const [showElevatorMarkers, setShowElevatorMarkers] = useState(false);
  const searchInputRef = useRef<TextInput>(null);

  // Hardcoded Indoor POIS
  const stairsLocations: Record<number, Marker[]> = {
    0: [
      { id: 'rect3865', x: 166, y: 349 },
      { id: 'rect3945', x: 495, y: 350 },
      { id: 'rect3957', x: 498, y: 643 },
      { id: 'rect3919', x: 207, y: 643 }
    ],
    1: [] // Add floor 1 locations when needed
  };

  const elevatorLocations: Record<number, Marker[]> = {
    0: [
      { id: 'rect3881', x: 240, y: 200 },
      { id: 'rect3883', x: 245, y: 411 }
    ],
    1: [] // Add floor 1 locations when needed
  };

  // Toggle functions using strategy pattern
  const handleToggle = (type: 'stairs' | 'elevators' | 'accessibility') => {
    switch (type) {
      case 'stairs':
        setShowStairsMarkers(toggleStrategies.stairs(showStairsMarkers));
        break;
      case 'elevators':
        setShowElevatorMarkers(toggleStrategies.elevators(showElevatorMarkers));
        break;
      case 'accessibility':
        setAccessibilityEnabled(toggleStrategies.accessibility(isAccessibilityEnabled));
        break;
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => {
      Keyboard.dismiss();
      if (searchInputRef.current) {
        searchInputRef.current.blur();
      }
    }}>
      <View style={styles.modalContainer}>
        <View style={styles.header}>
          <Text style={styles.floorName}>
            {buildingInfo.floors[currentFloorIndex].floorName}
          </Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={() => changeFloor('down')}
              disabled={currentFloorIndex === 0}
              style={styles.floorChanger}
            >
              <Icon name="chevron-down" size={24} color={currentFloorIndex === 0 ? '#ccc' : '#fff'} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => changeFloor('up')}
              disabled={currentFloorIndex === buildingInfo.floors.length - 1}
              style={styles.floorChanger}
            >
              <Icon name="chevron-up" size={24} color={currentFloorIndex === buildingInfo.floors.length - 1 ? '#ccc' : '#fff'} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={closeIndoorNavigation}
            style={styles.closeButton}
          >
            <Text style={styles.closeButtonText}>✖</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          ref={searchInputRef}
          style={styles.searchInput}
          placeholder="Search Room"
          placeholderTextColor="#ccc"
        />
        <View style={styles.indoorContainer}>
          {currentFloorIndex === 0 ? (
            <>
              <Hall8 width="120%" height="120%" fill="black" preserveAspectRatio="xMidYMid meet" />

              {showStairsMarkers && (
                <Svg
                  width="700"
                  height="400"
                  viewBox="0 0 700 800"
                  style={{ position: 'absolute', top: -110, left: -192 }}
                >
                  {stairsLocations[currentFloorIndex].map(stair => (
                    <Rect
                      key={stair.id}
                      x={stair.x}
                      y={stair.y}
                      width="45"
                      height="60"
                      fill="#00ff00"
                      opacity={0.5}
                    />
                  ))}
                </Svg>
              )}
              {showElevatorMarkers && (
                <Svg
                  width="500"
                  height="500"
                  viewBox="0 0 700 800"
                  style={{ position: 'absolute', top: -40 }}
                >
                  {elevatorLocations[currentFloorIndex].map(elevator => (
                    <Rect
                      key={elevator.id}
                      x={elevator.x}
                      y={elevator.y}
                      width="40"
                      height="22"
                      fill="#0000ff"
                      opacity={0.5}
                    />
                  ))}
                </Svg>
              )}
            </>
          ) : currentFloorIndex === 1 ? (
            <Hall9 width="120%" height="120%" fill="black" preserveAspectRatio="xMidYMid meet" />
          ) : null}
        </View>
        <View style={styles.poiButtons}>
          {/* Toggle for highlighting washrooms. Currently no washrooms tagged in this building*/}
          <TouchableOpacity style={styles.poiButton}>
            <MaterialIcons name="wc" size={20} color="#fff" />
          </TouchableOpacity>

          {/* Toggle for highlighting elevators */}
          <TouchableOpacity
            style={styles.poiButton}
            onPress={() => handleToggle('elevators')}
          >
            <MaterialIcons
              name="elevator"
              size={24}
              color={showElevatorMarkers ? 'purple' : '#fff'}
            />
          </TouchableOpacity>

          {/* Toggle for highlighting stairs */}
          <TouchableOpacity
            style={styles.poiButton}
            onPress={() => handleToggle('stairs')}
          >
            <MaterialIcons
              name="stairs"
              size={24}
              color={showStairsMarkers ? 'green' : '#fff'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleToggle('accessibility')}
            style={[styles.accessibilityButton, isAccessibilityEnabled && styles.accessibilityEnabled]}
          >
            <MaterialIcons name="accessible" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 20,
  },
  closeButtonText: {
    color: 'darkred',
    fontSize: 24,
    flex: 1,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
    position: 'relative',
  },
  floorName: {
    color: '#fff',
    fontSize: 24,
    flex: 1,
    textAlign: 'left',
  },
  buttonContainer: {
    position: 'absolute',
    top: 0,
    left: 135,
    flexDirection: 'row',
  },
  floorChanger: {
    marginHorizontal: 10,
    alignItems: 'center',
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    paddingHorizontal: 10,
    color: '#fff',
    width: '100%',
  },
  indoorContainer: {
    width: '100%',
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  poiButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    width: '100%',
  },
  poiButton: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#444',
    borderRadius: 5,
  },
  accessibilityButton: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#444',
    borderRadius: 5,
  },
  accessibilityEnabled: {
    backgroundColor: '#4CAF50',
  },
});

export default IndoorNavigationModal;
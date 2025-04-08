import { View, Text, TouchableOpacity, StyleSheet, TextInput, TouchableWithoutFeedback, Keyboard } from "react-native";
import { Svg, Rect, Path } from 'react-native-svg';
import React, { useState, useEffect } from "react";
import Hall8 from "../data/svgFloorMaps/Annotated-Hall-8.svg";
import Hall9 from "../data/svgFloorMaps/Hall-9.svg";
import PathH813ToH845Hall8 from '../data/svgFloorMaps/Path-H813-to-H845-Hall-8.svg';
import PathH813ToHall9Stairs from '../data/svgFloorMaps/PathH813ToHall9-Stairs.svg';
import PathH813ToHall9Elevator from '../data/svgFloorMaps/PathH813ToHall9-Elevator.svg';
import PathH813ToHall9StairsNextFloor from '../data/svgFloorMaps/PathH813ToHall9-Stairs-NextFloor.svg';
import PathH813ToHall9ElevatorNextFloor from '../data/svgFloorMaps/PathH813ToHall9-Elevator-NextFloor.svg';
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

const toggleStrategies = {
  stairs: (currentState: boolean) => !currentState,
  elevators: (currentState: boolean) => !currentState,
  accessibility: (currentState: boolean) => !currentState,
};

// Graph structure for Hall 8 navigation
const hall8Graph = {
  nodes: {
    'H813': { x: 100, y: 150 },
    'H845': { x: 300, y: 250 },
    'waypoint1': { x: 200, y: 200 }
  },
  edges: [
    { from: 'H813', to: 'waypoint1', weight: 50 },
    { from: 'waypoint1', to: 'H845', weight: 60 }
  ]
};

function calculateShortestPath(graph: typeof hall8Graph, start: string, end: string): Array<string> {
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const queue: Array<{ node: string; distance: number }> = [];

  Object.keys(graph.nodes).forEach(node => {
    distances[node] = Infinity;
    previous[node] = null;
  });

  distances[start] = 0;
  queue.push({ node: start, distance: 0 });

  while (queue.length > 0) {
    queue.sort((a, b) => a.distance - b.distance);
    const { node } = queue.shift()!;

    if (node === end) break;

    graph.edges.forEach(edge => {
      if (edge.from !== node) return;

      const distance = distances[node] + edge.weight;
      if (distance < distances[edge.to]) {
        distances[edge.to] = distance;
        previous[edge.to] = node;
        queue.push({ node: edge.to, distance });
      }
    });
  }

  // Reconstruct path
  const path: Array<string> = [];
  let currentNode: string | null = end;

  while (currentNode !== null) {
    path.unshift(currentNode);
    currentNode = previous[currentNode];
  }

  return path;
}

const IndoorNavigationModal: React.FC<IndoorNavigationModalProps> = ({
  buildingInfo,
  currentFloorIndex,
  closeIndoorNavigation,
  changeFloor,
}) => {
  const [isAccessibilityEnabled, setAccessibilityEnabled] = useState(false);
  const [showStairsMarkers, setShowStairsMarkers] = useState(false);
  const [showElevatorMarkers, setShowElevatorMarkers] = useState(false);
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [showPath, setShowPath] = useState(false);
  const [pathCoordinates, setPathCoordinates] = useState<Array<{ x: number; y: number }>>([]);

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

  const showMultifloorPath = () => {
    const startRoom = startLocation.toLowerCase();
    const endRoom = endLocation.toLowerCase();
    if (startRoom === 'h-813' && endRoom === 'h-927') {
      setShowPath(true);
    }
  };

  const showUnifloorPath = () => {
    const startRoom = startLocation.toLowerCase();
    const endRoom = endLocation.toLowerCase();
    if (startRoom === 'h-813' && endRoom === 'h-845') {
      setShowPath(true);
      const path = calculateShortestPath(hall8Graph, 'H813', 'H845');
      const coords = path.map(node => ({
        x: hall8Graph.nodes[node].x,
        y: hall8Graph.nodes[node].y
      }));
      setPathCoordinates(coords);
    }
  };

  const resetToHallMap = () => {
    setShowPath(false);
    setStartLocation('');
    setEndLocation('');
  };

  const renderNavigationButton = () => {
    // Only show navigation buttons during multifloor paths
    const isMultifloorPath =
      ((startLocation.toLowerCase() === 'h-813' && endLocation.toLowerCase().startsWith('h-9')) ||
        (endLocation.toLowerCase() === 'h-813' && startLocation.toLowerCase().startsWith('h-9')));

    if (!showPath || !isMultifloorPath) return null;

    // Define separate button props for stairs and elevator
    const stairsButtonProps = {
      style: {
        position: 'absolute',
        right: 95,
        bottom: 300,
        zIndex: 1000,
        padding: 8,
        borderRadius: 4,
        backgroundColor: isAccessibilityEnabled ?  '#4B0082': '#4CAF50',
      },
    };

    const elevatorButtonProps = {
      style: {
        position: 'absolute',
        right: 224,
        bottom: 290,
        zIndex: 1000,
        padding: 5,
        borderRadius: 4,
        backgroundColor: isAccessibilityEnabled ? '#4B0082': '#4CAF50',
      },
    };

    return (
      <TouchableOpacity
        {...(isAccessibilityEnabled ? elevatorButtonProps : stairsButtonProps)}
        onPress={() => changeFloor('up')}
      >
        <Icon
          name="chevron-up"
          size={10}
          color="white"
        />
      </TouchableOpacity>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
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

        <View style={styles.locationInputsRow}>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.inputField}
              placeholder="Start Room"
              value={startLocation}
              onChangeText={setStartLocation}
              placeholderTextColor="#ccc"
            />
          </View>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.inputField}
              placeholder="End Room"
              value={endLocation}
              onChangeText={setEndLocation}
              placeholderTextColor="#ccc"
            />
          </View>
          <TouchableOpacity
            style={styles.findPathButton}
            onPress={() => {
              showMultifloorPath();
              showUnifloorPath();
            }}
          >
            <Icon name="arrow-right" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={resetToHallMap}
          >
            <Icon name="rotate-left" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.indoorContainer}>
          {currentFloorIndex === 0 ? (
            showPath ? (
              startLocation.toLowerCase() === 'h-813' && endLocation.toLowerCase() === 'h-845' ? (
                <PathH813ToH845Hall8 width="120%" height="120%" fill="black" preserveAspectRatio="xMidYMid meet" />
              ) : isAccessibilityEnabled ? (
                <PathH813ToHall9Elevator width="120%" height="120%" fill="black" preserveAspectRatio="xMidYMid meet" />
              ) : (
                <PathH813ToHall9Stairs width="120%" height="120%" fill="black" preserveAspectRatio="xMidYMid meet" />
              )
            ) : (
              <Hall8 width="120%" height="120%" fill="black" preserveAspectRatio="xMidYMid meet" />
            )
          ) : currentFloorIndex === 1 ? (
            showPath ? (
              isAccessibilityEnabled ? (
                <PathH813ToHall9ElevatorNextFloor width="120%" height="120%" fill="black" preserveAspectRatio="xMidYMid meet" />
              ) : (
                <PathH813ToHall9StairsNextFloor width="120%" height="120%" fill="black" preserveAspectRatio="xMidYMid meet" />
              )
            ) : (
              <Hall9 width="120%" height="120%" fill="black" preserveAspectRatio="xMidYMid meet" />
            )
          ) : null}

          {/* Markers for Stairs and Elevators */}
          {showStairsMarkers && (
            <Svg width="700" height="400" viewBox="0 0 700 800" style={{ position: 'absolute', top: -110, left: -192 }}>
              {stairsLocations[currentFloorIndex].map((stair) => (
                <Rect key={stair.id} x={stair.x} y={stair.y} width="45" height="60" fill="#00ff00" opacity={0.5} />
              ))}
            </Svg>
          )}

          {showElevatorMarkers && (
            <Svg width="500" height="500" viewBox="0 0 700 800" style={{ position: 'absolute', top: -40 }}>
              {elevatorLocations[currentFloorIndex].map((elevator) => (
                <Rect key={elevator.id} x={elevator.x} y={elevator.y} width="40" height="22" fill="#0000ff" opacity={0.5} />
              ))}
            </Svg>
          )}
        </View>

        {renderNavigationButton()}

        <View style={styles.poiButtons}>
          <TouchableOpacity style={styles.poiButton}>
            <MaterialIcons name="wc" size={20} color="#fff" />
          </TouchableOpacity>

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
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    height: 525,
    backgroundColor: 'rgba(0, 0, 0, 0.93)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    zIndex: 1000,
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
  locationInputsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  inputBox: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: '#333',
    padding: 5,
    borderRadius: 5,
  },
  inputField: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    color: '#fff',
  },
  findPathButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 5,
    width: 50,
  },
  resetButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 5,
    width: 50,
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
    backgroundColor: 'lightblue',
  },
});

export default IndoorNavigationModal;

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

    
        
          
    

        
        Expand All
    
    @@ -19,17 +26,37 @@ const IndoorNavigationModal: React.FC<IndoorNavigationModalProps> = ({
  
  closeIndoorNavigation: () => void;
  changeFloor: (direction: 'up' | 'down') => void;
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

  const toggleAccessibility = () => {
    setAccessibilityEnabled(!isAccessibilityEnabled);
  };

  return (
    <TouchableWithoutFeedback onPress={() => {
      Keyboard.dismiss();
      if (searchInputRef.current) {
        searchInputRef.current.blur();
      }
    }}>
      <View style={styles.modalContainer}>

    
          
            
    

          
          Expand Down
          
            
    

          
          Expand Up
    
    @@ -61,14 +88,14 @@ const IndoorNavigationModal: React.FC<IndoorNavigationModalProps> = ({
  
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
              <Hall8 width="120%" height="120%" fill="black" preserveAspectRatio="xMidYMid meet" />
          ) : currentFloorIndex === 1 ? (
            <Hall9 width="120%" height="120%" fill="black" preserveAspectRatio="xMidYMid meet" />
          ) : null}

    
          
            
    

          
          Expand Down
    
    
  
        </View>
        <View style={styles.poiButtons}>
          <TouchableOpacity style={styles.poiButton}>
            <MaterialIcons name="wc" size={20}  color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.poiButton}>
            <MaterialIcons name="elevator" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.poiButton}>
            <MaterialIcons name="stairs" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={toggleAccessibility}
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
    left:135,
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
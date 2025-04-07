import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { TransportationMode } from '@/models/Route';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

// Define the structure for route instruction
interface RouteInstruction {
  id: string;
  text: string;
  distance: number;
  duration: number;
  icon: string;
  mode: TransportationMode;
}

interface RouteInstructionsProps {
  route: any; // Using 'any' type until we have the complete route structure
  onClose: () => void;
}

// Helper function to format distance
const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${meters} m`;
  } else {
    return `${(meters / 1000).toFixed(1)} km`;
  }
};

// Helper function to format duration
const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours} hr ${remainingMinutes} min` : `${hours} hr`;
  }
};

// Mock function to generate instructions based on route segments
// In a real implementation, this would use the actual route data
const generateInstructions = (route: any): RouteInstruction[] => {
  // For demo purposes, creating sample instructions
  // In a real implementation, this would parse the route segments
  const sampleInstructions: RouteInstruction[] = [
    {
      id: '1',
      text: 'Start walking from your current location',
      distance: 0,
      duration: 0,
      icon: 'directions-walk',
      mode: TransportationMode.WALKING
    },
    {
      id: '2',
      text: 'Head north on Mackay Street',
      distance: 150,
      duration: 2,
      icon: 'directions-walk',
      mode: TransportationMode.WALKING
    },
    {
      id: '3',
      text: 'Turn right onto Sherbrooke Street West',
      distance: 300,
      duration: 3,
      icon: 'directions-walk',
      mode: TransportationMode.WALKING
    }
  ];
  
  // Check if route includes using the shuttle bus
  // If route starts from SGW campus to Loyola or vice versa
  const startPoint = route?.segmentIds?.[0]?.startPoint;
  const endPoint = route?.segmentIds?.[0]?.endPoint;
  
  // This is a simplified check - in a real implementation, 
  // you would check actual campus coordinates
  const isCrossCampus = 
    (startPoint?.latitude < 45.49 && endPoint?.latitude > 45.49) || 
    (startPoint?.latitude > 45.49 && endPoint?.latitude < 45.49);
  
  if (isCrossCampus) {
    sampleInstructions.push({
      id: '4',
      text: 'Walk to the shuttle stop at Concordia Hall Building',
      distance: 200,
      duration: 3,
      icon: 'directions-walk',
      mode: TransportationMode.WALKING
    });
    sampleInstructions.push({
      id: '5',
      text: 'Board the Concordia Shuttle Bus',
      distance: 7500,
      duration: 25,
      icon: 'directions-bus',
      mode: TransportationMode.BUS
    });
    sampleInstructions.push({
      id: '6',
      text: 'Get off at Loyola Campus stop',
      distance: 0,
      duration: 0,
      icon: 'directions-bus',
      mode: TransportationMode.BUS
    });
    sampleInstructions.push({
      id: '7',
      text: 'Walk to your destination',
      distance: 250,
      duration: 3,
      icon: 'directions-walk',
      mode: TransportationMode.WALKING
    });
  } else {
    sampleInstructions.push({
      id: '4',
      text: 'Arrive at your destination',
      distance: 0,
      duration: 0,
      icon: 'place',
      mode: TransportationMode.WALKING
    });
  }
  
  return sampleInstructions;
};

// Get the appropriate icon for each transportation mode
const getTransportIcon = (mode: TransportationMode, iconName: string) => {
  switch (mode) {
    case TransportationMode.BUS:
      return <MaterialIcons name="directions-bus" size={24} color="#800000" />;
    case TransportationMode.WALKING:
      return <MaterialIcons name={iconName} size={24} color="#800000" />;
    case TransportationMode.WHEELCHAIR:
      return <FontAwesome5 name="wheelchair" size={22} color="#800000" />;
    default:
      return <MaterialIcons name={iconName} size={24} color="#800000" />;
  }
};

// Calculate total distance and duration
const calculateTotals = (instructions: RouteInstruction[]) => {
  return instructions.reduce(
    (acc, instruction) => {
      return {
        totalDistance: acc.totalDistance + instruction.distance,
        totalDuration: acc.totalDuration + instruction.duration
      };
    },
    { totalDistance: 0, totalDuration: 0 }
  );
};

const RouteInstructions: React.FC<RouteInstructionsProps> = ({ route, onClose }) => {
  const instructions = generateInstructions(route);
  const { totalDistance, totalDuration } = calculateTotals(instructions);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Route Details</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <MaterialIcons name="close" size={24} color="#800000" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>
          Total: {formatDistance(totalDistance)} • {formatDuration(totalDuration)}
        </Text>
      </View>

      <FlatList
        data={instructions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.instructionItem}>
            <View style={styles.iconContainer}>
              {getTransportIcon(item.mode, item.icon)}
            </View>
            <View style={styles.instructionTextContainer}>
              <Text style={styles.instructionText}>{item.text}</Text>
              {(item.distance > 0 || item.duration > 0) && (
                <Text style={styles.instructionDetails}>
                  {item.distance > 0 ? formatDistance(item.distance) : ''}
                  {item.distance > 0 && item.duration > 0 ? ' • ' : ''}
                  {item.duration > 0 ? formatDuration(item.duration) : ''}
                </Text>
              )}
            </View>
          </View>
        )}
        style={styles.list}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#800000',
  },
  closeButton: {
    padding: 4,
  },
  summaryContainer: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  summaryText: {
    fontSize: 16,
    color: '#333',
  },
  list: {
    flex: 1,
  },
  instructionItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  iconContainer: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginRight: 12,
  },
  instructionTextContainer: {
    flex: 1,
  },
  instructionText: {
    fontSize: 16,
    marginBottom: 4,
    color: '#333',
  },
  instructionDetails: {
    fontSize: 14,
    color: '#666',
  },
});

export default RouteInstructions;
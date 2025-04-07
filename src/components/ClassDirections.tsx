import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

interface ClassDirectionsProps {
  directions: any[];
  eta: string;
  onClose: () => void;
}

const ClassDirections: React.FC<ClassDirectionsProps> = ({ directions, eta, onClose }) => {

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Route Details</Text>
        <TouchableOpacity
          onPress={onClose}
          style={styles.closeButton}
          accessibilityLabel="Close route details"
          accessibilityRole="button"
        >
          <MaterialIcons name="close" size={24} color="#800000" />
        </TouchableOpacity>
      </View>

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>
          Arrival by: {eta} 
        </Text>
      </View>

      <FlatList
        data={directions}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.instructionItem}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="directions-walk" size={24} color="#800000" />
            </View>
            <View style={styles.instructionTextContainer}>
              <Text style={styles.instructionText}>
                {item.html_instructions?.replace(/<[^>]+>/g, '') || item.instruction || 'Step'}
              </Text>
              <Text style={styles.instructionDetails}>
                {item.distance?.text || ''}
              </Text>
            </View>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 40 }}
        style={styles.list}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    zIndex: 999,
    elevation: 10,
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
    color: '#800000'
  },
  closeButton: {
    padding: 4
  },
  summaryContainer: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  summaryText: {
    fontSize: 16,
    color: '#333'
  },
  list: {
    flex: 1
  },
  instructionItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  iconContainer: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginRight: 12
  },
  instructionTextContainer: {
    flex: 1
  },
  instructionText: {
    fontSize: 16,
    marginBottom: 4,
    color: '#333'
  },
  instructionDetails: {
    fontSize: 14,
    color: '#666'
  }
});

export default ClassDirections;


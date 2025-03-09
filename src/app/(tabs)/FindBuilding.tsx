// export default FindBuilding;
import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import buildingsData from "../../data/hardcodedBuildings.json"; //

// Define TypeScript type for building objects
type Building = {
  _id: string;
  campus: string;
  name: string;
  BuildingLongName: string;
  description: string;
  address: string;
  polygonShape: number[][] | string;
  outdoorLocation: null | string;
  openingHours: string;
  createdAtUTC: string;
  updatedAtUTC: string;
};

// Ensure `buildingsData` is recognized as an array of `Building` objects
const buildings: Building[] = buildingsData;

const FindBuilding = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredBuildings, setFilteredBuildings] = useState<Building[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Simulate loading buildings data
    setTimeout(() => {
      setFilteredBuildings(buildings);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (query.trim() === "") {
      setFilteredBuildings(buildings);
      return;
    }

    const lowerQuery = query.toLowerCase();

    // Filter buildings by name, campus, or address
    const filtered = buildings.filter(
      (building) =>
        building.name.toLowerCase().includes(lowerQuery) ||
        building.campus.toLowerCase().includes(lowerQuery) ||
        building.address.toLowerCase().includes(lowerQuery)
    );

    setFilteredBuildings(filtered);
  };

  const renderBuildingItem = ({ item }: { item: Building }) => (
    <TouchableOpacity
      testID={`building-item-${item._id}`}
      style={styles.searchItem}
      activeOpacity={0.7}
      onPress={() => console.log("Selected Building:", item)}
    >
      <MaterialCommunityIcons
        name="office-building"
        size={24}
        color="#800000"
        style={styles.buildingIcon}
      />
      <View style={styles.searchTextContainer}>
        <Text testID={`building-item-${item._id}`} style={styles.buildingName}>
          {item.name}
        </Text>
        <Text
          testID={`building-item-${item._id}`}
          style={styles.buildingDetails}
        >
          {item.description}
        </Text>
        <Text
          testID={`building-item-${item._id}`}
          style={styles.buildingCampus}
        >
          Campus: {item.campus}
        </Text>
        <Text
          testID={`building-item-${item._id}`}
          style={styles.buildingAddress}
        >
          Address: {item.address}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#800000" />
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#800000" />
        <Text style={styles.loadingText}>Loading buildings...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#800000"
          style={styles.searchIcon}
        />
        <TextInput
          testID="search-input"
          style={styles.searchBar}
          placeholder="Search for a building..."
          placeholderTextColor="#BBB"
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {/* Display Filtered Results */}
      <View style={styles.popularContainer}>
        <Text style={styles.popularTitle}>Search Results</Text>
        {filteredBuildings.length > 0 ? (
          <FlatList
            data={filteredBuildings}
            keyExtractor={(item) => item._id.toString()} // Ensure `_id` is a valid key
            renderItem={renderBuildingItem}
            contentContainerStyle={styles.listContainer}
          />
        ) : (
          <Text style={styles.noResultsText}>No buildings found.</Text>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "#F8F8F8",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#800000",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#FFC107",
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginTop: -20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchBar: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: "#333",
  },
  popularContainer: {
    width: "90%",
    marginTop: 10,
  },
  popularTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  searchItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  searchTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  buildingName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  buildingDetails: {
    fontSize: 12,
    color: "#666",
  },
  buildingCampus: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  buildingAddress: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  buildingIcon: {
    marginRight: 10,
  },
  noResultsText: {
    fontSize: 16,
    color: "#800000",
    textAlign: "center",
    marginTop: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
});

export default FindBuilding;

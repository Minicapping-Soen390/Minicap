// export default FindBuilding;
import React, { useState, useEffect } from "react";
import { View, TextInput, Text, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { globalStyles } from "../styles/globalStyles";
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
    const filtered = buildings.filter((building) =>
      building.name.toLowerCase().includes(lowerQuery) ||
      building.campus.toLowerCase().includes(lowerQuery) ||
      building.address.toLowerCase().includes(lowerQuery)
    );

    setFilteredBuildings(filtered);
  };

  const renderBuildingItem = ({ item }: { item: Building }) => (
    <TouchableOpacity
      style={globalStyles.searchItem}
      activeOpacity={0.7}
      onPress={() => console.log("Selected Building:", item)}
    >
      <MaterialCommunityIcons name="office-building" /*size={24} color="#800000"*/ style={globalStyles.buildingIcon} />
      <View style={globalStyles.searchTextContainer}>
        <Text style={globalStyles.buildingName}>{item.name}</Text>
        <Text style={globalStyles.buildingDetails}>{item.description}</Text>
        <Text style={globalStyles.buildingCampus}>Campus: {item.campus}</Text>
        <Text style={globalStyles.buildingAddress}>Address: {item.address}</Text>
      </View>
      <Ionicons name="chevron-forward" /*size={24} color="#800000"*/ />
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={globalStyles.loadingContainer}>
        <ActivityIndicator /*size="large" color="#800000"*/ />
        <Text style={globalStyles.loadingText}>Loading buildings...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={globalStyles.searchPageContainer}>
      {/* Search Bar */}
      <View style={globalStyles.searchContainer}>
        <Ionicons name="search" /*size={20} color="#800000"*/ style={globalStyles.searchIcon} />
        <TextInput
          style={globalStyles.searchBar}
          placeholder="Search for a building..."
          placeholderTextColor="#BBB"
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {/* Display Filtered Results */}
      <View style={globalStyles.popularContainer}>
        <Text style={globalStyles.popularTitle}>Search Results</Text>
        {filteredBuildings.length > 0 ? (
          <FlatList
            data={filteredBuildings}
            keyExtractor={(item) => item._id.toString()} // Ensure `_id` is a valid key
            renderItem={renderBuildingItem}
            contentContainerStyle={globalStyles.listContainer}
          />
        ) : (
          <Text style={globalStyles.noResultsText}>No buildings found.</Text>
        )}
      </View>
    </SafeAreaView>
  );
};

export default FindBuilding;
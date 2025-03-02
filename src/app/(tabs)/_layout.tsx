import { Link, Tabs } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { useState } from "react";
import Loader from "../../components/Loader";
import { icons, images } from "../../constants";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

// Define TypeScript types for props
type TabIconProps = {
  icon: any;
  color: string;
  name: string;
  focused: boolean;
};

const TabIcon: React.FC<TabIconProps> = ({ icon, color, name, focused }) => {
  return (
    <SafeAreaView style={{ alignItems: "center", justifyContent: "center" }}>
      <Image
        source={icon}
        resizeMode="contain"
        style={{ width: 24, height: 35, tintColor: color }}
      />
      <Text
        style={{
          fontFamily: focused ? "Poppins-SemiBold" : "Poppins-Regular",
          fontSize: 10,
          color: color,
        }}
      >
        {name}
      </Text>
    </SafeAreaView>
  );
};

const TabLayout = () => {
  const [loading, setLoading] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false); // Toggle settings menu

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      {/* Top Navigation Bar */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 10,
          backgroundColor: "#fff",
          zIndex: 10, // Ensure it stays above other content
        }}
      >
        {/* Concordia Logo */}
        <Image
          source={images.ConcordiaLOGO}
          resizeMode="contain"
          style={{ width: 250, height: 60 }}
        />

        {/* Menu Container */}
        <View>
          {/* Settings Button (Hamburger Menu) */}
          <TouchableOpacity
            testID="hamburger-menu"
            onPress={() => setMenuVisible(!menuVisible)}
            style={{ padding: 10 }}
          >
            <Image
              source={icons.Hamburger}
              resizeMode="contain"
              style={{ width: 30, height: 30 }}
            />
          </TouchableOpacity>

          {/* Dropdown Menu for Settings */}
          {menuVisible && (
            <View
              testID="settings-menu"
              style={{
                position: "absolute",
                top: 40, //  Moves dropdown below the icon
                right: 0, //  Aligns dropdown to right
                backgroundColor: "#FFFFFF",
                paddingVertical: 10,
                paddingHorizontal: 20, //  Adds horizontal spacing
                borderRadius: 5,
                elevation: 5, //  Android shadow
                shadowColor: "#000", //  iOS shadow
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                minWidth: 150, //  Makes dropdown wider
              }}
            >
              <Link
                href="/ClassSchedule"
                style={{ paddingVertical: 8, fontSize: 16, color: "#000" }}
              >
                Class Schedule
              </Link>
              <Link
                href="/pages/Loyola"
                style={{ paddingVertical: 8, fontSize: 16, color: "#000" }}
              >
                Loyola Campus
              </Link>
              <Link
                href="/pages/SGW"
                style={{ paddingVertical: 8, fontSize: 16, color: "#000" }}
              >
                SGW Campus
              </Link>
              <Link
                href="/pages/Login"
                style={{ paddingVertical: 8, fontSize: 16, color: "#000" }}
              >
                Log In (optional)
              </Link>
            </View>
          )}
        </View>
      </View>

      {/* Main Content (Ensure Tabs are Not Cut Off) */}
      <View testID="tabs-container" style={{ flex: 1 }}>
        <Tabs
          initialRouteName="Home"
          screenOptions={{
            tabBarActiveTintColor: "#FFA001",
            tabBarInactiveTintColor: "#CDCDE0",
            tabBarShowLabel: true,
            tabBarStyle: {
              borderTopWidth: 1,
              borderTopColor: "#232533",
              height: 80,
              paddingHorizontal: 10,
              paddingBottom: 10,
            },
            tabBarItemStyle: {
              paddingVertical: 5,
              flex: 1,
            },
          }}
        >
          <Tabs.Screen
            name="Home"
            options={{
              title: "Home",
              headerShown: false,
              tabBarIcon: ({ color, focused }) => (
                <TabIcon
                  icon={icons.home}
                  color={color}
                  name=""
                  focused={focused}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="CampusMap"
            options={{
              title: "Campus Map",
              headerShown: false,
              tabBarIcon: ({ color, focused }) => (
                <TabIcon
                  icon={icons.Campus}
                  color={color}
                  name=""
                  focused={focused}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="ClassSchedule"
            options={{
              title: "Class Schedule",
              headerShown: false,
              tabBarIcon: ({ color, focused }) => (
                <TabIcon
                  icon={icons.Calendar}
                  color={color}
                  name=""
                  focused={focused}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="FindBuilding"
            options={{
              title: "Find Building",
              headerShown: false,
              tabBarIcon: ({ color, focused }) => (
                <TabIcon
                  icon={icons.searchBuilding}
                  color={color}
                  name=""
                  focused={focused}
                />
              ),
            }}
          />
        </Tabs>
      </View>

      {loading && <Loader isLoading={loading} />}
    </SafeAreaView>
  );
};

export default TabLayout;

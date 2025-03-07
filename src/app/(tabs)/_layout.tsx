import { Link, Tabs, usePathname } from "expo-router";
import { Image, Text, TouchableOpacity, View, TouchableWithoutFeedback } from "react-native";
import { useState } from "react";
import Loader from "../../components/Loader";
import { icons, images } from "../../constants";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { globalStyles } from "../styles/globalStyles";

const TabIcon = ({ icon, name, isOpen, focused }: { icon: any, name?: string, isOpen?: boolean, focused: boolean }) => {
  const isActive = isOpen || focused;

  return (
    <SafeAreaView style={globalStyles.footerContainer}>
      <Image
        source={icon}
        resizeMode="contain"
        style={isActive ? globalStyles.tabIconsFocused : globalStyles.tabIcons}
      />
      <Text style={isActive ? globalStyles.tabTextFocused : globalStyles.tabText}>
        {name}
      </Text>
    </SafeAreaView>
  );
};

const TabLayout = () => {
  const [loading, setLoading] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const pathname = usePathname();
  const showHeader = true;

  const closeMenu = () => {
    if (menuVisible) setMenuVisible(false);
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      {showHeader && (
        <View style={globalStyles.header}>
          <Image
            source={images.Concordia_Small_Logo}
            resizeMode="contain"
            style={globalStyles.logo}
          />
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={globalStyles.appName}>APP NAME</Text>
          </View>
        </View>
      )}

      {/* Main Content */}
      <View style={globalStyles.container}>
        <Tabs initialRouteName="CampusMap" screenOptions={globalStyles.screenOptions}>
          <Tabs.Screen
            name="CampusMap"
            options={{
              title: "Campus Map",
              headerShown: false,
              tabBarIcon: ({ focused }) => <TabIcon icon={icons.Campus} focused={focused} />,
            }}
          />
          <Tabs.Screen
            name="ClassSchedule"
            options={{
              title: "Calendar",
              headerShown: false,
              tabBarIcon: ({ focused }) => <TabIcon icon={icons.Calendar} focused={focused} />,
            }}
          />
          <Tabs.Screen
            name="FindBuilding"
            options={{
              title: "Search",
              headerShown: false,
              tabBarIcon: ({ focused }) => <TabIcon icon={icons.search} focused={focused} />,
            }}
          />
          <Tabs.Screen
            name="Home"
            listeners={{
              tabPress: (e) => {
                e.preventDefault(); // Prevent navigation
                setMenuVisible(!menuVisible);
              },
            }}
            options={{
              title: "Menu",
              headerShown: false,
              tabBarIcon: () => <TabIcon icon={icons.Hamburger} focused={menuVisible} />,
            }}
          />
        </Tabs>

        {/* Popup Menu */}
        {menuVisible && (
          <TouchableWithoutFeedback onPress={closeMenu}>
            <View style={globalStyles.overlay}>
              <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                <View style={globalStyles.menu}>
                  <Link href="/pages/Login" style={globalStyles.menuContent}>
                    Log In (optional)
                  </Link>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        )}
      </View>

      {loading && <Loader isLoading={loading} />}
    </SafeAreaView>
  );
};

export default TabLayout;

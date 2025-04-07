import React, { useState } from "react";
import { Image, Text, View, TouchableWithoutFeedback } from "react-native";
import { Link, Tabs, usePathname } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Loader from "../../components/Loader";
import { icons, images } from "../../constants";
import { globalStyles } from "../styles/globalStyles";

/**
 * Renders tab icon with optional label
 */
const TabIcon = ({
  icon,
  name,
  isOpen,
  focused,
}: {
  icon: any;
  name?: string;
  isOpen?: boolean;
  focused: boolean;
}) => {
  const isActive = isOpen || focused;

  return (
    <View style={globalStyles.tabIconWrapper}>
      <Image
        source={icon}
        resizeMode="contain"
        style={isActive ? globalStyles.tabIconsFocused : globalStyles.tabIcons}
      />
      {name && (
        <View style={{ height: 22, justifyContent: "center" }}>
          <Text
            numberOfLines={1}
            style={
              isActive ? globalStyles.tabTextFocused : globalStyles.tabText
            }
          >
            {name}
          </Text>
        </View>
      )}
    </View>
  );
};

/**
 * Icon renderer for Campus Map tab
 */
const CampusMapIcon = ({ focused }: { focused: boolean }) => (
  <TabIcon icon={icons.Campus} focused={focused} name="Campus" />
);

/**
 * Icon renderer for Calendar tab
 */
const CalendarIcon = ({ focused }: { focused: boolean }) => (
  <TabIcon icon={icons.Calendar} focused={focused} name="Calendar" />
);

/**
 * Icon renderer for Search tab
 */
const SearchIcon = ({ focused }: { focused: boolean }) => (
  <TabIcon icon={icons.search} focused={focused} name="Search" />
);

/**
 * Icon renderer for Menu tab
 */
const HamburgerIcon = ({ focused }: { focused: boolean }) => (
  <TabIcon icon={icons.Hamburger} focused={focused} name="Menu" />
);

/**
 * Creates menu tab icon with visibility state
 */
const MenuTabIcon = (menuVisible: boolean) => () => (
  <HamburgerIcon focused={menuVisible} />
);

/**
 * Main tab layout component
 * Manages tab navigation and menu visibility
 */
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
      {/* Header */}
      {showHeader && (
        <View style={globalStyles.header}>
          <Image
            source={images.Concordia_Small_Logo}
            resizeMode="contain"
            style={globalStyles.logo}
          />
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={globalStyles.appName}>AGORA</Text>
          </View>
        </View>
      )}

      {/* Main Tabs */}
      <Tabs
        initialRouteName="CampusMap"
        screenOptions={globalStyles.screenOptions}
      >
        <Tabs.Screen
          name="CampusMap"
          options={{
            title: "Campus Map",
            headerShown: false,
            tabBarIcon: CampusMapIcon,
          }}
        />
        <Tabs.Screen
          name="ClassSchedule"
          options={{
            title: "Calendar",
            headerShown: false,
            tabBarIcon: CalendarIcon,
          }}
        />
        <Tabs.Screen
          name="FindBuilding"
          options={{
            title: "Search",
            headerShown: false,
            tabBarIcon: SearchIcon,
          }}
        />
        <Tabs.Screen
          name="Home"
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              setMenuVisible(!menuVisible);
            },
          }}
          options={{
            title: "Menu",
            headerShown: false,
            tabBarIcon: MenuTabIcon(menuVisible),
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

      {/* Loader Overlay */}
      {loading && <Loader isLoading={loading} />}
    </SafeAreaView>
  );
};

export default TabLayout;

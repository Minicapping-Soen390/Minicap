import { Link, Tabs, usePathname } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { useState } from "react";
import Loader from "../../components/Loader";
import { icons, images } from "../../constants";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { globalStyles } from "../styles/globalStyles";

const TabIcon = ({ icon, name, focused }) => {
  return (
    <SafeAreaView style={ globalStyles.footerContainer }>
      <Image
        source={icon}
        resizeMode="contain"
        style={ focused ? globalStyles.tabIconsFocused : globalStyles.tabIcons }
      />
      <Text style={ focused ? globalStyles.tabTextFocused : globalStyles.tabText }>
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

  return (
    <SafeAreaView style={ globalStyles.container }>
      {showHeader && (
        <View style={ globalStyles.header }>
          <Image
            source={images.Concordia_Small_Logo}
            resizeMode="contain"
            style={{ width: 50, height: 50 }}
          />
          <Text style={globalStyles.appName}>
              APP NAME
            </Text>
        </View>
      )}

      {/* Main Content */}
      <View style={ globalStyles.container }>
        <Tabs
          initialRouteName="CampusMap"
          screenOptions={ globalStyles.screenOptions }
        >
          <Tabs.Screen
            name="CampusMap"
            options={{
              title: "Campus Map",
              headerShown: false,
              tabBarIcon: ({ focused }) => (
                <TabIcon icon={icons.Campus} focused={focused} />
              ),
            }}
          />
          <Tabs.Screen
            name="ClassSchedule"
            options={{
              title: "Calendar",
              headerShown: false,
              tabBarIcon: ({ focused }) => (
                <TabIcon icon={icons.Calendar} focused={focused} />
              ),
            }}
          />
          <Tabs.Screen
            name="FindBuilding"
            options={{
              title: "Search",
              headerShown: false,
              tabBarIcon: ({ focused }) => (
                <TabIcon icon={icons.search} focused={focused} />
              ),
            }}
          />
          <Tabs.Screen
            name="Home"
            listeners={{
              tabPress: (e) => {
                e.preventDefault(); // prevent navigation
                setMenuVisible(!menuVisible);
              },
            }}
            options={{
              title: "Menu",
              headerShown: false,
              tabBarIcon: ({ focused }) => (
                <TabIcon icon={icons.Hamburger} focused={focused} />
              ),
            }}
          />
        </Tabs>

        {/* Popup Menu */}
        {menuVisible && (
          <View style={ globalStyles.menu }>
            <Link href="/pages/Login" style={ globalStyles.menuContent }>
              Log In (optional)
            </Link>
          </View>
        )}
      </View>

      {loading && <Loader isLoading={loading} />}
    </SafeAreaView>
  );
};

export default TabLayout;

import { StyleSheet } from "react-native";

export const globalStyles = StyleSheet.create({
  appName: {
    fontSize: 36,
    fontWeight: "Poppins-Bold",
    color: "#FFFFFF",
    textAlign: "center",
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "rgba(146, 35, 56, 1)",
    zIndex: 10,
  },
  container: {
    flex: 1,
  },
  switchHeaderContainer: {
    backgroundColor: "rgba(146, 35, 56, 1)",
  },
  campusSwitchHeader: {
    alignItems: "center",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  switchText: {
    color: "#fff",
    fontSize: 16,
    marginHorizontal: 8,
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  buttonContainer: {
    flexDirection: "row",
  },
  iconButton: {
    marginLeft: 10,
    padding: 5,
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  menu: {
    position: "absolute",
    bottom: 90,
    left: "80%",
    transform: [{ translateX: -80 }],
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    minWidth: 150,
  },
menuContent: {
  paddingVertical: 8,
  fontSize: 16,
  color: "#000",
},
  footerContainer:{
    alignItems: "center",
    justifyContent: "center",
  },
  footer:{
    tabBarActiveTintColor: "#FFA001",
    tabBarInactiveTintColor: "#CDCDE0",
    tabBarShowLabel: true,
  },
  screenOptions: {
    tabBarActiveTintColor: "#FFA001",
    tabBarInactiveTintColor: "#CDCDE0",
    tabBarShowLabel: true,
    tabBarStyle: {
      backgroundColor: "rgba(146, 35, 56, 1)",
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
  },
  tabBarStyle: {
    backgroundColor: "rgba(146, 35, 56, 1)",
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
  tabIcons: {
    width: 24,
    height: 35,
    tintColor: "#CDCDE0",
  },
  tabIconsFocused: {
    width: 24,
    height: 35,
    tintColor: "#FFA001",
  },
  tabText: {
    fontSize: 10,
    color: "#CDCDE0",
    fontFamily: "Poppins-Regular",
  },
  tabTextFocused: {
    fontFamily: "Poppins-SemiBold",
    color: "#FFA001",
    fontSize: 10,
  },
});

export const mainEdges = ["left", "right", "bottom"];
export default globalStyles;
import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from "react-native";
import { rem } from "../utils";

const colors = {
  concordiaRed: "#922338",
  white: "#FFFFFF",
  blueSemiTransparent: "#0000ffb3",
  blueMoreTransparent: "#0000ff66",
  black: "#000",
  orange: "#FFA001",
  lightGray: "#CDCDE0",
  darkGrayishBlue: "#232533",
  brightRed: "#ff0000b3",
  darkGray: "#555",
  transparent: "transparent",
};

// View styles
const viewStyles = StyleSheet.create({
  header: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center", // Added to ensure proper centering
    padding: rem(10),
    backgroundColor: colors.concordiaRed,
    zIndex: 10,
    height: rem(70), // Add specific height for proper sizing
  },
  container: {
    flex: 1,
  },
  switchHeaderContainer: {
    backgroundColor: colors.concordiaRed,
  },
  campusSwitchHeader: {
    alignItems: "center",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonContainer: {
    flexDirection: "row",
  },
  iconButton: {
    marginLeft: rem(10),
    padding: rem(5),
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  refreshButton: {
    position: "absolute",
    bottom: rem(20),
    alignSelf: "center",
    backgroundColor: colors.blueSemiTransparent,
    padding: rem(10),
    borderRadius: rem(5),
  },
  refreshButtonDisabled: {
    backgroundColor: colors.blueMoreTransparent,
  },
  addButton: {
    marginTop: 10,
    backgroundColor: colors.concordiaRed,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  menu: {
    position: "absolute",
    bottom: rem(90),
    left: "80%",
    transform: [{ translateX: rem(-80) }],
    backgroundColor: colors.white,
    paddingVertical: rem(10),
    paddingHorizontal: rem(20),
    borderRadius: rem(5),
    elevation: 5,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: rem(2) },
    shadowOpacity: 0.25,
    shadowRadius: rem(3.84),
    minWidth: rem(150),
  },
  footerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  tabBarStyle: {
    backgroundColor: colors.concordiaRed,
    borderTopWidth: rem(1),
    borderTopColor: colors.darkGrayishBlue,
    height: rem(80),
    paddingHorizontal: rem(10),
    paddingBottom: rem(10),
  },
  tabBarItemStyle: {
    paddingVertical: rem(5),
    flex: 1,
  },
  buildingInfoContainer: {
    position: "absolute",
    top: rem(50),
    alignSelf: "center",
    backgroundColor: colors.white,
    padding: rem(15),
    borderRadius: rem(10),
    width: "85%",
    elevation: 5,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: rem(2),
    },
    shadowOpacity: 0.2,
    shadowRadius: rem(4),
    zIndex: 2,
  },
  marker: {
    backgroundColor: colors.transparent,
    justifyContent: "center",
    alignItems: "center",
  },
  buildingButton: {
    width: rem(25),
    height: rem(25),
    backgroundColor: colors.concordiaRed,
    borderRadius: rem(15),
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    position: "absolute",
    top: rem(50),
    left: rem(20),
    right: rem(20),
    backgroundColor: colors.brightRed,
    padding: rem(10),
    borderRadius: rem(5),
    zIndex: 2,
  },
  navigationPopup: {
    position: "absolute",
    bottom: 100,
    left: "10%",
    right: "10%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },

  popupContainer: {
    position: "absolute",
    top: rem(20), // responsive top spacing
    left: "5%",
    right: "5%",
    backgroundColor: "#fff",
    borderRadius: rem(8),
    paddingRight: rem(18),
    paddingLeft: rem(18),
    paddingTop: rem(10),
    paddingBottom: rem(10),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: rem(2) },
    shadowOpacity: 0.3,
    shadowRadius: rem(4),
    elevation: 5,
  },
  popupText: {
    fontSize: rem(16),
    color: "#333",
  },
  popupRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: rem(8),
  },
  greenDot: {
    width: rem(12),
    height: rem(12),
    borderRadius: rem(6),
    backgroundColor: "green",
    marginRight: rem(8),
  },
  goldDot: {
    width: rem(12),
    height: rem(12),
    borderRadius: rem(6),
    backgroundColor: colors.orange,
    marginRight: rem(8),
  },
  closeButton: {
    position: "absolute",
    top: rem(-10),
    left: rem(-10), // positioned at the top left of the popup
    backgroundColor: "#fff",
    borderRadius: rem(12),
    padding: rem(4),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: rem(2) },
    shadowOpacity: 0.3,
    shadowRadius: rem(4),
    elevation: 5,
  },
  closeButtonText: {
    fontSize: rem(14),
    fontWeight: "bold",
    color: "#333",
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginVertical: rem(8),
  },
});

// Text styles
const textStyles = StyleSheet.create({
  appName: {
    fontSize: rem(36),
    fontFamily: "Poppins-Bold",
    color: colors.white,
    textAlign: "center",
    // Remove absolute positioning and flex: 1
  },
  switchText: {
    color: colors.white,
    fontSize: rem(20),
    marginHorizontal: rem(8),
  },
  refreshButtonText: {
    color: colors.white,
    fontSize: rem(16),
    textAlign: "center",
  },
  menuContent: {
    paddingVertical: rem(8),
    fontSize: rem(16),
    color: colors.black,
  },
  tabText: {
    fontSize: rem(30),
    color: colors.lightGray,
    fontFamily: "Poppins-Regular",
  },
  tabTextFocused: {
    fontFamily: "Poppins-SemiBold",
    color: colors.orange,
    fontSize: rem(30),
  },
  buildingNameText: {
    fontWeight: "bold",
    fontSize: rem(20),
    marginBottom: rem(5),
  },
  openingHoursText: {
    fontSize: rem(12),
    color: colors.lightGray,
    marginBottom: rem(5),
  },
  addressText: {
    color: colors.darkGray,
    fontSize: rem(16),
  },
  buildingButtonText: {
    color: colors.white,
    fontSize: rem(10),
    fontWeight: "bold",
  },
  errorText: {
    color: colors.white,
    textAlign: "center",
  },
  navAddressText: {
    fontSize: 16,
    color: colors.black,
    marginBottom: 4,
  },
});

// Image styles
const imageStyles = StyleSheet.create({
  logo: {
    position: "absolute",
    left: rem(16),
    width: rem(50),
    height: rem(50),
    resizeMode: "contain",
    alignSelf: "center", // Add to ensure vertical centering
  },
  tabIcons: {
    width: rem(24),
    height: rem(35),
    tintColor: colors.lightGray,
  },
  tabIconsFocused: {
    width: rem(24),
    height: rem(35),
    tintColor: colors.orange,
  },
});

// Navigation styles (objects, not StyleSheet)
const navigationStyles = {
  footer: {
    tabBarActiveTintColor: colors.orange,
    tabBarInactiveTintColor: colors.lightGray,
    tabBarShowLabel: true,
  },
  screenOptions: {
    tabBarActiveTintColor: colors.orange,
    tabBarInactiveTintColor: colors.lightGray,
    tabBarShowLabel: true,
    tabBarStyle: {
      backgroundColor: colors.concordiaRed,
      borderTopWidth: rem(1),
      borderTopColor: colors.darkGrayishBlue,
      height: rem(80),
      paddingHorizontal: rem(10),
      paddingBottom: rem(10),
    },
    tabBarItemStyle: {
      paddingVertical: rem(5),
      flex: 1,
    },
  },
};

// Export everything together as globalStyles for backward compatibility
export const globalStyles = {
  ...viewStyles,
  ...textStyles,
  ...imageStyles,
  ...navigationStyles,
};

export const mainEdges = ["left", "right", "bottom"];
export default globalStyles;

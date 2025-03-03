import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from "react-native";
import { rem } from "../utils";

const colors = {
  concordiaRed: "#922338",
  white: "#FFFFFF",
  darkerWhite: "#F8F8F8",
  blueSemiTransparent: "#0000ffb3",
  blueMoreTransparent: "#0000ff66",
  black: "#000",
  gold: "#ffc107",
  lightGray: "#CDCDE0",
  darkGrayishBlue: "#232533",
  brightRed: "#ff0000b3",
  darkGray: "#555",
  transparent: "transparent",
};

// View styles
const viewStyles = StyleSheet.create({
  header: {
    position: 'relative',
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
  //Campus Page
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
      width: rem(0),
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
  //Menu
  overlay: {
    position: "absolute",
    top: rem(0),
    left: rem(0),
    right: rem(0),
    bottom: rem(0),
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
    shadowOffset: { width: rem(0), height: rem(2) },
    shadowOpacity: 0.25,
    shadowRadius: rem(3.84),
    minWidth: rem(150),
  },
  //Search Page
  searchPageContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: colors.darkerWhite,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "90%",
    backgroundColor: colors.white,
    borderRadius: rem(25),
    borderWidth: rem(2),
    borderColor: colors.gold,
    paddingHorizontal: rem(15),
    paddingVertical: rem(8),
    marginTop: rem(-20),
    shadowColor: colors.black,
    shadowOffset: { width: rem(0), height: rem(2) },
    shadowOpacity: 0.1,
    shadowRadius: rem(5),
    elevation: 3,
  },
  searchBar: {
    flex: 1,
    height: rem(40),
    fontSize: rem(16),
    color: colors.darkGray,
  },
  popularContainer: {
    width: "90%",
    marginTop: rem(10),
  },
  searchItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    padding: rem(12),
    borderRadius: rem(12),
    marginBottom: rem(10),
    borderWidth: rem(1),
    borderColor: colors.lightGray,
    shadowColor: colors.black,
    shadowOffset: { width: rem(0), height: rem(2) },
    shadowOpacity: 0.1,
    shadowRadius: rem(5),
    elevation: 3,
  },
  searchTextContainer: {
    flex: 1,
    marginLeft: rem(10),
  },
  listContainer: {
    paddingBottom: rem(20),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    color: colors.gold,
    fontSize: rem(30),
  },
  buildingNameText: {
    fontWeight: "bold",
    fontSize: rem(18),
    marginBottom: rem(5),
  },
  openingHoursText: {
    color: colors.lightGray,
    marginBottom: rem(5),
  },
  addressText: {
    color: colors.darkGray,
    fontSize: rem(14),
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
  //Search Page
  loadingText: {
    marginTop: rem(10),
    fontSize: rem(16),
    color: colors.concordiaRed,
  },
  noResultsText: {
    fontSize: rem(16),
    color: colors.concordiaRed,
    textAlign: "center",
    marginTop: rem(20),
  },
  buildingCampus: {
    fontSize: rem(12),
    color: colors.darkGray,
    marginTop: rem(4),
  },
  buildingAddress: {
    fontSize: rem(12),
    color: colors.darkGray,
    marginTop: rem(4),
  },
  buildingName: {
    fontSize: rem(16),
    fontWeight: "bold",
    color: colors.black,
  },
  buildingDetails: {
    fontSize: rem(12),
    color: colors.darkGray,
  },
  popularTitle: {
    fontSize: rem(18),
    fontWeight: "bold",
    marginBottom: rem(10),
  },
});

// Image styles
const imageStyles = StyleSheet.create({
  logo: {
    position: 'absolute',
    left: rem(16),
    width: rem(50),
    height: rem(50),
    resizeMode: "contain",
    alignSelf: "center", // Add to ensure vertical centering
  },
  tabIcons: {
    width: rem(24),
    height: rem(40),
    tintColor: colors.lightGray,
  },
  tabIconsFocused: {
    width: rem(24),
    height: rem(40),
    tintColor: colors.gold,
  },
  //Search Page
  searchPageIonicons: {
    size: rem(24),
    color: colors.concordiaRed,
  },
  buildingIcon: {
    marginRight: rem(10),
    color: colors.concordiaRed,
    fontSize: rem(24),
  },
  searchIcon: {
    marginRight: rem(10),
    color: colors.concordiaRed,
    fontSize: rem(20),
  },
  activityIndicator: {
    size: "large",
    color: colors.concordiaRed,
  }
});

// Navigation styles (objects, not StyleSheet)
const navigationStyles = {
  footer: {
    tabBarActiveTintColor: colors.gold,
    tabBarInactiveTintColor: colors.lightGray,
    tabBarShowLabel: true,
  },
  screenOptions: {
    tabBarActiveTintColor: colors.gold,
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
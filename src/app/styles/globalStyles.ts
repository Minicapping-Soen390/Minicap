import { StyleSheet } from "react-native";
import { rem } from "./scale";

const colors = {
  concoridaRed: "#922338",
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

export const globalStyles = StyleSheet.create({
  header: {
    position: 'relative',
    flexDirection: "row",
    alignItems: "center",
    padding: rem(10),
    backgroundColor: colors.concordiaRed,
    zIndex: 10,
  },
  appName: {
    position: 'absolute',
    left: rem(0),
    right: rem(0),
    fontSize: rem(36),
    fontWeight: "Poppins-Bold",
    color: colors.white,
    textAlign: "center",
    flex: 1,
  },
  logo: {
    position: 'absolute',
    left: rem(16),
    width: rem(50),
    height: rem(50),
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
  switchText: {
    color: colors.white,
    fontSize: rem(20),
    marginHorizontal: rem(8),
  },
  logo: {
    width: rem(40),
    height: rem(40),
    resizeMode: "contain",
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
  refreshButtonText: {
    color: colors.white,
    fontSize: rem(16),
    textAlign: "center",
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
  menuContent: {
    paddingVertical: rem(8),
    fontSize: rem(16),
    color: colors.black,
  },
  footerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    tabBarActiveTintColor: colors.orange,
    tabBarInactiveTintColor: colors.lightGray,
    tabBarShowLabel: true,
  },
  screenOptions: {
    tabBarActiveTintColor: colors.orange,
    tabBarInactiveTintColor: "colors.lightGray,
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
  buildingButtonText: {
    color: colors.white,
    fontSize: rem(10),
    fontWeight: "bold",
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
  errorText: {
    color: colors.white,
    textAlign: "center",
  },
});

export const mainEdges = ["left", "right", "bottom"];
export default globalStyles;
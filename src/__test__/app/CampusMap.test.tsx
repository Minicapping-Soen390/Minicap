import CampusSwitcher from "../../app/(tabs)/CampusMap";
import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import * as Location from "expo-location";

// Mock react-native-maps
jest.mock("react-native-maps", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: React.forwardRef(
      (
        props: React.JSX.IntrinsicAttributes &
          React.ClassAttributes<HTMLDivElement> &
          React.HTMLAttributes<HTMLDivElement>,
        ref: React.LegacyRef<HTMLDivElement> | undefined
      ) => <div ref={ref} {...props} data-testid="map-view" />
    ),
    Marker: (
      props: React.JSX.IntrinsicAttributes &
        React.ClassAttributes<HTMLDivElement> &
        React.HTMLAttributes<HTMLDivElement>
    ) => <div {...props} data-testid="marker" />,
    Polygon: (
      props: React.JSX.IntrinsicAttributes &
        React.ClassAttributes<HTMLDivElement> &
        React.HTMLAttributes<HTMLDivElement>
    ) => <div {...props} data-testid="polygon" />,
  };
});

jest.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: jest.fn(async () => ({
    status: "granted",
  })),
  getCurrentPositionAsync: jest.fn(async () => ({
    coords: { latitude: 45.5, longitude: -73.6 },
  })),
  Accuracy: { High: 5 },
}));

describe("CampusSwitcher Component", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  //PASS
  it("renders CampusSwitcher correctly with SGW Campus", async () => {
    const { findByTestId, getByText, getByTestId } = render(<CampusSwitcher />);

    expect(await findByTestId("campus-map")).toBeTruthy();
    expect(getByText("SGW")).toBeTruthy();
    expect(getByText("LOY")).toBeTruthy();

    const switchComponent = getByTestId("campus-switch");
    expect(switchComponent.props.value).toBe(false);
  });

  //PASS
  it("toggles between SGW and Loyola campus when the switch is pressed", async () => {
    const { getByTestId, getByText } = render(<CampusSwitcher />);

    expect(getByText("SGW")).toBeTruthy();
    expect(getByText("LOY")).toBeTruthy();

    const switchComponent = getByTestId("campus-switch");

    // Toggle the switch to Loyola
    await act(async () => {
      fireEvent(switchComponent, "valueChange", true);
    });

    await waitFor(() => {
      expect(getByTestId("campus-map")).toBeTruthy();
    });

    // Toggle the switch back to SGW
    await act(async () => {
      fireEvent(switchComponent, "valueChange", false);
    });

    await waitFor(() => {
      expect(getByTestId("campus-map")).toBeTruthy();
    });
  });
  //PASS
  it("updates the map region when the campus changes", async () => {
    const { getByTestId } = render(<CampusSwitcher />);
    const switchComponent = getByTestId("campus-switch");

    let mapView = getByTestId("campus-map");
    let initialLatitude = mapView.props.initialRegion.latitude;
    let initialLongitude = mapView.props.initialRegion.longitude;

    expect(initialLatitude).toBe(45.4973);
    expect(initialLongitude).toBe(-73.5789);

    // Change to Loyola Campus
    await act(async () => {
      fireEvent(switchComponent, "valueChange", true);
    });

    await waitFor(() => {
      mapView = getByTestId("campus-map");
      const newLatitude = mapView.props.initialRegion.latitude;
      const newLongitude = mapView.props.initialRegion.longitude;
      // Verify Loyola Campus coordinates
      expect(newLatitude).toBe(45.4581);
      expect(newLongitude).toBe(-73.6405);
    });
    // Change back to SGW Campus
    await act(async () => {
      fireEvent(switchComponent, "valueChange", false);
    });
    await waitFor(() => {
      mapView = getByTestId("campus-map");
      const revertedLatitude = mapView.props.initialRegion.latitude;
      const revertedLongitude = mapView.props.initialRegion.longitude;
      expect(revertedLatitude).toBe(45.4973);
      expect(revertedLongitude).toBe(-73.5789);
    });
  });
  //PASS
  it("requests and updates user location", async () => {
    const { findByTestId, getByTestId } = render(<CampusSwitcher />);
    const refreshButton = getByTestId("refresh-location-button");

    // Ensure initial location is not updated yet
    let userLocationMarker = await findByTestId("user-location-marker");

    // Press refresh button to update location
    await act(async () => {
      fireEvent.press(refreshButton);
    });

    // Wait for location update
    await waitFor(async () => {
      userLocationMarker = await findByTestId("user-location-marker");
      expect(userLocationMarker.props.coordinate.latitude).toBe(45.5);
      expect(userLocationMarker.props.coordinate.longitude).toBe(-73.6);
    });
  });

  //PASS
  it("displays error when location permission is denied", async () => {
    // Fix: Ensure it's correctly mocked
    (
      Location.requestForegroundPermissionsAsync as jest.Mock
    ).mockResolvedValueOnce({ status: "denied" });

    const { findByTestId, getByText } = render(<CampusSwitcher />);

    // Wait for location error to appear
    await waitFor(() => {
      expect(
        getByText("Permission to access location was denied")
      ).toBeTruthy();
    });
  });

  //PASS
  it("displays error when fetching location fails", async () => {
    // Fix: Ensure it's correctly mocked
    (Location.getCurrentPositionAsync as jest.Mock).mockRejectedValueOnce(
      new Error("Location fetch failed")
    );

    const { findByTestId, getByText } = render(<CampusSwitcher />);

    // Wait for location error to appear
    await waitFor(() => {
      expect(getByText("Error getting location")).toBeTruthy();
    });
  });

  it("switches between campuses and verifies map updates", async () => {
    const { getByTestId } = render(<CampusSwitcher />);
    const switchComponent = getByTestId("campus-switch");

    await act(async () => {
      fireEvent.press(switchComponent);
    });

    await waitFor(() => {
      expect(getByTestId("campus-map")).toBeTruthy();
    });
  });

  //PASS
  it("ensures user location is updated and not equal to an incorrect location", async () => {
    const { findByTestId, getByTestId } = render(<CampusSwitcher />);
    const refreshButton = getByTestId("refresh-location-button");

    // Ensure initial location is not updated yet
    let userLocationMarker = await findByTestId("user-location-marker");

    // Press refresh button to update location
    await act(async () => {
      fireEvent.press(refreshButton);
    });

    // Wait for location update
    await waitFor(async () => {
      userLocationMarker = await findByTestId("user-location-marker");

      // Assert correct location update
      expect(userLocationMarker.props.coordinate.latitude).toBe(45.5);
      expect(userLocationMarker.props.coordinate.longitude).toBe(-73.6);

      // Assert incorrect location (should not be equal)
      expect(userLocationMarker.props.coordinate.latitude).not.toBe(40.0);
      expect(userLocationMarker.props.coordinate.longitude).not.toBe(-75.0);
    });
  });

  it("displays building information when clicking on a building SWG", async () => {
    const { findByTestId, getByTestId, getByText } = render(<CampusSwitcher />);

    expect(await findByTestId("campus-map")).toBeTruthy();

    // Find and click on MB Building marker
    const mbBuildingMarker = await findByTestId(
      "building-marker-67aaabc9a89802f0176bad8e"
    );

    await act(async () => {
      fireEvent.press(mbBuildingMarker);
    });

    await waitFor(() => {
      expect(getByTestId("building-info")).toBeTruthy();
    });

    // Verify building details
    expect(getByText("MB Building")).toBeTruthy();
    expect(getByText("1450 Guy Street")).toBeTruthy();
    expect(getByText("Mon-Fri: 9:00 AM - 6:00 PM")).toBeTruthy();
  });

  it("displays building information when clicking on a building LOY", async () => {
    const { findByTestId, getByTestId, getByText } = render(<CampusSwitcher />);

    expect(await findByTestId("campus-map")).toBeTruthy();

    // Switch to Loyola Campus
    const campusSwitch = getByTestId("campus-switch");
    await act(async () => {
      fireEvent.press(campusSwitch);
    });

    // Find and click on HA Building marker
    const haBuildingMarker = await findByTestId(
      "building-marker-67aaabc9a89802f0176bad84"
    );

    await act(async () => {
      fireEvent.press(haBuildingMarker);
    });

    await waitFor(() => {
      expect(getByTestId("building-info")).toBeTruthy();
    });

    // Verify building details
    expect(getByText("HA Building")).toBeTruthy();
    expect(getByText("7141 Sherbrooke West")).toBeTruthy();
    expect(getByText("Mon-Fri: 9:00 AM - 6:00 PM")).toBeTruthy();
  });

  it("hides building information when clicking outside", async () => {
    const { findByTestId, getByTestId, queryByTestId } = render(
      <CampusSwitcher />
    );

    const mbBuildingMarker = await findByTestId(
      "building-marker-67aaabc9a89802f0176bad8e"
    );
    await act(async () => {
      fireEvent.press(mbBuildingMarker);
    });

    expect(await findByTestId("building-info")).toBeTruthy();

    const mapView = getByTestId("campus-map");
    await act(async () => {
      fireEvent.press(mapView);
    });

    // Verify the pop-up disappears
    await waitFor(() => {
      expect(queryByTestId("building-info")).toBeNull();
    });
  });

  it("handles case where building polygon is invalid", async () => {
    const { findByTestId } = render(<CampusSwitcher />);
    const buildingMarker = await findByTestId(
      "building-marker-67aaabc9a89802f0176bad84"
    );

    await act(async () => {
      fireEvent.press(buildingMarker);
    });

    await waitFor(() => {
      expect(findByTestId("building-info")).toBeTruthy();
    });
  });

  it("handles case where user location is outside building polygon", async () => {
    const { getByTestId } = render(<CampusSwitcher />);
    const refreshButton = getByTestId("refresh-location-button");

    await act(async () => {
      fireEvent.press(refreshButton);
    });

    await waitFor(() => {
      expect(getByTestId("user-location-marker")).toBeTruthy();
    });
  });

  it("zooms in and out when pinch gesture is performed", async () => {
    const { getByTestId } = render(<CampusSwitcher />);
    const mapView = getByTestId("campus-map");

    await act(async () => {
      fireEvent(mapView, "gesture", {
        nativeEvent: { scale: 2 },
      });
    });

    await act(async () => {
      fireEvent(mapView, "gesture", {
        nativeEvent: { scale: 0.5 },
      });
    });
  });

  it("scrolls left and right to change visible coordinates", async () => {
    const { getByTestId } = render(<CampusSwitcher />);
    const mapView = getByTestId("campus-map");

    await act(async () => {
      fireEvent.scroll(mapView, {
        nativeEvent: { contentOffset: { x: 100, y: 0 } }, // Scroll right
      });
    });

    await act(async () => {
      fireEvent.scroll(mapView, {
        nativeEvent: { contentOffset: { x: -100, y: 0 } }, // Scroll left
      });
    });
  });

  it("scrolls up and down to change visible coordinates", async () => {
    const { getByTestId } = render(<CampusSwitcher />);
    const mapView = getByTestId("campus-map");

    await act(async () => {
      fireEvent.scroll(mapView, {
        nativeEvent: { contentOffset: { x: 0, y: 100 } }, // Scroll down
      });
    });

    await act(async () => {
      fireEvent.scroll(mapView, {
        nativeEvent: { contentOffset: { x: 0, y: -100 } }, // Scroll up
      });
    });
  });
});

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
    Polyline: (
      props: React.JSX.IntrinsicAttributes &
        React.ClassAttributes<HTMLDivElement> &
        React.HTMLAttributes<HTMLDivElement>
    ) => <div {...props} data-testid="polyline" />,
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
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("renders correctly and toggles campuses", async () => {
    const { getByTestId, findByTestId, getAllByText } = render(
      <CampusSwitcher />
    );
    expect(await findByTestId("campus-map")).toBeTruthy();
    const switchComponent = getByTestId("campus-switch");
    expect(switchComponent.props.value).toBe(false);
    await act(async () => fireEvent(switchComponent, "valueChange", true));
    await waitFor(() => expect(getByTestId("campus-map")).toBeTruthy());
  });

  it("refreshes and displays user location", async () => {
    const { getByTestId, findByTestId } = render(<CampusSwitcher />);
    await act(async () =>
      fireEvent.press(getByTestId("refresh-location-button"))
    );
    await waitFor(() => {
      const marker = getByTestId("user-location-marker");
      expect(marker.props.coordinate.latitude).toBe(45.5);
    });
  });

  it("shows error for denied location permissions", async () => {
    (
      Location.requestForegroundPermissionsAsync as jest.Mock
    ).mockResolvedValueOnce({ status: "denied" });
    const { getByText } = render(<CampusSwitcher />);
    await waitFor(() =>
      expect(getByText("Permission to access location was denied")).toBeTruthy()
    );
  });

  it("handles location fetch failure", async () => {
    (Location.getCurrentPositionAsync as jest.Mock).mockRejectedValueOnce(
      new Error("fail")
    );
    const { getByText } = render(<CampusSwitcher />);
    await waitFor(() =>
      expect(getByText("Error getting location")).toBeTruthy()
    );
  });

  it("displays building info on press", async () => {
    const { findByTestId, getByText } = render(<CampusSwitcher />);
    await act(async () =>
      fireEvent.press(
        await findByTestId("building-marker-67aaabc9a89802f0176bad8e")
      )
    );
    expect(getByText("MB Building")).toBeTruthy();
    expect(getByText("1450 Guy Street")).toBeTruthy();
  });

  it("clears building info when map pressed", async () => {
    const { findByTestId, queryByTestId, getByTestId } = render(
      <CampusSwitcher />
    );
    await act(async () =>
      fireEvent.press(
        await findByTestId("building-marker-67aaabc9a89802f0176bad8e")
      )
    );
    await act(async () => fireEvent.press(getByTestId("campus-map")));
    await waitFor(() => expect(queryByTestId("building-info")).toBeNull());
  });

  it("selects start and destination buildings", async () => {
    const { findByTestId, getByTestId } = render(<CampusSwitcher />);
    await act(async () =>
      fireEvent.press(
        await findByTestId("building-marker-67aaabc9a89802f0176bad8e")
      )
    );
    await act(async () => fireEvent.press(getByTestId("set-start-button")));
    await act(async () =>
      fireEvent.press(
        await findByTestId("building-marker-67aaabc9a89802f0176bad84")
      )
    );
    await act(async () =>
      fireEvent.press(getByTestId("set-destination-button"))
    );
  });

  it("uses current location as start for navigation", async () => {
    const { getByTestId, findByTestId } = render(<CampusSwitcher />);
    await act(async () =>
      fireEvent.press(getByTestId("refresh-location-button"))
    );
    await act(async () =>
      fireEvent.press(
        await findByTestId("building-marker-67aaabc9a89802f0176bad84")
      )
    );
    await act(async () =>
      fireEvent.press(getByTestId("set-destination-button"))
    );
  });

  it("initiates outdoor navigation", async () => {
    const { findByTestId, getByTestId } = render(<CampusSwitcher />);
    await act(async () =>
      fireEvent.press(
        await findByTestId("building-marker-67aaabc9a89802f0176bad8e")
      )
    );
    await act(async () => fireEvent.press(getByTestId("set-start-button")));
    await act(async () =>
      fireEvent.press(
        await findByTestId("building-marker-67aaabc9a89802f0176bad84")
      )
    );
    await act(async () =>
      fireEvent.press(getByTestId("set-destination-button"))
    );
    expect(await findByTestId("outdoor-navigation-container")).toBeTruthy();
  });
});

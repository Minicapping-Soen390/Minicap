import { render } from "@testing-library/react-native";
import * as Location from "expo-location";
import * as mapUtils from "../../app/utils/mapUtils";
import axios from "axios";
import { Alert } from "react-native";
import { sanitizeHtmlContent } from "@/components/utils";
import {
  decodePolyline,
  isPointInPolygon,
  sanitizeHtmlContent,
} from "../../app/utils/mapUtils";

jest.mock("expo-location");
jest.mock("axios");
jest.spyOn(Alert, "alert");

const mockRegion = {
  latitude: 45.4952,
  longitude: -73.5785,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

describe("mapUtils - facade behavior", () => {
  it("sanitizeHtmlContent strips tags and scripts", () => {
    const dirty = "<b>Bold</b><script>alert('hack');</script>";
    const result = mapUtils.sanitizeHtmlContent(dirty);
    expect(result).toBe("Bold");
  });

  it("decodePolyline returns valid coordinates", () => {
    const encoded = "_p~iF~ps|U_ulLnnqC_mqNvxq`@";
    const decoded = mapUtils.decodePolyline(encoded);
    expect(decoded.length).toBeGreaterThan(0);
    expect(decoded[0]).toHaveProperty("latitude");
    expect(decoded[0]).toHaveProperty("longitude");
  });

  it("isPointInPolygon works for point inside polygon", () => {
    const point = { latitude: 1, longitude: 1 };
    const square = [
      { latitude: 0, longitude: 0 },
      { latitude: 0, longitude: 2 },
      { latitude: 2, longitude: 2 },
      { latitude: 2, longitude: 0 },
    ];
    expect(mapUtils.isPointInPolygon(point, square)).toBe(true);
  });

  it("getUserLocation returns region when granted", async () => {
    Location.requestForegroundPermissionsAsync.mockResolvedValue({
      status: "granted",
    });
    Location.getCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: 45.5, longitude: -73.6 },
    });

    const facade = mapUtils.createMapFacade(baseParams);
    const result = await facade.getUserLocation();
    expect(result).toBeDefined();
    expect(baseParams.setUserLocation).toHaveBeenCalled();
  });

  it("getUserLocation handles denied permissions", async () => {
    Location.requestForegroundPermissionsAsync.mockResolvedValue({
      status: "denied",
    });

    const facade = mapUtils.createMapFacade(baseParams);
    await facade.getUserLocation();
    expect(baseParams.setLocationError).toHaveBeenCalledWith(
      "Permission to access location was denied"
    );
  });

  it("resetNavigation clears relevant states", () => {
    const facade = mapUtils.createMapFacade(baseParams);
    facade.resetNavigation();
    expect(baseParams.setStartPoint).toHaveBeenCalledWith(null);
    expect(baseParams.setEndPoint).toHaveBeenCalledWith(null);
    expect(baseParams.setDirections).toHaveBeenCalledWith([]);
  });

  it("handleTransportModeChange triggers direction fetch", async () => {
    axios.get.mockResolvedValue({
      data: {
        routes: [
          {
            overview_polyline: { points: "_p~iF~ps|U_ulLnnqC_mqNvxq`@" },
            legs: [
              {
                steps: [
                  {
                    html_instructions: "<b>Walk</b>",
                    distance: { text: "5m" },
                    duration: { text: "1m" },
                  },
                ],
              },
            ],
          },
        ],
      },
    });
    const facade = mapUtils.createMapFacade({
      ...baseParams,
      startPoint: mockRegion,
      endPoint: mockRegion,
    });
    await facade.handleTransportModeChange("walking");
    expect(baseParams.setTransportMode).toHaveBeenCalledWith("walking");
    expect(baseParams.setActiveTab).toHaveBeenCalledWith("walking");
    expect(baseParams.setDirections).toHaveBeenCalled();
  });

  it("decodes a valid encoded polyline string", () => {
    const encoded = "a~l~Fjk~uOwHJy@P";
    const result = decodePolyline(encoded);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("latitude");
    expect(result[0]).toHaveProperty("longitude");
  });

  it("detects if point is inside polygon", () => {
    const polygon = [
      { latitude: 0, longitude: 0 },
      { latitude: 0, longitude: 10 },
      { latitude: 10, longitude: 10 },
      { latitude: 10, longitude: 0 },
    ];
    const point = { latitude: 5, longitude: 5 };
    expect(isPointInPolygon(point, polygon)).toBe(true);
  });

  it("detects if point is outside polygon", () => {
    const polygon = [
      { latitude: 0, longitude: 0 },
      { latitude: 0, longitude: 10 },
      { latitude: 10, longitude: 10 },
      { latitude: 10, longitude: 0 },
    ];
    const point = { latitude: 15, longitude: 15 };
    expect(isPointInPolygon(point, polygon)).toBe(false);
  });

  it("sanitizes HTML content", () => {
    const html = "<div>Turn <b>right</b> on Main St.</div>";
    const result = sanitizeHtmlContent(html);
    expect(result).toBe("Turn right on Main St.");
  });
});

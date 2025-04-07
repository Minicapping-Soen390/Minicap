import { AlertButton, AlertType, AlertOptions } from "react-native";
import {
  createMapFacade,
  decodePolyline,
  isPointInPolygon,
  sanitizeHtmlContent,
} from "../../Shared/utils/mapUtils";
import axios from "axios";

jest.mock("expo-location");
jest.mock("axios");

const mockSet = () => jest.fn();

const getFacade = (overrides = {}) =>
  createMapFacade({
    setUserLocation: mockSet(),
    setLocationError: mockSet(),
    setPermissionGranted: mockSet(),
    setBuildingInfo: mockSet(),
    setSelectedBuildingId: mockSet(),
    setDestinationAddress: mockSet(),
    setStartingAddress: mockSet(),
    setStartPoint: mockSet(),
    setEndPoint: mockSet(),
    userLocation: {
      latitude: 45.5,
      longitude: -73.6,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    },
    selectedBuildingId: null,
    Alert: {
      alert: jest.fn(),
      prompt: function (
        title: string,
        message?: string,
        callbackOrButtons?: ((text: string) => void) | AlertButton[],
        type?: AlertType,
        defaultValue?: string,
        keyboardType?: string,
        options?: AlertOptions
      ): void {
        throw new Error("Function not implemented.");
      },
    },
    destinationAddress: "",
    startPoint: null,
    endPoint: null,
    setShowNavigationPopup: mockSet(),
    setIsNavigationStarted: mockSet(),
    setNewRoute: mockSet(),
    setDirections: mockSet(),
    setShuttlePolyline: mockSet(),
    setTransportMode: mockSet(),
    setActiveTab: mockSet(),
    setIsCrossCampusNavigation: mockSet(),
    shuttleFacade: {
      fetchShuttleDirections: jest.fn().mockResolvedValue({
        shuttlePolyline: [{ latitude: 0, longitude: 0 }],
        directions: [
          { instruction: "Take shuttle", distance: "1 km", duration: "10 min" },
        ],
      }),
    },
    ...overrides,
  });
jest.mock("sanitize-html", () =>
  jest.fn((html) => html.replace(/<[^>]*>?/gm, ""))
);

describe("mapUtils", () => {
  describe("sanitizeHtmlContent", () => {
    it("removes all HTML tags and trims the result", () => {
      const dirtyHtml = "<b>Hello</b> <i>World</i>";
      const clean = sanitizeHtmlContent(dirtyHtml);
      expect(clean).toBe("Hello World");
    });
  });

  describe("decodePolyline", () => {
    it("correctly decodes a simple encoded polyline", () => {
      const encoded = "_p~iF~ps|U_ulLnnqC_mqNvxq`@";
      const decoded = decodePolyline(encoded);
      expect(decoded.length).toBeGreaterThan(0);
      expect(decoded[0]).toHaveProperty("latitude");
      expect(decoded[0]).toHaveProperty("longitude");
    });
  });

  describe("isPointInPolygon", () => {
    const squarePolygon = [
      { latitude: 0, longitude: 0 },
      { latitude: 0, longitude: 1 },
      { latitude: 1, longitude: 1 },
      { latitude: 1, longitude: 0 },
    ];

    it("returns true for a point inside the polygon", () => {
      const point = { latitude: 0.5, longitude: 0.5 };
      expect(isPointInPolygon(point, squarePolygon)).toBe(true);
    });

    it("returns false for a point outside the polygon", () => {
      const point = { latitude: 1.5, longitude: 1.5 };
      expect(isPointInPolygon(point, squarePolygon)).toBe(false);
    });

    it("returns true for a point on the edge of the polygon", () => {
      const point = { latitude: 0, longitude: 0.5 };
      expect(isPointInPolygon(point, squarePolygon)).toBe(true);
    });
  });

  describe("mapUtils - createMapFacade", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("handleMapPress clears selected building", () => {
      const setBuildingInfo = jest.fn();
      const setSelectedBuildingId = jest.fn();
      const facade = getFacade({ setBuildingInfo, setSelectedBuildingId });
      facade.handleMapPress();
      expect(setBuildingInfo).toHaveBeenCalledWith(null);
      expect(setSelectedBuildingId).toHaveBeenCalledWith(null);
    });

    it("fetchRegularDirections decodes polyline and returns steps", async () => {
      const mockResponse = {
        data: {
          routes: [
            {
              overview_polyline: { points: "_p~iF~ps|U_ulLnnqC_mqNvxq`@" },
              legs: [
                {
                  steps: [
                    {
                      html_instructions: "<b>Walk</b>",
                      distance: { text: "1 km" },
                      duration: { text: "5 mins" },
                    },
                  ],
                },
              ],
            },
          ],
        },
      };

      (axios.get as jest.Mock).mockResolvedValue(mockResponse);

      const { fetchRegularDirections } = getFacade();
      const result = await fetchRegularDirections(
        { latitude: 1, longitude: 1 },
        { latitude: 2, longitude: 2 },
        "walking",
        "test-api-key"
      );

      expect(result.decodedRoute.length).toBeGreaterThan(0);
      expect(result.steps[0].instruction).toBe("Walk");
    });

    it("fetchDirections handles cross-campus navigation with shuttle", async () => {
      const setShuttlePolyline = jest.fn();
      const setDirections = jest.fn();
      const setIsNavigationStarted = jest.fn();
      const shuttleFacade = {
        fetchShuttleDirections: jest.fn().mockResolvedValue({
          shuttlePolyline: [{ latitude: 0, longitude: 0 }],
          directions: [
            {
              instruction: "Take shuttle",
              distance: "1 km",
              duration: "10 min",
            },
          ],
        }),
      };

      const facade = getFacade({
        startPoint: { campus: "SGW", latitude: 1, longitude: 1 },
        endPoint: { campus: "LOYOLA", latitude: 2, longitude: 2 },
        shuttleFacade,
        setShuttlePolyline,
        setDirections,
        setIsNavigationStarted,
      });

      await facade.fetchDirections("transit", "test-key");
      expect(setShuttlePolyline).toHaveBeenCalled();
      expect(setDirections).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ instruction: expect.any(String) }),
        ])
      );
      expect(setIsNavigationStarted).toHaveBeenCalledWith(true);
    });
  });
});

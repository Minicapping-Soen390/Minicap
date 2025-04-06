import { render } from "@testing-library/react-native";
import axios from "axios";
import {
  createShuttleFacade,
  determineUserCampus,
  fetchShuttleData,
  renderShuttleMarkers,
} from "../../app/utils/shuttleUtils";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock("../../services/ShuttleService", () => ({
  shuttleService: {
    getClosestShuttle: jest.fn().mockReturnValue({}),
    estimateWaitingTime: jest.fn().mockReturnValue(5),
    getNextDepartureTime: jest.fn().mockReturnValue({
      departureTime: "12:30 PM",
      waitTime: 10,
    }),
  },
  SHUTTLE_STOPS: {
    SGW: { latitude: 45.4953, longitude: -73.5789, name: "SGW" },
    LOYOLA: { latitude: 45.4581, longitude: -73.6405, name: "LOYOLA" },
  },
}));

describe("shuttleUtils", () => {
  const setShuttleLocations = jest.fn();
  const setEstimatedWaitTime = jest.fn();
  const setShuttlePolyline = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("determines closest campus to SGW", () => {
    const location = { latitude: 45.4971, longitude: -73.5792 };
    expect(determineUserCampus(location)).toBe("SGW");
  });

  it("fetchShuttleData returns filtered bus points and route", async () => {
    mockedAxios.get.mockResolvedValueOnce({});
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        d: {
          Points: [
            { ID: "BUS001", Latitude: "45.48", Longitude: "-73.61" },
            { ID: "BUS002", Latitude: "45.50", Longitude: "-73.60" },
          ],
        },
      },
    });

    const data = await fetchShuttleData();
    expect(data.busPoints.length).toBeGreaterThan(0);
    expect(data.routePoints?.length).toBeGreaterThan(0);
  });

  it("renders shuttle stop markers", () => {
    const globalStyles = {
      shuttleStopMarker: { backgroundColor: "blue" },
      shuttleStopText: { color: "white" },
    };
    const brandColors = {};
    const { getByTestId } = render(
      renderShuttleMarkers(globalStyles, brandColors)
    );
    expect(getByTestId("sgw-campus-shuttle-stop")).toBeTruthy();
    expect(getByTestId("loy-campus-shuttle-stop")).toBeTruthy();
  });

  it("throws on failed axios call", async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error("Network error"));
    await expect(fetchShuttleData()).rejects.toThrow("Network error");
  });

  it("returns empty results if no bus points", async () => {
    mockedAxios.get.mockResolvedValueOnce({});
    mockedAxios.post.mockResolvedValueOnce({ data: { d: { Points: [] } } });

    const result = await fetchShuttleData();
    expect(result.busPoints).toEqual([]);
    expect(result.routePoints).toBeUndefined();
  });

  describe("trackShuttles", () => {
    it("tracks shuttle and estimates wait time when shuttle is found", async () => {
      mockedAxios.get.mockResolvedValueOnce({});
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          d: {
            Points: [{ ID: "BUS1", Latitude: "45.48", Longitude: "-73.61" }],
          },
        },
      });

      const facade = createShuttleFacade({
        setShuttleLocations,
        setEstimatedWaitTime,
        setShuttlePolyline,
      });

      await facade.trackShuttles({ campus: "SGW" });
      expect(setShuttleLocations).toHaveBeenCalled();
      expect(setEstimatedWaitTime).toHaveBeenCalledWith(5);
    });

    it("handles no nearest shuttle found", async () => {
      const { shuttleService } = require("../../services/ShuttleService");
      shuttleService.getClosestShuttle.mockReturnValueOnce(null);

      mockedAxios.get.mockResolvedValueOnce({});
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          d: {
            Points: [{ ID: "BUS001", Latitude: "45.48", Longitude: "-73.61" }],
          },
        },
      });

      const facade = createShuttleFacade({
        setShuttleLocations,
        setEstimatedWaitTime,
        setShuttlePolyline,
      });

      await facade.trackShuttles({ campus: "SGW" });
      expect(setShuttleLocations).toHaveBeenCalled();
      expect(setEstimatedWaitTime).not.toHaveBeenCalled();
    });
  });

  describe("fetchShuttleDirections", () => {
    const mockRouteResponse = (legsExist = true, polylineExist = true) => {
      const legs = legsExist
        ? [
            {
              steps: [
                {
                  html_instructions: "<b>Walk</b>",
                  distance: { text: "100m" },
                  duration: { text: "1min" },
                },
              ],
              distance: { text: "200m" },
              duration: { text: "2min" },
            },
          ]
        : [];
      return {
        data: {
          routes: [
            {
              legs,
              ...(polylineExist
                ? { overview_polyline: { points: "abc" } }
                : {}),
            },
          ],
        },
      };
    };

    const baseArgs = {
      start: { latitude: 45.4971, longitude: -73.5792, campus: "SGW" },
      end: { latitude: 45.458, longitude: -73.6405, campus: "LOYOLA" },
      key: "fake-api-key",
      decode: jest.fn().mockReturnValue([{ latitude: 45.0, longitude: -73.0 }]),
      sanitize: jest.fn((html) => html),
    };

    it("fetches directions and sets shuttle polyline", async () => {
      mockedAxios.get
        .mockResolvedValueOnce(mockRouteResponse()) // toShuttleStop
        .mockResolvedValueOnce(mockRouteResponse()) // shuttleRoute
        .mockResolvedValueOnce(mockRouteResponse()); // fromShuttleStop

      mockedAxios.get.mockResolvedValueOnce({}); // map.aspx
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          d: {
            Points: [{ ID: "BUS001", Latitude: "45.48", Longitude: "-73.61" }],
          },
        },
      });

      const facade = createShuttleFacade({
        setShuttleLocations,
        setEstimatedWaitTime,
        setShuttlePolyline,
      });

      const result = await facade.fetchShuttleDirections(
        baseArgs.start,
        baseArgs.end,
        baseArgs.key,
        baseArgs.decode,
        baseArgs.sanitize
      );

      expect(result.directions.length).toBeGreaterThan(0);
      expect(setShuttlePolyline).toHaveBeenCalledWith(expect.any(Array));
    });

    it("throws if toShuttleStop has no legs", async () => {
      mockedAxios.get.mockResolvedValueOnce(mockRouteResponse(false));

      const facade = createShuttleFacade({
        setShuttleLocations,
        setEstimatedWaitTime,
        setShuttlePolyline,
      });

      await expect(
        facade.fetchShuttleDirections(
          baseArgs.start,
          baseArgs.end,
          baseArgs.key,
          baseArgs.decode,
          baseArgs.sanitize
        )
      ).rejects.toThrow("Invalid route data for path to shuttle stop");
    });

    it("throws if shuttleRoute has no legs", async () => {
      mockedAxios.get
        .mockResolvedValueOnce(mockRouteResponse())
        .mockResolvedValueOnce(mockRouteResponse(false));

      const facade = createShuttleFacade({
        setShuttleLocations,
        setEstimatedWaitTime,
        setShuttlePolyline,
      });

      await expect(
        facade.fetchShuttleDirections(
          baseArgs.start,
          baseArgs.end,
          baseArgs.key,
          baseArgs.decode,
          baseArgs.sanitize
        )
      ).rejects.toThrow("Invalid shuttle route data");
    });

    it("throws if fromShuttleStop has no legs", async () => {
      mockedAxios.get
        .mockResolvedValueOnce(mockRouteResponse())
        .mockResolvedValueOnce(mockRouteResponse())
        .mockResolvedValueOnce(mockRouteResponse(false));

      const facade = createShuttleFacade({
        setShuttleLocations,
        setEstimatedWaitTime,
        setShuttlePolyline,
      });

      await expect(
        facade.fetchShuttleDirections(
          baseArgs.start,
          baseArgs.end,
          baseArgs.key,
          baseArgs.decode,
          baseArgs.sanitize
        )
      ).rejects.toThrow("Invalid route data from shuttle stop");
    });
  });
});

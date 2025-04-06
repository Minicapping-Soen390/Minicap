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
  it("determines closest campus to SGW", () => {
    const location = { latitude: 45.4971, longitude: -73.5792 };
    const result = determineUserCampus(location);
    expect(result).toBe("SGW");
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

  it("calls tracking logic", async () => {
    mockedAxios.get.mockResolvedValue({});
    mockedAxios.post.mockResolvedValue({
      data: {
        d: { Points: [{ ID: "BUS1", Latitude: "45.48", Longitude: "-73.61" }] },
      },
    });

    const setShuttleLocations = jest.fn();
    const setEstimatedWaitTime = jest.fn();
    const setShuttlePolyline = jest.fn();

    const facade = createShuttleFacade({
      setShuttleLocations,
      setEstimatedWaitTime,
      setShuttlePolyline,
    });

    await facade.trackShuttles({ campus: "SGW" });

    expect(setShuttleLocations).toHaveBeenCalled();
    expect(setEstimatedWaitTime).toHaveBeenCalledWith(5);
  });

  it("fetches shuttle directions with mocked dependencies", async () => {
    mockedAxios.get
      .mockResolvedValueOnce({
        data: {
          routes: [
            {
              legs: [
                {
                  steps: [
                    {
                      html_instructions: "step1",
                      distance: { text: "100m" },
                      duration: { text: "1min" },
                    },
                  ],
                  distance: { text: "500m" },
                  duration: { text: "5min" },
                },
              ],
            },
          ],
        },
      })
      .mockResolvedValueOnce({
        data: {
          routes: [
            {
              overview_polyline: { points: "abc" },
              legs: [
                { distance: { text: "2km" }, duration: { text: "10min" } },
              ],
            },
          ],
        },
      })
      .mockResolvedValueOnce({
        data: {
          routes: [
            {
              legs: [
                {
                  steps: [
                    {
                      html_instructions: "step2",
                      distance: { text: "300m" },
                      duration: { text: "3min" },
                    },
                  ],
                },
              ],
            },
          ],
        },
      });

    const setShuttleLocations = jest.fn();
    const setEstimatedWaitTime = jest.fn();
    const setShuttlePolyline = jest.fn();

    const decodePolyline = jest
      .fn()
      .mockReturnValue([{ latitude: 45.0, longitude: -73.0 }]);
    const sanitizeHtmlContent = jest.fn().mockImplementation((html) => html);

    const facade = createShuttleFacade({
      setShuttleLocations,
      setEstimatedWaitTime,
      setShuttlePolyline,
    });

    const result = await facade.fetchShuttleDirections(
      { latitude: 45.4971, longitude: -73.5792, campus: "SGW" },
      { latitude: 45.458, longitude: -73.6405, campus: "LOYOLA" },
      "fake-api-key",
      decodePolyline,
      sanitizeHtmlContent
    );

    expect(result.directions.length).toBeGreaterThan(0);
    expect(setShuttlePolyline).toHaveBeenCalledWith(expect.any(Array));
  });

  it("throws if toShuttleStop has no valid legs", async () => {
    const setShuttleLocations = jest.fn();
    const setEstimatedWaitTime = jest.fn();
    const setShuttlePolyline = jest.fn();

    const facade = createShuttleFacade({
      setShuttleLocations,
      setEstimatedWaitTime,
      setShuttlePolyline,
    });

    mockedAxios.get.mockResolvedValueOnce({
      data: { routes: [] }, // no legs
    });

    await expect(
      facade.fetchShuttleDirections(
        { latitude: 45.5, longitude: -73.6, campus: "SGW" },
        { latitude: 45.45, longitude: -73.64, campus: "LOYOLA" },
        "fake-api-key",
        () => [],
        (html) => html
      )
    ).rejects.toThrow("Invalid route data for path to shuttle stop");
  });

  it("throws if shuttleRoute has no valid legs", async () => {
    const facade = createShuttleFacade({
      setShuttleLocations: jest.fn(),
      setEstimatedWaitTime: jest.fn(),
      setShuttlePolyline: jest.fn(),
    });

    // valid toShuttleStop
    mockedAxios.get.mockResolvedValueOnce({
      data: { routes: [{ legs: [{}] }] },
    });

    // invalid shuttleRoute
    mockedAxios.get.mockResolvedValueOnce({
      data: { routes: [] },
    });

    await expect(
      facade.fetchShuttleDirections(
        { latitude: 45.5, longitude: -73.6, campus: "SGW" },
        { latitude: 45.45, longitude: -73.64, campus: "LOYOLA" },
        "fake-api-key",
        () => [],
        (html) => html
      )
    ).rejects.toThrow("Invalid shuttle route data");
  });

  it("throws if fromShuttleStop has no valid legs", async () => {
    const facade = createShuttleFacade({
      setShuttleLocations: jest.fn(),
      setEstimatedWaitTime: jest.fn(),
      setShuttlePolyline: jest.fn(),
    });

    // 1st and 2nd requests valid
    mockedAxios.get.mockResolvedValueOnce({
      data: { routes: [{ legs: [{}] }] },
    }); // toShuttleStop
    mockedAxios.get.mockResolvedValueOnce({
      data: { routes: [{ legs: [{}], overview_polyline: { points: "abc" } }] },
    }); // shuttleRoute

    // 3rd response is invalid
    mockedAxios.get.mockResolvedValueOnce({ data: { routes: [] } }); // fromShuttleStop

    await expect(
      facade.fetchShuttleDirections(
        { latitude: 45.5, longitude: -73.6, campus: "SGW" },
        { latitude: 45.45, longitude: -73.64, campus: "LOYOLA" },
        "fake-api-key",
        () => [],
        (html) => html
      )
    ).rejects.toThrow("Invalid route data from shuttle stop");
  });

  it("throws if fromShuttleStop has no valid legs", async () => {
    const facade = createShuttleFacade({
      setShuttleLocations: jest.fn(),
      setEstimatedWaitTime: jest.fn(),
      setShuttlePolyline: jest.fn(),
    });

    // 1st and 2nd requests valid
    mockedAxios.get.mockResolvedValueOnce({
      data: { routes: [{ legs: [{}] }] },
    }); // toShuttleStop
    mockedAxios.get.mockResolvedValueOnce({
      data: { routes: [{ legs: [{}], overview_polyline: { points: "abc" } }] },
    }); // shuttleRoute

    // 3rd response is invalid
    mockedAxios.get.mockResolvedValueOnce({ data: { routes: [] } }); // fromShuttleStop

    await expect(
      facade.fetchShuttleDirections(
        { latitude: 45.5, longitude: -73.6, campus: "SGW" },
        { latitude: 45.45, longitude: -73.64, campus: "LOYOLA" },
        "fake-api-key",
        () => [],
        (html) => html
      )
    ).rejects.toThrow("Invalid route data from shuttle stop");
  });

  it("handles case where no nearest shuttle is found", async () => {
    const setShuttleLocations = jest.fn();
    const setEstimatedWaitTime = jest.fn();

    const setShuttlePolyline = jest.fn();
    const facade = createShuttleFacade({
      setShuttleLocations,
      setEstimatedWaitTime,
      setShuttlePolyline,
    });

    // mock return null for getClosestShuttle
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

    await facade.trackShuttles({ campus: "SGW" });

    expect(setShuttleLocations).toHaveBeenCalled();
    expect(setEstimatedWaitTime).not.toHaveBeenCalled();
  });
});

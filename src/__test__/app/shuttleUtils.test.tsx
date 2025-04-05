import { determineUserCampus, fetchShuttleData } from "../utils/shuttleUtils";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("shuttleUtils", () => {
  it("determines closest campus to SGW", () => {
    const location = { latitude: 45.4971, longitude: -73.5792 };
    const result = determineUserCampus(location);
    expect(result).toBe("SGW");
  });

  it("fetchShuttleData returns filtered bus points and route", async () => {
    mockedAxios.get.mockResolvedValueOnce({}); // Dummy page request
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
});

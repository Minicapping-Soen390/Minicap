import { shuttleSchedule, shuttleInfo } from "@/data/shuttleSchedule";

describe("shuttleSchedule", () => {
  it("should contain LOY and SGW keys", () => {
    expect(Object.keys(shuttleSchedule)).toEqual(expect.arrayContaining(["LOY", "SGW"]));
  });

  it("should have valid time format (HH:MM) for each departure", () => {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

    shuttleSchedule.LOY.forEach((time: any) => {
      expect(time).toMatch(timeRegex);
    });

    shuttleSchedule.SGW.forEach((time: any) => {
      expect(time).toMatch(timeRegex);
    });
  });

  it("should have same number of shuttle times on both campuses", () => {
    expect(shuttleSchedule.LOY.length).toBeGreaterThan(0);
    expect(shuttleSchedule.SGW.length).toBeGreaterThan(0);
  });
});

describe("shuttleInfo", () => {
  it("should contain required keys", () => {
    expect(shuttleInfo).toHaveProperty("operatingDays");
    expect(shuttleInfo).toHaveProperty("rideTime");
    expect(shuttleInfo).toHaveProperty("firstDepartureLOY");
    expect(shuttleInfo).toHaveProperty("firstDepartureSGW");
    expect(shuttleInfo).toHaveProperty("lastDepartureLOY");
    expect(shuttleInfo).toHaveProperty("lastDepartureSGW");
    expect(shuttleInfo).toHaveProperty("requirements");
  });

  it("should include all requirements as strings", () => {
    expect(Array.isArray(shuttleInfo.requirements)).toBe(true);
    shuttleInfo.requirements.forEach((req: any) => {
      expect(typeof req).toBe("string");
    });
  });

  it("should specify valid first and last departure times", () => {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    expect(shuttleInfo.firstDepartureLOY).toMatch(timeRegex);
    expect(shuttleInfo.firstDepartureSGW).toMatch(timeRegex);
    expect(shuttleInfo.lastDepartureLOY).toMatch(timeRegex);
    expect(shuttleInfo.lastDepartureSGW).toMatch(timeRegex);
  });
});

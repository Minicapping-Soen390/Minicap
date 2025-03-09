import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import FindBuilding from "../../app/(tabs)/FindBuilding";

jest.spyOn(console, "log").mockImplementation(() => {});

describe("FindBuilding Component", () => {
  it("renders search results for MB Building (SWG) and logs its details on click", async () => {
    const { getByTestId, getByText, queryByText, getAllByTestId } = render(
      <FindBuilding />
    );

    await waitFor(
      () => expect(queryByText("Loading buildings...")).toBeNull(),
      { timeout: 2000 }
    );

    // Ensure "Search Results" appears
    await waitFor(() => getByText("Search Results"));

    // Get search input and type "MB"
    const searchInput = getByTestId("search-input");
    fireEvent.changeText(searchInput, "MB");

    // Ensure MB Building appears in the search results
    const buildingItems = await waitFor(() =>
      getAllByTestId("building-item-67aaabc9a89802f0176bad8e")
    );
    expect(buildingItems.length).toBeGreaterThan(0);

    // Click the first building item
    fireEvent.press(buildingItems[0]);

    // Ensure building details are logged
    await waitFor(() => {
      expect(console.log).toHaveBeenCalledWith(
        "Selected Building:",
        expect.objectContaining({
          name: "MB Building",
          campus: "SGW",
          address: "1450 Guy Street",
        })
      );
    });
  });

  it("renders search results for X Building (SGW) and logs its details on click", async () => {
    const { getByTestId, getByText, queryByText, getAllByTestId } = render(
      <FindBuilding />
    );

    await waitFor(
      () => expect(queryByText("Loading buildings...")).toBeNull(),
      { timeout: 2000 }
    );

    // Ensure "Search Results" appears
    await waitFor(() => getByText("Search Results"));

    // Get search input and type "X"
    const searchInput = getByTestId("search-input");
    fireEvent.changeText(searchInput, "X");

    // Ensure X Building appears in the search results
    const buildingItems = await waitFor(() =>
      getAllByTestId("building-item-67aaabc9a89802f0176badaf")
    );
    expect(buildingItems.length).toBeGreaterThan(0);

    // Click the first building item
    fireEvent.press(buildingItems[0]);

    // Ensure building details are logged
    await waitFor(() => {
      expect(console.log).toHaveBeenCalledWith(
        "Selected Building:",
        expect.objectContaining({
          name: "X Building",
          campus: "SGW",
          address: "2080 Mackay Street",
        })
      );
    });
  });

  it("renders search results for AD Building (LOY) and logs its details on click", async () => {
    const { getByTestId, getByText, queryByText, getAllByTestId } = render(
      <FindBuilding />
    );

    await waitFor(
      () => expect(queryByText("Loading buildings...")).toBeNull(),
      { timeout: 2000 }
    );

    // Ensure "Search Results" appears
    await waitFor(() => getByText("Search Results"));

    // Get search input and type "AD"
    const searchInput = getByTestId("search-input");
    fireEvent.changeText(searchInput, "AD");

    // Ensure AD Building appears in the search results
    const buildingItems = await waitFor(() =>
      getAllByTestId("building-item-67aaabc9a89802f0176bad67")
    );
    expect(buildingItems.length).toBeGreaterThan(0);

    // Click the first building item
    fireEvent.press(buildingItems[0]);

    // Ensure building details are logged
    await waitFor(() => {
      expect(console.log).toHaveBeenCalledWith(
        "Selected Building:",
        expect.objectContaining({
          name: "AD Building",
          campus: "LOY",
          address: "7141, Sherbrooke West",
        })
      );
    });
  });

  it("renders search results when searching by partial campus name", async () => {
    const { getByTestId, getByText, getAllByTestId } = render(<FindBuilding />);

    await waitFor(() => expect(getByText("Search Results")).toBeTruthy(), {
      timeout: 3000,
    });

    const searchInput = getByTestId("search-input");
    fireEvent.changeText(searchInput, "LOY");

    const buildingItems = await waitFor(() =>
      getAllByTestId("building-item-67aaabc9a89802f0176bad84")
    );
    expect(buildingItems.length).toBeGreaterThan(0);
  });

  it("renders X Building as search result when typing X", async () => {
    const { getByTestId, getByText, getAllByTestId } = render(<FindBuilding />);

    await waitFor(() => expect(getByText("Search Results")).toBeTruthy(), {
      timeout: 3000,
    });

    const searchInput = getByTestId("search-input");
    fireEvent.changeText(searchInput, "X");

    const buildingItems = await waitFor(() =>
      getAllByTestId("building-item-67aaabc9a89802f0176badaf")
    );
    expect(buildingItems.length).toBeGreaterThan(0);
  });

  it("displays 'No buildings found.' when searching for a non-existing building", async () => {
    const { getByTestId, getByText, queryByText } = render(<FindBuilding />);

    await waitFor(
      () => {
        expect(queryByText("Loading buildings...")).toBeNull();
      },
      { timeout: 3000 }
    );

    // Ensure "Search Results" appears
    await waitFor(() => getByText("Search Results"));

    // Get search input and type a non-existing building name
    const searchInput = getByTestId("search-input");
    fireEvent.changeText(searchInput, "MASASA"); // A string that does not exist in the data

    // Ensure "No buildings found." is displayed
    await waitFor(() => {
      expect(getByText("No buildings found.")).toBeTruthy();
    });
  });
});
function queryByText(arg0: string): any {
  throw new Error("Function not implemented.");
}

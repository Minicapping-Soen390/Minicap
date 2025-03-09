import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import FindBuilding from "../../app/(tabs)/FindBuilding";

jest.spyOn(console, "log").mockImplementation(() => {});

describe("FindBuilding Component", () => {
  it("renders search results for MB Building and logs its details on click", async () => {
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

  it("displays 'No buildings found.' when searching for a non-existing building", async () => {
    const { getByTestId, getByText, queryByText } = render(<FindBuilding />);

    await waitFor(
      () => {
        expect(queryByText("Loading buildings...")).toBeNull();
      },
      { timeout: 2000 }
    );

    // Ensure "Search Results" appears
    await waitFor(() => getByText("Search Results"));

    // Get search input and type a non-existing building name
    const searchInput = getByTestId("search-input");
    fireEvent.changeText(searchInput, "asbsdassda"); // A string that does not exist in the data

    // Ensure "No buildings found." is displayed
    await waitFor(() => {
      expect(getByText("No buildings found.")).toBeTruthy();
    });
  });
});

import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import FindBuilding from "../../app/(tabs)/FindBuilding";

jest.spyOn(console, "log").mockImplementation(() => {});

const setup = async () => {
  const utils = render(<FindBuilding />);
  await waitFor(
    () => expect(utils.queryByText("Loading buildings...")).toBeNull(),
    {
      timeout: 3000,
    }
  );
  await waitFor(() => utils.getByText("Search Results"));
  return utils;
};

const buildingTests = [
  {
    label: "MB Building (SGW)",
    searchText: "MB",
    testId: "building-item-67aaabc9a89802f0176bad8e",
    expectedLog: {
      name: "MB Building",
      campus: "SGW",
      address: "1450 Guy Street",
    },
  },
  {
    label: "X Building (SGW)",
    searchText: "X",
    testId: "building-item-67aaabc9a89802f0176badaf",
    expectedLog: {
      name: "X Building",
      campus: "SGW",
      address: "2080 Mackay Street",
    },
  },
  {
    label: "AD Building (LOY)",
    searchText: "AD",
    testId: "building-item-67aaabc9a89802f0176bad67",
    expectedLog: {
      name: "AD Building",
      campus: "LOY",
      address: "7141, Sherbrooke West",
    },
  },
];

describe("FindBuilding Component", () => {
  buildingTests.forEach(({ label, searchText, testId, expectedLog }) => {
    it(`renders search results for ${label} and logs its details on click`, async () => {
      const { getByTestId, getAllByTestId } = await setup();

      fireEvent.changeText(getByTestId("search-input"), searchText);

      const buildingItems = await waitFor(() => getAllByTestId(testId));
      expect(buildingItems.length).toBeGreaterThan(0);

      fireEvent.press(buildingItems[0]);

      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith(
          "Selected Building:",
          expect.objectContaining(expectedLog)
        );
      });
    });
  });

  it("renders search results when searching by partial campus name", async () => {
    const { getByTestId, getAllByTestId } = await setup();

    fireEvent.changeText(getByTestId("search-input"), "LOY");

    const buildingItems = await waitFor(() =>
      getAllByTestId("building-item-67aaabc9a89802f0176bad84")
    );
    expect(buildingItems.length).toBeGreaterThan(0);
  });

  it("renders X Building as search result when typing X", async () => {
    const { getByTestId, getAllByTestId } = await setup();

    fireEvent.changeText(getByTestId("search-input"), "X");

    const buildingItems = await waitFor(() =>
      getAllByTestId("building-item-67aaabc9a89802f0176badaf")
    );
    expect(buildingItems.length).toBeGreaterThan(0);
  });

  it("displays 'No buildings found.' when searching for a non-existing building", async () => {
    const { getByTestId, getByText } = await setup();

    fireEvent.changeText(getByTestId("search-input"), "MASASA");

    await waitFor(() => {
      expect(getByText("No buildings found.")).toBeTruthy();
    });
  });
});

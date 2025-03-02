import React from "react";
import { render } from "@testing-library/react-native";
import FindBuilding from "../../app/(tabs)/FindBuilding";

describe("FindBuilding Component", () => {
  it("renders correctly", () => {
    const { getByText } = render(<FindBuilding />);

    // Check if "Find Building" text is displayed
    expect(getByText("Find Building")).toBeTruthy();
  });
});

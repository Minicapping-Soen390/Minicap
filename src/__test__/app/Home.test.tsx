import React from "react";
import { render } from "@testing-library/react-native";
import Home from "../../app/(tabs)/Home";

describe("Home Component", () => {
  it("renders correctly", () => {
    const { getByText } = render(<Home />);

    // Check if the welcome message is displayed
    expect(
      getByText("Welcome to the Concordia Student Navigation App")
    ).toBeTruthy();
  });
});

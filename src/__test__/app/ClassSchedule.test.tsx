import React from "react";
import { render } from "@testing-library/react-native";
import ClassSchedule from "../../app/(tabs)/ClassSchedule";

describe("ClassSchedule Component", () => {
  it("renders correctly", () => {
    const { getByText } = render(<ClassSchedule />);

    // Check if "Class Schedule" text is displayed
    expect(getByText("Class Schedule")).toBeTruthy();
  });
});

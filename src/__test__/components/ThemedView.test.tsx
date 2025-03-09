import React from "react";
import { render } from "@testing-library/react-native";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";

jest.mock("@/hooks/useThemeColor", () => ({
  useThemeColor: jest.fn(),
}));

describe("ThemedView Component", () => {
  it("renders with default background color", () => {
    (useThemeColor as jest.Mock).mockReturnValue("blue");

    const { getByTestId } = render(<ThemedView testID="themed-view" />);

    expect(getByTestId("themed-view").props.style).toEqual(
      expect.arrayContaining([{ backgroundColor: "blue" }])
    );
  });

  it("applies light and dark colors correctly", () => {
    (useThemeColor as jest.Mock).mockReturnValue("red");

    const { getByTestId } = render(
      <ThemedView testID="themed-view" lightColor="red" darkColor="black" />
    );

    expect(getByTestId("themed-view").props.style).toEqual(
      expect.arrayContaining([{ backgroundColor: "red" }])
    );
  });

  it("combines custom styles with background color", () => {
    (useThemeColor as jest.Mock).mockReturnValue("green");

    const { getByTestId } = render(
      <ThemedView testID="themed-view" style={{ padding: 10 }} />
    );

    expect(getByTestId("themed-view").props.style).toEqual(
      expect.arrayContaining([{ backgroundColor: "green" }, { padding: 10 }])
    );
  });
});

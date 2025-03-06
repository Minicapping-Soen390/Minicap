import React from "react";
import { render } from "@testing-library/react-native";
import Loader from "../../components/Loader";

jest.mock("@gluestack-ui/themed", () => ({
  Spinner: () => "Spinner",
}));

describe("Loader Component", () => {
  it("does not render when isLoading is false", () => {
    const { queryByTestId } = render(<Loader isLoading={false} />);
    expect(queryByTestId("loader")).toBeNull();
  });

  it("renders correctly when isLoading is true", () => {
    const { getByTestId } = render(<Loader isLoading={true} />);
    expect(getByTestId("loader")).toBeTruthy();
  });
});

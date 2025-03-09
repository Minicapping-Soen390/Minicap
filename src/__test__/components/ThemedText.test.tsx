import * as React from "react";
import renderer from "react-test-renderer";
import { ThemedText } from "../../components/ThemedText";

describe("ThemedText Component", () => {
  it("renders correctly with default type", () => {
    const tree = renderer
      .create(<ThemedText>Default Text</ThemedText>)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("renders correctly with title type", () => {
    const tree = renderer
      .create(<ThemedText type="title">Title Text</ThemedText>)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("renders correctly with defaultSemiBold type", () => {
    const tree = renderer
      .create(<ThemedText type="defaultSemiBold">SemiBold Text</ThemedText>)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("renders correctly with subtitle type", () => {
    const tree = renderer
      .create(<ThemedText type="subtitle">Subtitle Text</ThemedText>)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("renders correctly with link type", () => {
    const tree = renderer
      .create(<ThemedText type="link">Link Text</ThemedText>)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("applies custom styles correctly", () => {
    const tree = renderer
      .create(
        <ThemedText style={{ fontSize: 20, fontWeight: "bold" }}>
          Custom Styled Text
        </ThemedText>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("uses custom light and dark colors", () => {
    const tree = renderer
      .create(
        <ThemedText lightColor="blue" darkColor="red">
          Custom Colors
        </ThemedText>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});

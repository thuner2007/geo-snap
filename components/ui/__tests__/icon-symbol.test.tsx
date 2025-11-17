import React from "react";
import renderer from "react-test-renderer";
import { IconSymbol } from "../icon-symbol";

// Mock MaterialIcons from expo
jest.mock("@expo/vector-icons/MaterialIcons", () => "MaterialIcons");

describe("IconSymbol Component", () => {
  it("should match snapshot with default props", () => {
    const tree = renderer
      .create(<IconSymbol name="house.fill" color="#000000" />)
      .toJSON();

    expect(tree).toMatchSnapshot();
  });

  it("should match snapshot with custom size and color", () => {
    const tree = renderer
      .create(<IconSymbol name="camera.fill" size={32} color="#FF5733" />)
      .toJSON();

    expect(tree).toMatchSnapshot();
  });

  it("should match snapshot with location icon", () => {
    const tree = renderer
      .create(<IconSymbol name="location.fill" size={20} color="#4A90E2" />)
      .toJSON();

    expect(tree).toMatchSnapshot();
  });
});

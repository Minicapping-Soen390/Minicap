import { Dimensions, PixelRatio } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BASE_WIDTH = 375;

export const rem = (value: number): number => {
  return PixelRatio.roundToNearestPixel(value * (SCREEN_WIDTH / BASE_WIDTH));
};

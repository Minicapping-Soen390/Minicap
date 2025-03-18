import { Dimensions, PixelRatio } from "react-native";
import sanitizeHtml from 'sanitize-html';

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BASE_WIDTH = 375;

export const rem = (value: number): number => {
  return PixelRatio.roundToNearestPixel(value * (SCREEN_WIDTH / BASE_WIDTH));
};


export const sanitizeHtmlContent = (html: string): string => {
  return sanitizeHtml(html, {
    allowedTags: [], // Remove all HTML tags
    allowedAttributes: {} // Remove all attributes
  }).trim();
};


export default null;
import { Dimensions, PixelRatio } from "react-native";
import sanitizeHtml from "sanitize-html";

// Get screen width for responsive scaling
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BASE_WIDTH = 375;

/**
 * rem: Converts a value to a responsive pixel size based on screen width.
 * @param value number - base value to scale
 * @returns number - scaled value
 */
export const rem = (value: number): number => {
  return PixelRatio.roundToNearestPixel(value * (SCREEN_WIDTH / BASE_WIDTH));
};

/**
 * sanitizeHtmlContent: Strips all HTML tags and attributes from a string.
 * @param html string - raw HTML input
 * @returns string - plain text
 */
export const sanitizeHtmlContent = (html: string): string => {
  return sanitizeHtml(html, {
    allowedTags: [], // Remove all HTML tags
    allowedAttributes: {}, // Remove all attributes
  }).trim();
};

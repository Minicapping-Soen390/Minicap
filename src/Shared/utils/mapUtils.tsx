import React from "react";
import { LatLng } from "react-native-maps";
import sanitizeHtml from "sanitize-html"; // Safe HTML sanitization function using sanitize-html library

// Export facades from their respective files
export { createMapFacade, createMapUIFacade, isPointInPolygon } from "../facades/MapFacade";
export { createIndoorNavigationFacade } from "../facades/IndoorNavigationFacade";
export { createPOIMapFacade, renderPOIMarkers } from "../facades/POIFacade";

/**
 * Sanitizes HTML content by removing all HTML tags and attributes.
 * @param html - Raw HTML string to be sanitized
 * @returns Clean text string with all HTML tags removed
 */
export const sanitizeHtmlContent = (html: string): string => {
  return sanitizeHtml(html, {
    allowedTags: [], // Remove all HTML tags
    allowedAttributes: {}, // Remove all attributes
  }).trim();
};

/**
 * Decodes a Google Maps encoded polyline string into an array of coordinates.
 * @param encoded - Encoded polyline string from Google Maps API
 * @returns Array of LatLng coordinates representing the decoded path
 */
export const decodePolyline = (encoded: string) => {
  let index = 0;
  const path = [];
  let latitude = 0;
  let longitude = 0;

  while (index < encoded.length) {
    let byte;
    let shift = 0;
    let result = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLat = result & 0x01 ? ~(result >> 1) : result >> 1;
    latitude += deltaLat;

    shift = 0;
    result = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLng = result & 0x01 ? ~(result >> 1) : result >> 1;
    longitude += deltaLng;

    path.push({
      latitude: latitude / 1e5,
      longitude: longitude / 1e5,
    });
  }

  return path;
};

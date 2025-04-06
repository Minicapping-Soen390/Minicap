const path = require('path');
const appJson = require('./app.json');

// Try to get project ID from environment first, then fall back to default
const projectId = process.env.EXPO_PROJECT_ID || '4cdf29b3-adbf-4241-aeb2-cbdcefcbc659';

module.exports = {
  ...appJson.expo,
  android: {
    ...appJson.expo.android,
    config: {
      ...appJson.expo.android.config,
      googleMaps: {
        apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      },
    },
  },
  extra: {
    ...appJson.expo.extra,
    googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
    eas: {
      ...appJson.expo.extra?.eas,
      projectId, // Use the variable defined above
    },
  },
  updates: {
    ...appJson.expo.updates,
    url: `https://u.expo.dev/${projectId}`
  }
};

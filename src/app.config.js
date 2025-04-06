const appJson = require('./app.json');

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
      projectId: process.env.EXPO_PROJECT_ID,
    },
  },
  updates: {
    ...appJson.expo.updates,
    url: `https://u.expo.dev/${process.env.EXPO_PROJECT_ID}`
  }
};

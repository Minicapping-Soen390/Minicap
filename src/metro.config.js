const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Create a default configuration
const defaultConfig = getDefaultConfig(__dirname);

// Update the resolver extensions
defaultConfig.resolver.assetExts = defaultConfig.resolver.assetExts.filter(ext => ext !== 'svg');
defaultConfig.resolver.sourceExts = [...defaultConfig.resolver.sourceExts, 'svg'];

// Try to use svg-transformer if available
let transformer = {};
try {
  const { createSvgTransformer } = require('react-native-svg-transformer');
  transformer = {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  };
} catch (error) {
  console.warn('react-native-svg-transformer not found. SVG files will not be transformed.');
  // Use default transformer if svg transformer isn't available
  transformer = defaultConfig.transformer;
}

// Apply the transformer configuration
defaultConfig.transformer = transformer;

module.exports = defaultConfig;
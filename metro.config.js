const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Required for Expo Router dynamic imports and content loading
config.transformer.unstable_allowRequireContext = true;

// Resolves path aliases (@/*, @content/*, @content-texts/*)
config.resolver.extraNodeModules = {
  '@': `${__dirname}/src`,
  '@content': `${__dirname}/content`,
  '@content-texts': `${__dirname}/content/texts`,
};

module.exports = config;

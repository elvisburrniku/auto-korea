/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  // Add the following to allow accessing files from the shared directory
  watchFolders: [
    // Add path to shared folder outside the mobile directory
    __dirname + '/../shared',
  ],
  resolver: {
    extraNodeModules: {
      'shared': __dirname + '/../shared',
    },
  },
};
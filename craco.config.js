const webpack = require("webpack");

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Add fallbacks for Node.js modules that aren't available in the browser
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };

      // Ignore sql.js warnings about fs module
      webpackConfig.plugins = [
        ...webpackConfig.plugins,
        new webpack.IgnorePlugin({
          resourceRegExp: /^fs$/,
        }),
      ];

      return webpackConfig;
    },
  },
};

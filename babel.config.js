module.exports = function (api) {
  const isProduction = api.env("production");
  api.cache.using(() => isProduction);

  const plugins = ["react-native-reanimated/plugin"];
  if (isProduction) {
    // Strip console.* calls from production/EAS builds. Debug logs left in hot render
    // paths (e.g. tab layout, home screen) run in every build otherwise.
    plugins.unshift(["transform-remove-console", { exclude: ["error", "warn"] }]);
  }

  return {
    presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }]],
    plugins,
  };
};

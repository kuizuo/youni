// Learn more https://docs.expo.io/guides/customizing-metro
const path = require('node:path')

const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro');

module.exports = withMonorepoPaths(
  withNativeWind(getDefaultConfig(__dirname), {
    input: "./global.css",
    configPath: "./tailwind.config.ts",
  }),
);

/**
 * Add the monorepo paths to the Metro config.
 * This allows Metro to resolve modules from the monorepo.
 *
 * @see https://docs.expo.dev/guides/monorepos/#modify-the-metro-config
 * @param {import('expo/metro-config').MetroConfig} config
 * @returns {import('expo/metro-config').MetroConfig}
 */
function withMonorepoPaths(config) {
  const projectRoot = __dirname;
  const workspaceRoot = path.resolve(projectRoot, "../..");

  // #1 - Watch all files in the monorepo
  config.watchFolders = [workspaceRoot];

  // #2 - Resolve modules within the project's `node_modules` first, then all monorepo modules
  config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, "node_modules"),
    path.resolve(workspaceRoot, "node_modules"),
  ];

  return config;
}
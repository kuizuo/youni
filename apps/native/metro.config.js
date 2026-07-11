const { getDefaultConfig } = require("expo/metro-config");
const { withUniwindConfig } = require("uniwind/metro");
const {
	wrapWithReanimatedMetroConfig,
} = require("react-native-reanimated/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);
config.resolver.assetExts.push("wasm");
config.server.enhanceMiddleware = (middleware) => (request, response, next) => {
	response.setHeader("Cross-Origin-Embedder-Policy", "credentialless");
	response.setHeader("Cross-Origin-Opener-Policy", "same-origin");
	return middleware(request, response, next);
};

const uniwindConfig = withUniwindConfig(wrapWithReanimatedMetroConfig(config), {
	cssEntryFile: "./global.css",
	dtsFile: "./uniwind-types.d.ts",
});

module.exports = uniwindConfig;

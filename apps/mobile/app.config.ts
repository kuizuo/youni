import type { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig & { hostUri?: string } => ({
  ...config,
  name: "mobile",
  slug: "youni",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "myapp",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/images/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  assetBundlePatterns: [
    "**/*"
  ],
  ios: {
    bundleIdentifier: "youni.kuizuo.app",
    supportsTablet: true
  },
  android: {
    package: 'youni.kuizuo.app',
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff"
    }
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png"
  },
  extra: {
    eas: {
      projectId: "90ac01d4-6bad-42dd-8a7b-0d7e5ae610d2",
    },
  },
  experiments: {
    tsconfigPaths: true,
    typedRoutes: true,
  },
  plugins: ["expo-router"],
});

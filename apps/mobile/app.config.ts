import type { ConfigContext, ExpoConfig } from 'expo/config'

export default ({ config }: ConfigContext): ExpoConfig & { hostUri?: string } => ({
  // ...config,
  name: 'youni',
  slug: 'youni',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  scheme: 'youni',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  assetBundlePatterns: [
    '**/*',
  ],
  ios: {
    bundleIdentifier: 'com.kuizuo.youni',
    supportsTablet: true,
  },
  android: {
    package: 'com.kuizuo.youni',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/favicon.png',
  },
  extra: {
    eas: {
      projectId: '90ac01d4-6bad-42dd-8a7b-0d7e5ae610d2',
    },
  },
  experiments: {
    tsconfigPaths: true,
    typedRoutes: true,
  },
  plugins: ['expo-router'],
})

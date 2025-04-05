module.exports = {
  expo: {
    name: 'REMIX.AI',
    slug: 'remix-ai',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './src/assets/icon.png',
    userInterfaceStyle: 'automatic',
    splash: {
      image: './src/assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#121212'
    },
    updates: {
      fallbackToCacheTimeout: 0
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.remixai.app",
      buildNumber: "1.0.0"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './src/assets/adaptive-icon.png',
        backgroundColor: '#121212'
      },
      package: "com.remixai.app",
      versionCode: 1
    },
    web: {
      favicon: './src/assets/favicon.png'
    },
    plugins: [
      [
        "expo-av",
        {
          "microphonePermission": "Allow REMIX.AI to access your microphone."
        }
      ]
    ],
    entryPoint: "./src/App.tsx",
    newArchEnabled: true
  }
}

const IS_DEV = process.env.APP_VARIANT === 'development';

export default ({ config }) => {
    if (false) {
      return {
        /* your production config */
      };
    } else {
      return {
        ...config,
        name: IS_DEV ? 'TourneyVision (Dev)' : 'TourneyVision',
        scheme: IS_DEV ? 'com.tourneyvision.dev' : 'com.tourneyvision.prod',
        slug: 'tvis',
        ios: {
          supportsTablet: true,
          bundleIdentifier: IS_DEV ? 'com.tourneyvision.dev' : 'com.tourneyvision.prod',
          buildNumber: '0.0.1',
        },
        android: {
          package: IS_DEV ? 'com.tourneyvision.dev' : 'com.tourneyvision.prod',
          versionCode: 1,
        },
      };
    }
  };
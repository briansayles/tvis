export default ({ config }) => {
    if (process.env.MY_ENVIRONMENT === 'production') {
      return {
        /* your production config */
      };
    } else {
        console.log(config.description)
      return {
        ...config,
      };
    }
  };
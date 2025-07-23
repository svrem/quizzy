const path = require('path');
module.exports = {
  webpack: {
    devServer: (devServerConfig) => {
      devServerConfig.open = false;
      return devServerConfig;
    },
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
};

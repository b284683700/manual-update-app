const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// 配置 resolver 以处理 axios 的 Node.js 模块依赖
config.resolver = {
  ...config.resolver,
  // 为 React Native 环境提供空的 polyfill
  extraNodeModules: {
    assert: require.resolve('assert/'),
    crypto: require.resolve('react-native-quick-crypto'),
    stream: require.resolve('readable-stream'),
    http: require.resolve('stream-http'),
    https: require.resolve('https-browserify'),
    http2: require.resolve('./polyfills/http2.js'),
    os: require.resolve('os-browserify/browser'),
    url: require.resolve('url/'),
    zlib: require.resolve('browserify-zlib'),
    path: require.resolve('path-browserify'),
    util: require.resolve('util/'),
    'follow-redirects': require.resolve('./polyfills/follow-redirects.js'),
    'form-data': require.resolve('./polyfills/form-data.js'),
    'proxy-from-env': require.resolve('./polyfills/proxy-from-env.js'),
  },
  // 确保 axios 使用浏览器版本
  resolverMainFields: ['react-native', 'browser', 'main'],
};

module.exports = config;

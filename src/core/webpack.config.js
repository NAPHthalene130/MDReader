const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/index.ts',
  target: 'web',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'core-bundle.js',
    // The bundle is injected as inline script text in Electron, so Webpack
    // cannot rely on automatic script URL detection for publicPath.
    publicPath: '',
    library: {
      name: 'MDReaderCore',
      type: 'umd',
    },
    globalObject: 'this'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  }
};

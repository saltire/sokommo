const merge = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const { HotModuleReplacementPlugin } = require('webpack');

const common = require('./webpack.common.js');


module.exports = merge(common, {
  mode: 'development',
  entry: {
    index: [
      'webpack-hot-middleware/client',
      path.resolve(__dirname, 'app/index.jsx'),
    ],
  },
  resolve: {
    alias: {
      'react-dom': '@hot-loader/react-dom',
    },
  },
  devtool: 'eval-source-map',
  plugins: [
    new HotModuleReplacementPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[name].css',
    }),
  ],
});

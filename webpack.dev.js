const dotenv = require('dotenv');
const { merge } = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ReactRefreshPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const { HotModuleReplacementPlugin } = require('webpack');

const common = require('./webpack.common.js');


dotenv.config();

module.exports = merge(common, {
  mode: 'development',
  devServer: {
    contentBase: './dist',
    port: process.env.DEV_SERVER_PORT || 8080,
    proxy: { '/api': `http://localhost:${process.env.PORT || 3001}` },
    stats: 'minimal',
  },
  devtool: 'eval-source-map',
  plugins: [
    new HotModuleReplacementPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[name].css',
    }),
    new ReactRefreshPlugin(),
  ],
  stats: 'minimal',
});

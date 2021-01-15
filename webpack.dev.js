const { merge } = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { HotModuleReplacementPlugin } = require('webpack');

const common = require('./webpack.common.js');


module.exports = merge(common, {
  mode: 'development',
  resolve: {
    alias: {
      'react-dom': '@hot-loader/react-dom',
    },
  },
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
  ],
  stats: 'minimal',
});

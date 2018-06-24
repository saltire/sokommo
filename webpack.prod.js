'use strict';

const CleanPlugin = require('clean-webpack-plugin');
const merge = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const common = require('./webpack.common.js');


module.exports = merge(common, {
  mode: 'production',
  plugins: [
    new CleanPlugin(['dist']),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css',
      chunkFilename: '[name].[contenthash].css',
    }),
    new OptimizeCssAssetsPlugin(),
    new UglifyJSPlugin(),
  ],
});

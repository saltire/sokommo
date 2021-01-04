const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const HtmlPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');


module.exports = {
  entry: {
    index: path.resolve(__dirname, 'client/index.jsx'),
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    filename: '[name].[contenthash].js',
    chunkFilename: '[name].[chunkhash].js',
    hashDigestLength: 8,
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.s?css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
      {
        test: /\.(jpe?g|gif|png|svg|eot|otf|ttf|woff2?)$/,
        use: [{
          loader: 'file-loader',
          options: { name: '[name].[contenthash:8].[ext]' },
        }],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  optimization: {
    minimizer: [
      new TerserPlugin(),
      new CssMinimizerPlugin(),
    ],
    splitChunks: { chunks: 'all' },
  },
  plugins: [
    new HtmlPlugin({
      template: path.resolve(__dirname, 'client/index.ejs'),
      favicon: path.resolve(__dirname, 'client/static/favicon.ico'),
    }),
  ],
};

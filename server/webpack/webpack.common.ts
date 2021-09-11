import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import HtmlPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import path from 'path';
import TerserPlugin from 'terser-webpack-plugin';
import { Configuration } from 'webpack';


const config: Configuration = {
  entry: path.resolve(__dirname, '../../client/index.tsx'),
  output: {
    filename: '[name].[contenthash].js',
    chunkFilename: '[name].[chunkhash].js',
    assetModuleFilename: '[name].[contenthash][ext]',
    hashDigestLength: 8,
    path: path.resolve(__dirname, '../../dist'),
    publicPath: '/',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.s?css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
      {
        test: /\.(jpe?g|gif|png|svg|eot|otf|ttf|woff2?)$/,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
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
      template: path.resolve(__dirname, '../../client/index.ejs'),
      favicon: path.resolve(__dirname, '../../client/static/favicon.ico'),
    }),
  ],
};
export default config;

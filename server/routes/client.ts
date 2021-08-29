import express, { Router } from 'express';
import path from 'path';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

import webpackConfig from '../webpack/webpack.dev';


const outputPath = webpackConfig.output?.path || path.resolve(__dirname, '../../dist');
const publicPath = typeof webpackConfig.output?.publicPath === 'string'
  ? webpackConfig.output.publicPath : '/';

const router = Router();
export default router;

if (process.env.NODE_ENV === 'production') {
  // Serve already-compiled webpack content from the dist folder.
  router.use(publicPath, express.static(outputPath));
}
else {
  const compiler = webpack(webpackConfig);

  // Compile webpack content dynamically and serve it from express.
  router.use(webpackDevMiddleware(compiler));

  // Use hot module loading.
  router.use(webpackHotMiddleware(compiler));
}

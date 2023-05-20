import config from '@colyseus/tools';
import { monitor } from '@colyseus/monitor';
import express, { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import path from 'path';

import client from './routes/client';
import LifeRoom from './rooms/LifeRoom';
import SokoRoom from './rooms/SokoRoom';


export default config({
  getId: () => 'Your Colyseus App',

  initializeGameServer: gameServer => {
    gameServer.define('life_room', LifeRoom);
    gameServer.define('soko_room', SokoRoom);
  },

  initializeExpress: app => {
    // Bind @colyseus/monitor
    // It is recommended to protect this route with a password.
    // Read more: https://docs.colyseus.io/tools/monitor/#restrict-access-to-the-panel-using-a-password
    app.use('/colyseus', monitor());

    app.use(morgan('dev'));

    app.use('/', client);

    app.use(express.static(path.resolve(__dirname, '../static')));

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      console.error('Unhandled error:', err);
      res.status(500).send(err.message);
    });
  },

  beforeListen: () => {
    // Before gameServer.listen() is called.
  },
});

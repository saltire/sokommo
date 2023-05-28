import config, { listen } from '@colyseus/tools';
import { monitor } from '@colyseus/monitor';
import MongoStore from 'connect-mongo';
import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import morgan from 'morgan';
import path from 'path';

import { getClient } from './db/client';
import api from './routes/api';
import auth from './routes/auth';
import client from './routes/client';
// import LifeRoom from './rooms/LifeRoom';
import SokoRoom from './rooms/SokoRoom';


const appConfig = config({
  getId: () => 'SokoMMO',

  initializeGameServer: gameServer => {
    // gameServer.define('life_room', LifeRoom);
    gameServer.define('soko_room', SokoRoom);
  },

  initializeExpress: app => {
    // Bind @colyseus/monitor
    // It is recommended to protect this route with a password.
    // Read more: https://docs.colyseus.io/tools/monitor/#restrict-access-to-the-panel-using-a-password
    app.use('/colyseus', monitor());

    app.use(morgan('dev'));
    app.set('trust proxy', 1); // Required for session to work when behind a proxy.
    app.use(session({
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // One week
        secure: false,
      },
      resave: false,
      saveUninitialized: true,
      secret: process.env.SESSION_SECRET || 'soko-1234',
      store: MongoStore.create({
        clientPromise: getClient(),
        collectionName: 'expresssessions',
        stringify: false,
      }),
    }));

    app.use('/api', api);
    app.use('/auth', auth);
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

// Create and listen on 2567 (or PORT environment variable.)
listen(appConfig);

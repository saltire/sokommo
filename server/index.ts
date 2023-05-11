import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import morgan from 'morgan';
import path from 'path';
import { Server } from 'socket.io';

import routes from './routes';

// import life from './io/life';
import soko from './io/soko';


const app = express();
app.use(morgan('dev'));

app.use('/', routes);

app.use(express.static(path.resolve(__dirname, '../static')));

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).send(err.message);
});

const server = http.createServer(app);

const port = process.env.PORT || 3002;
server.listen(port, () => console.log('Listening on port', port));

// io

const io = new Server(server);

// life(io);
soko(io);

import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import morgan from 'morgan';
import path from 'path';
import { Server } from 'socket.io';

import routes from './routes';
import { initializeRows, getNewRows } from './life';


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

const width = 20;
const height = 20;
const density = 0.4;
let rows = initializeRows(width, height, density);

setInterval(() => {
  // io.emit('rows', rows);

  io.emit('cells', rows
    .flatMap((row, y) => row.map((cell, x) => cell && [x, y]))
    .filter(Boolean));

  rows = getNewRows(rows);
}, 250);

io.on('connection', socket => {
  console.log('Got connection');

  socket.on('reset', () => {
    console.log('reset');
    rows = initializeRows(width, height, density);
  });
});

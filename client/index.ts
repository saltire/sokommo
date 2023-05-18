import io from 'socket.io-client';

import './index.scss';
// import lifeClient from './io/life';
import sokoClient from './io/soko';


const socket = io();

// lifeClient(socket);
sokoClient(socket);

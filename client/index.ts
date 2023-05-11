import io from 'socket.io-client';

import './index.scss';
// import life from './life';
import soko from './soko';


const socket = io();

// life(socket);
soko(socket);

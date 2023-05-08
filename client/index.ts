import io from 'socket.io-client';

import './index.scss';
import life from './life';


const socket = io();

life(socket);

import * as Colyseus from 'colyseus.js';

import './index.scss';
// import lifeClient from './colyseus/life';
import sokoClient from './colyseus/soko';


const client = new Colyseus.Client('ws://localhost:2567');

// lifeClient(client);
sokoClient(client);

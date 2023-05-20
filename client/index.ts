import * as Colyseus from 'colyseus.js';

import './index.scss';
// import lifeClient from './colyseus/life';
import sokoClient from './colyseus/soko';


const { protocol, host } = window.location;

const client = new Colyseus.Client(`${protocol.replace('http', 'ws')}//${host}`);

// lifeClient(client);
sokoClient(client);

import { useEffect } from 'react';
import * as Colyseus from 'colyseus.js';

import './index.scss';
// import life from './colyseus/life';
import soko from './colyseus/soko';


const { protocol, host } = window.location;

export default function App() {
  useEffect(() => {
    const client = new Colyseus.Client(`${protocol.replace('http', 'ws')}//${host}`);

    // life(client);
    soko(client);
  }, []);

  return (
    <div id='grid' />
  );
}

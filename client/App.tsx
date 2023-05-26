import { useEffect, useRef } from 'react';
import { Client } from 'colyseus.js';

import './App.scss';
import { setupSokoClient, handleInput } from './lib/sokoClient';
import { SokoRoomState } from '../server/lib/sokoServer';


const { protocol, host } = window.location;

export default function App() {
  const grid = useRef<HTMLDivElement>(null);
  const client = useRef<Client | null>(null);

  useEffect(() => {
    if (grid.current && !client.current) {
      client.current = new Client(`${protocol.replace('http', 'ws')}//${host}`);

      client.current.joinOrCreate<SokoRoomState>('soko_room')
        .then(room => {
          if (grid.current) {
            setupSokoClient(room.state, grid.current);
            handleInput(room);
          }
        })
        .catch(e => {
          console.error('JOIN ERROR', e);
        });
    }
  }, [grid.current, client.current]);

  return (
    <div className='App'>
      <div ref={grid} />
    </div>
  );
}

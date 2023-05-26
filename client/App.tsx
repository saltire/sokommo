import { useEffect, useState } from 'react';
import { Client, Room } from 'colyseus.js';

import './App.scss';
import Game from './Game';
import { SokoRoomState } from '../server/lib/sokoServer';


const { protocol, host } = window.location;
const client = new Client(`${protocol.replace('http', 'ws')}//${host}`);

export default function App() {
  const [showGame, setShowGame] = useState(true);
  const [room, setRoom] = useState<Room<SokoRoomState> | null>(null);

  useEffect(() => {
    if (showGame && !room) {
      client.joinOrCreate<SokoRoomState>('soko_room')
        .then(room => setRoom(room))
        .catch(e => console.error('Join error:', e));
    }
    else if (!showGame && room) {
      room.leave()
        .then(() => setRoom(null))
        .catch(e => console.error('Leave error:', e));
    }
  }, [showGame, room]);

  return (
    <div className='App'>
      <div>
        <input
          type='checkbox'
          checked={showGame}
          disabled={!!showGame !== !!room}
          onChange={e => setShowGame(e.target.checked)}
        />
      </div>

      {!!(showGame && room) && <Game room={room} />}
    </div>
  );
}

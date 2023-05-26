import { useEffect, useState } from 'react';
import { Client, Room } from 'colyseus.js';

import './App.scss';
import Game from './Game';
import { PlayerData, SokoRoomState } from '../server/lib/sokoServer';
import Login from './Login';


const { protocol, host } = window.location;
const client = new Client(`${protocol.replace('http', 'ws')}//${host}`);

export default function App() {
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [room, setRoom] = useState<Room<SokoRoomState> | null>(null);

  useEffect(() => {
    if (playerData && !room) {
      client.joinOrCreate<SokoRoomState>('soko_room', playerData)
        .then(room => setRoom(room))
        .catch(e => console.error('Join error:', e));
    }
    else if (!playerData && room) {
      room.leave()
        .then(() => setRoom(null))
        .catch(e => console.error('Leave error:', e));
    }
  }, [playerData, room]);

  return (
    <div className='App'>
      {!playerData ? (
        <Login onLogin={data => setPlayerData(data)} />
      ) : (
        !room ? <p>Joining...</p> : <Game room={room} />
      )}
    </div>
  );
}

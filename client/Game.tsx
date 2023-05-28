import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Room } from 'colyseus.js';

import './Game.scss';
import { setupSokoClient, handleInput, GameInfo } from './lib/sokoClient';
import { SokoRoomState } from '../server/rooms/SokoRoom';

import bombImgUrl from './static/bomb.png';


const pickupImgUrls: { [index: string]: string } = {
  Bomb: bombImgUrl,
};

type GameProps = {
  room: Room<SokoRoomState>,
  onQuit: () => void,
};

export default function Game({ room, onQuit }: GameProps) {
  const grid = useRef<HTMLDivElement>(null);

  const [info, setInfo] = useState<GameInfo>({
    players: [],
  });
  const updateInfo = useCallback((update: Partial<GameInfo>) => setInfo(
    prev => ({ ...prev, ...update })), []);
  const player = useMemo(() => info.players.find(p => p.id === room.sessionId),
    [info.players, room]);

  useEffect(() => {
    if (!grid.current) {
      return undefined;
    }

    setupSokoClient(room, grid.current, updateInfo);
    const cleanup = handleInput(room);

    return () => {
      cleanup();
    };
  }, [grid, room, updateInfo]);

  return (
    <div className='Game'>
      <header>
        <span className='title'>SokoMMO</span>

        <div className='right'>
          <button type='button' onClick={onQuit}>Quit</button>
        </div>
      </header>

      {!!info.players.length && (
        <ul className='players'>
          {info.players.map(p => (
            <li key={p.id}>
              <span className='rank'>{p.rank}.</span>
              <span className='name' style={{ color: `#${p.color}` }}>{p.name}</span>
              <strong className='yellow'>{p.coins}</strong>
            </li>
          ))}
        </ul>
      )}

      {info.pickupItem?.pickupName && (
        <div className='pickup'>
          <img src={pickupImgUrls[info.pickupItem.pickupName]} alt={info.pickupItem.pickupName} />
          <p className='name'><strong>{info.pickupItem.pickupName}</strong></p>
          {/* <p>Pickup: <strong>E</strong></p> */}
        </div>
      )}

      <div className='grid-container'>
        <div ref={grid} />
      </div>

      <footer>
        {player && (
          <p>
            <span>Rank: <strong className='orange'>{player.rank}</strong></span>
            <span>Coins: <strong className='yellow'>{player.coins}</strong></span>
          </p>
        )}
      </footer>
    </div>
  );
}

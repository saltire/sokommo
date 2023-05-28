import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Room } from 'colyseus.js';

import './Game.scss';
import { setupSokoClient, handleInput, GameInfo } from './lib/sokoClient';
import { PlayerData, SokoRoomState } from '../server/rooms/SokoRoom';

import bombImgUrl from './static/bomb.png';


const pickupImgUrls: { [index: string]: string } = {
  Bomb: bombImgUrl,
};

type GameProps = {
  room: Room<SokoRoomState>,
  playerData: PlayerData,
  onQuit: () => void,
};

export default function Game({ room, playerData, onQuit }: GameProps) {
  const grid = useRef<HTMLDivElement>(null);

  const [info, setInfo] = useState<GameInfo>({
    players: [],
  });
  const updateInfo = useCallback(
    (update: Partial<GameInfo> | ((prevInfo: GameInfo) => Partial<GameInfo>)) => setInfo(
      prev => ({ ...prev, ...typeof update === 'function' ? update(prev) : update })), []);
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

      {info.deadPlayer && (
        <div className='dead-player-overlay'>
          <div className='dead-player'>
            <h1>You died!</h1>

            <p>Rank: <strong className='orange'>{info.deadPlayer.rank}</strong></p>
            <p>Coins: <strong className='yellow'>{info.deadPlayer.coins}</strong></p>

            <p>
              <button
                type='button'
                onClick={() => {
                  room.send('rejoin', playerData);
                  updateInfo({ deadPlayer: undefined });
                }}
              >
                Play again
              </button>
            </p>
            <p><button type='button' onClick={onQuit}>Quit</button></p>
          </div>
        </div>
      )}

      {info.heldItem?.itemName && (
        <div className='inventory'>
          <img src={pickupImgUrls[info.heldItem.itemName]} alt={info.heldItem.itemName} />
          <p className='name'><strong>{info.heldItem.itemName}</strong></p>
          <p>Use: <strong>F</strong></p>
          <p>{info.pickupItem ? 'Swap' : 'Drop'}: <strong>E</strong></p>
        </div>
      )}

      {info.pickupItem?.itemName && (
        <div className='pickup'>
          <img src={pickupImgUrls[info.pickupItem.itemName]} alt={info.pickupItem.itemName} />
          <p className='name'><strong>{info.pickupItem.itemName}</strong></p>
          <p> </p>
          <p>{info.heldItem ? 'Swap' : 'Pick up'}: <strong>E</strong></p>
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

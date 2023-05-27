import { useCallback, useEffect, useRef, useState } from 'react';
import { Room } from 'colyseus.js';

import './Game.scss';
import { setupSokoClient, handleInput, GameInfo } from './lib/sokoClient';
import { SokoRoomState } from '../server/rooms/SokoRoom';


type GameProps = {
  room: Room<SokoRoomState>,
  onQuit: () => void,
};

export default function Game({ room, onQuit }: GameProps) {
  const grid = useRef<HTMLDivElement>(null);
  const [info, setInfo] = useState<GameInfo>({
    coins: 0,
  });
  const updateInfo = useCallback((update: Partial<GameInfo>) => setInfo(
    prev => ({ ...prev, ...update })), []);

  useEffect(() => {
    if (!grid.current) {
      return undefined;
    }

    setupSokoClient(room, grid.current, updateInfo);
    const cleanup = handleInput(room);

    return () => {
      cleanup();
    };
  }, [grid, room]);

  return (
    <div className='Game'>
      <header>
        <span className='title'>SokoMMO</span>

        <div className='right'>
          <button type='button' onClick={onQuit}>Quit</button>
        </div>
      </header>

      <div className='grid-container'>
        <div ref={grid} />
      </div>

      <footer>
        <p>Coins: <strong className='yellow'>{info.coins}</strong></p>
      </footer>
    </div>
  );
}

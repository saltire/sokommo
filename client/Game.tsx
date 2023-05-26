import { useEffect, useRef, useState } from 'react';
import { Room } from 'colyseus.js';

import './Game.scss';
import { setupSokoClient, handleInput } from './lib/sokoClient';
import { SokoRoomState } from '../server/lib/sokoServer';


type GameProps = {
  room: Room<SokoRoomState>,
};

export default function Game({ room }: GameProps) {
  const grid = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!grid.current) {
      return;
    }

    setupSokoClient(room.state, grid.current);
    const cleanup = handleInput(room);

    return () => {
      cleanup();
    };
  }, [grid, room]);

  return (
    <div className='Game'>
      <div ref={grid} />
    </div>
  );
}

import { Room } from 'colyseus.js';
import Konva from 'konva';

import { SokoRoomState, Player } from '../../server/lib/sokoServer';


// Set up stage and layers

const stage = new Konva.Stage({
  container: 'grid',
});

const grid = new Konva.Layer({
  listening: false,
});
stage.add(grid);

const players = new Konva.Layer({
  listening: false,
  visible: false,
});
stage.add(players);


// Cell size

let cellSize = 30;
const cellPos = (cells: number) => cells * (cellSize + 1) + 1;


// Player event handlers

const addPlayer = (player: Player) => {
  players.add(new Konva.Rect({
    id: player.id,
    x: cellPos(player.x),
    y: cellPos(player.y),
    width: cellSize,
    height: cellSize,
    fill: player.color,
  }));
};

const updatePlayer = (player: Player) => {
  players.findOne(`#${player.id}`).to({
    x: cellPos(player.x),
    y: cellPos(player.y),
    duration: 0.05,
  });
};

const removePlayer = (player: Player) => {
  players.findOne(`#${player.id}`).destroy();
};


// Environmental functions

const drawGrid = (gridWidth: number, gridHeight: number) => {
  players.visible(false);
  grid.destroyChildren();
  for (let y = 0; y < gridHeight; y += 1) {
    for (let x = 0; x < gridWidth; x += 1) {
      grid.add(new Konva.Rect({
        x: cellPos(x),
        y: cellPos(y),
        width: cellSize + 1,
        height: cellSize + 1,
        stroke: 'black',
        strokeWidth: 1,
      }));
    }
  }
  players.visible(true);
};

const drawPlayers = (state: SokoRoomState) => {
  players.destroyChildren();
  state.players.forEach(player => addPlayer(player));
};

const updateSize = (
  state: SokoRoomState, viewWidth: number, viewHeight: number,
) => {
  const maxCellWidth = Math.floor((viewWidth - 1) / state.width) - 1;
  const maxCellHeight = Math.floor((viewHeight - 1) / state.height) - 1;
  const newCellSize = Math.max(5, Math.min(50, Math.min(maxCellWidth, maxCellHeight)));

  if (newCellSize !== cellSize) {
    cellSize = newCellSize;

    stage.size({
      width: cellPos(state.width),
      height: cellPos(state.height),
    });
    drawGrid(state.width, state.height);
    drawPlayers(state);
  }
};


// Initial setup

/* eslint-disable import/prefer-default-export */
export const setupSokoClient = (state: SokoRoomState) => {
  // Set up state events

  state.players.onAdd(player => {
    addPlayer(player);
    player.onChange(() => updatePlayer(player));
  });

  state.players.onRemove(player => {
    removePlayer(player);
  });

  // Set up resize observer

  let debounceTimeout: any;
  const observer = new ResizeObserver(entries => {
    entries.forEach(entry => {
      entry.contentBoxSize.forEach(boxSize => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
          updateSize(state, boxSize.inlineSize, boxSize.blockSize);
        }, 200);
      });
    });
  });

  // Once we have grid size from state, start triggering draw events on window resize.
  state.listen('width', () => {
    observer.observe(document.body);
  });
};


// Input handling

const dirKeys = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'];

export const handleInput = (room: Room<SokoRoomState>) => {
  document.body.addEventListener('keyup', e => {
    if (dirKeys.includes(e.key)) {
      room.send('move', dirKeys.indexOf(e.key));
    }
  });
};

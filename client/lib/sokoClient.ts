import { Room } from 'colyseus.js';
import Konva from 'konva';

import { SokoRoomState, Bomb, Crate, Player } from '../../server/rooms/SokoRoom';


let stage: Konva.Stage;
let grid: Konva.Layer;
let items: Konva.Layer;

const moveDuration = 0.05;


// Cell size

const minCellSize = 5;
const maxCellSize = 60;
let cellSize = 30;
const cellPos = (cells: number) => cells * (cellSize + 1) + 1;


// Player event handlers

const addPlayer = (player: Player) => {
  const playerGroup = new Konva.Group({
    id: player.id,
    width: cellSize,
    height: cellSize,
    x: cellPos(player.x),
    y: cellPos(player.y),
  });

  // Rotating group

  const playerRotGroup = new Konva.Group({
    name: 'rot',
    rotation: player.rot * 90,
  });
  playerGroup.add(playerRotGroup);

  playerRotGroup.add(new Konva.Rect({
    width: cellSize * 0.35,
    height: cellSize * 0.35,
    fill: `#${player.color}`,
    rotation: -135,
  }));

  // Non-rotating group

  playerGroup.add(new Konva.Circle({
    radius: cellSize * 0.35,
    fill: `#${player.color}`,
  }));

  // Clip group

  if (player.imageUrl) {
    const imageGroup = new Konva.Group({
      clipFunc: ctx => ctx.arc(0, 0, cellSize * 0.3, 0, Math.PI * 2),
    });
    playerGroup.add(imageGroup);

    const image = new Image();
    image.onload = () => {
      imageGroup.add(new Konva.Image({
        image,
        width: cellSize * 0.6,
        height: cellSize * 0.6,
        x: -cellSize * 0.3,
        y: -cellSize * 0.3,
      }));
    };
    image.src = player.imageUrl;
  }

  items.add(playerGroup);
};

const updatePlayer = (player: Player) => {
  const playerGroup = items.findOne<Konva.Group>(`#${player.id}`);
  if (playerGroup) {
    playerGroup.to({
      x: cellPos(player.x),
      y: cellPos(player.y),
      duration: moveDuration,
    });

    playerGroup.findOne('.rot')?.to({
      rotation: player.rot * 90,
      duration: moveDuration,
    });
  }
};

const removePlayer = (player: Player) => {
  items.findOne(`#${player.id}`)?.destroy();
};


// Crate event handlers

const addCrate = (crate: Crate) => {
  items.add(new Konva.Rect({
    id: crate.id,
    width: cellSize * 0.9,
    height: cellSize * 0.9,
    x: cellPos(crate.x) - cellSize * 0.45,
    y: cellPos(crate.y) - cellSize * 0.45,
    fill: '#f3722c',
  }));
};

const updateCrate = (crate: Crate) => {
  const crateObj = items.findOne<Konva.Rect>(`#${crate.id}`);
  if (crateObj) {
    crateObj.to({
      x: cellPos(crate.x) - cellSize * 0.45,
      y: cellPos(crate.y) - cellSize * 0.45,
      duration: moveDuration,
    });
  }
};


// Bomb event handlers

const addBomb = (bomb: Bomb) => {
  items.add(new Konva.Circle({
    id: bomb.id,
    radius: cellSize * 0.3,
    x: cellPos(bomb.x),
    y: cellPos(bomb.y),
    fill: '#577590',
  }));
};


// Environmental functions

const drawGrid = (gridWidth: number, gridHeight: number) => {
  items.visible(false);
  grid.destroyChildren();
  for (let y = 0; y < gridHeight; y += 1) {
    for (let x = 0; x < gridWidth; x += 1) {
      grid.add(new Konva.Rect({
        x: cellPos(x),
        y: cellPos(y),
        width: cellSize + 1,
        height: cellSize + 1,
        offsetX: cellSize * 0.5,
        offsetY: cellSize * 0.5,
        stroke: 'black',
        strokeWidth: 1,
      }));
    }
  }
  items.visible(true);
};

const drawItems = (state: SokoRoomState) => {
  items.destroyChildren();
  state.players.forEach(addPlayer);
  state.crates.forEach(addCrate);
  state.bombs.forEach(addBomb);
};

const updateSize = (
  state: SokoRoomState, viewWidth: number, viewHeight: number,
) => {
  const maxCellWidth = Math.floor((viewWidth - 1) / state.width) - 1;
  const maxCellHeight = Math.floor((viewHeight - 1) / state.height) - 1;
  const newCellSize = Math.max(minCellSize, Math.min(maxCellSize,
    Math.min(maxCellWidth, maxCellHeight)));

  if (newCellSize !== cellSize) {
    cellSize = newCellSize;

    stage.setAttrs({
      width: cellPos(state.width),
      height: cellPos(state.height),
      offsetX: -cellSize * 0.5,
      offsetY: -cellSize * 0.5,
    });
    drawGrid(state.width, state.height);
    drawItems(state);
  }
};


// Initial setup

export const setupSokoClient = (state: SokoRoomState, element: HTMLDivElement) => {
  // Set up stage and layers

  stage = new Konva.Stage({
    container: element,
  });

  grid = new Konva.Layer({
    listening: false,
  });
  stage.add(grid);

  items = new Konva.Layer({
    listening: false,
    visible: false,
  });
  stage.add(items);

  // Set up state events

  state.players.onAdd(player => {
    addPlayer(player);
    player.onChange(() => updatePlayer(player));
  });

  state.players.onRemove(player => {
    removePlayer(player);
  });

  state.crates.onAdd(crate => {
    addCrate(crate);
    crate.onChange(() => updateCrate(crate));
  });

  state.bombs.onAdd(bomb => {
    addBomb(bomb);
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
    if (element.parentElement) {
      observer.observe(element.parentElement);
    }
  });
};


// Input handling

const dirKeys = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'];

export const handleInput = (room: Room<SokoRoomState>) => {
  const onKeyUp = (e: KeyboardEvent) => {
    if (dirKeys.includes(e.key)) {
      room.send('move', dirKeys.indexOf(e.key));
    }
  };

  document.body.addEventListener('keyup', onKeyUp);

  return () => {
    document.body.removeEventListener('keyup', onKeyUp);
  };
};

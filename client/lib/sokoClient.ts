import { Room } from 'colyseus.js';
import Konva from 'konva';

import { SokoRoomState, Bomb, Coin, Crate, Item, Player } from '../../server/rooms/SokoRoom';


export type GameInfo = {
  players: (Pick<Player, 'id' | 'name' | 'color' | 'coins'> & {
    rank: number,
  })[],
};

let stage: Konva.Stage;
let grid: Konva.Layer;
let items: Konva.Layer;

const moveDuration = 0.075; // s
const moveCooldown = 250; // ms

const clamp = (num: number, min: number, max: number) => Math.max(min, Math.min(max, num));


// Cell size

const minViewCells = 16;
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

  playerGroup.add(new Konva.Text({
    text: player.name,
    fontFamily: 'Figtree',
    fontSize: 15,
    fontStyle: 'bold',
    align: 'center',
    x: -cellSize * 1.5,
    y: -cellSize * 0.8,
    width: cellSize * 3,
    height: cellSize * 0.5,
    fill: `#${player.color}`,
    stroke: 'white',
    strokeWidth: 5,
    lineJoin: 'round',
    fillAfterStrokeEnabled: true,
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


// Bomb event handlers

const addBomb = (bomb: Bomb) => {
  const bombObj = new Konva.Circle({
    id: bomb.id,
    radius: cellSize * 0.3,
    x: cellPos(bomb.x),
    y: cellPos(bomb.y),
    fill: '#577590',
  });
  items.add(bombObj);
};


// Coin event handlers

const addCoin = (coin: Coin) => {
  const coinGroup = new Konva.Group({
    id: coin.id,
    x: cellPos(coin.x),
    y: cellPos(coin.y),
  });

  coinGroup.add(new Konva.Circle({
    id: coin.id,
    radius: cellSize * 0.3,
    x: 0,
    y: cellSize * 0.05,
    fill: '#f8961e',
  }));
  coinGroup.add(new Konva.Circle({
    id: coin.id,
    radius: cellSize * 0.3,
    x: 0,
    y: -cellSize * 0.05,
    fill: '#f9c74f',
  }));

  items.add(coinGroup);
  coinGroup.zIndex(1);
};


// Crate event handlers

const addCrate = (crate: Crate) => {
  const crateGroup = new Konva.Group({
    id: crate.id,
    width: cellSize,
    height: cellSize,
    x: cellPos(crate.x),
    y: cellPos(crate.y),
  });

  crateGroup.add(new Konva.Rect({
    width: cellSize * 0.9,
    height: cellSize * 0.9,
    x: -cellSize * 0.45,
    y: -cellSize * 0.45,
    fill: '#f8961e',
  }));
  crateGroup.add(new Konva.Rect({
    width: cellSize * 0.9,
    height: cellSize * 0.3,
    x: -cellSize * 0.45,
    y: cellSize * 0.15,
    fill: '#f3722c',
  }));

  items.add(crateGroup);
  crateGroup.zIndex(0);
};

const updateCrate = (crate: Crate) => {
  const crateObj = items.findOne<Konva.Rect>(`#${crate.id}`);
  if (crateObj) {
    crateObj.to({
      x: cellPos(crate.x),
      y: cellPos(crate.y),
      duration: moveDuration,
    });
  }
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
  state.coins.forEach(addCoin);
};

const removeItem = (item: Item) => {
  items.findOne(`#${item.id}`)?.destroy();
};

const updateSize = (
  room: Room<SokoRoomState>, viewWidth: number, viewHeight: number,
) => {
  const maxCellWidth = Math.floor((viewWidth - 1) / minViewCells) - 1;
  const maxCellHeight = Math.floor((viewHeight - 1) / minViewCells) - 1;
  cellSize = clamp(Math.min(maxCellWidth, maxCellHeight), minCellSize, maxCellSize);

  const player = room.state.players.get(room.sessionId)!;

  stage.setAttrs({
    width: viewWidth,
    height: viewHeight,
    offsetX: cellPos(player.x) - (viewWidth / 2),
    offsetY: cellPos(player.y) - (viewHeight / 2),
  });
  drawGrid(room.state.width, room.state.height);
  drawItems(room.state);
};

const updateOffset = (player: Player) => {
  const playerX = cellPos(player.x) - (stage.width() / 2);
  const playerY = cellPos(player.y) - (stage.height() / 2);

  stage.to({
    offsetX: clamp(stage.offsetX(), playerX - stage.width() / 6, playerX + stage.width() / 6),
    offsetY: clamp(stage.offsetY(), playerY - stage.height() / 6, playerY + stage.height() / 6),
    duration: moveDuration,
  });
};


// Initial setup

export const setupSokoClient = (
  room: Room<SokoRoomState>, element: HTMLDivElement,
  updateInfo: (update: Partial<GameInfo>) => void,
) => {
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

  const updatePlayerList = () => {
    const playerList = Array.from(room.state.players.values())
      .map(player => ({
        id: player.id,
        name: player.name,
        color: player.color,
        coins: player.coins,
      }))
      .sort((a, b) => b.coins - a.coins
        || (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1))
      .map((player, i) => ({
        ...player,
        rank: i + 1,
      }));

    updateInfo({
      players: playerList.map((player, i) => ({
        ...player,
        rank: player.coins === playerList[i - 1]?.coins ? playerList[i - 1].rank : player.rank,
      })),
    });
  };

  room.state.players.onAdd(player => {
    addPlayer(player);
    player.listen('x', () => updatePlayer(player));
    player.listen('y', () => updatePlayer(player));
    player.listen('rot', () => updatePlayer(player));

    if (player.id === room.sessionId) {
      player.listen('coins', () => updatePlayerList());
      player.listen('x', () => updateOffset(player));
      player.listen('y', () => updateOffset(player));
    }
    updatePlayerList();
  });
  room.state.players.onRemove(player => {
    removeItem(player);
    updatePlayerList();
  });

  room.state.bombs.onAdd(bomb => {
    addBomb(bomb);
  });

  room.state.coins.onAdd(coin => {
    addCoin(coin);
  });
  room.state.coins.onRemove(coin => {
    setTimeout(() => removeItem(coin), moveDuration * 1000);
  });

  room.state.crates.onAdd(crate => {
    addCrate(crate);
    crate.onChange(() => updateCrate(crate));
  });

  // Set up resize observer

  let debounceTimeout: any;
  const observer = new ResizeObserver(entries => {
    entries.forEach(entry => {
      entry.contentBoxSize.forEach(boxSize => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
          updateSize(room, boxSize.inlineSize, boxSize.blockSize);
        }, 200);
      });
    });
  });

  // Once we have grid size from state, start triggering draw events on window resize.
  room.state.listen('width', () => {
    if (element.parentElement) {
      observer.observe(element.parentElement);
    }
  });
};


// Input handling

const dirKeys = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'];

export const handleInput = (room: Room<SokoRoomState>) => {
  let dir: number | null = null;
  let interval: any;

  const onKeyDown = (e: KeyboardEvent) => {
    if (dir === null && dirKeys.includes(e.key)) {
      dir = dirKeys.indexOf(e.key);
      room.send('move', dir);
      interval = setInterval(() => room.send('move', dir), moveCooldown);
    }
  };

  const onKeyUp = (e: KeyboardEvent) => {
    if (dir !== null && dirKeys.includes(e.key) && dir === dirKeys.indexOf(e.key)) {
      clearInterval(interval);
      dir = null;
    }
  };

  document.body.addEventListener('keydown', onKeyDown);
  document.body.addEventListener('keyup', onKeyUp);

  return () => {
    document.body.removeEventListener('keydown', onKeyDown);
    document.body.removeEventListener('keyup', onKeyUp);
  };
};

import { Room } from 'colyseus.js';
import Konva from 'konva';

import {
  SokoRoomState, Bomb, Coin, Crate, Explosion, Item, Player, Wall,
} from '../../server/rooms/SokoRoom';

import bombSpriteUrl from '../static/bomb-sprite.png';
import coinImgUrl from '../static/coin.png';
import crateImgUrl from '../static/crate.png';
import explosionImgUrl from '../static/explosion.png';
import wallImgUrl from '../static/wall.png';


type PlayerInfo = Pick<Player, 'id' | 'name' | 'color' | 'coins'> & {
  rank: number,
};

export type GameInfo = {
  players: PlayerInfo[],
  deadPlayer?: PlayerInfo,
  pickupItem?: Item,
  heldItem?: Item,
};

let stage: Konva.Stage;
let grid: Konva.Layer;
let items: Konva.Layer;

let bombs: Konva.Group;
let coins: Konva.Group;
let crates: Konva.Group;
let players: Konva.Group;
let walls: Konva.Group;

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

  players.add(playerGroup);
};

const updatePlayer = (player: Player) => {
  const playerGroup = items.findOne<Konva.Group>(`#${player.id}`);
  playerGroup?.to({
    x: cellPos(player.x),
    y: cellPos(player.y),
    duration: moveDuration,
  });

  playerGroup?.findOne('.rot')?.to({
    rotation: player.rot * 90,
    duration: moveDuration,
  });
};


// Bomb event handlers

const bombSprite = new Image();
bombSprite.src = bombSpriteUrl;

const addBomb = (bomb: Bomb) => {
  const bombObj = new Konva.Sprite({
    id: bomb.id,
    scaleX: (cellSize * 0.8) / 64,
    scaleY: (cellSize * 0.8) / 64,
    width: cellSize * 0.8,
    height: cellSize * 0.8,
    x: cellPos(bomb.x) - cellSize * 0.4,
    y: cellPos(bomb.y) - cellSize * 0.4,
    image: bombSprite,
    animation: bomb.hot ? 'hot' : 'cold',
    animations: {
      cold: [
        0, 0, 64, 64,
      ],
      hot: [
        64, 0, 64, 64,
        128, 0, 64, 64,
        192, 0, 64, 64,
        256, 0, 64, 64,
        192, 0, 64, 64,
        128, 0, 64, 64,
      ],
    },
    frameRate: 10,
  });
  if (bomb.hot) {
    bombObj.start();
  }
  bombs.add(bombObj);
};

const updateBomb = (bomb: Bomb) => {
  const bombObj = items.findOne<Konva.Sprite>(`#${bomb.id}`);
  bombObj?.animation(bomb.hot ? 'hot' : 'cold');
  if (bomb.hot) {
    bombObj?.start();
  }
};


// Coin event handlers

const coinImg = new Image();
coinImg.src = coinImgUrl;

const addCoin = (coin: Coin) => {
  coins.add(new Konva.Image({
    id: coin.id,
    image: coinImg,
    width: cellSize * 0.8,
    height: cellSize * 0.8,
    x: cellPos(coin.x) - cellSize * 0.4,
    y: cellPos(coin.y) - cellSize * 0.4,
  }));
};


// Crate event handlers

const crateImg = new Image();
crateImg.src = crateImgUrl;

const addCrate = (crate: Crate) => {
  crates.add(new Konva.Image({
    id: crate.id,
    image: crateImg,
    width: cellSize * 0.9,
    height: cellSize * 0.9,
    x: cellPos(crate.x) - cellSize * 0.45,
    y: cellPos(crate.y) - cellSize * 0.45,
  }));
};

const updateCrate = (crate: Crate) => {
  const crateObj = items.findOne<Konva.Rect>(`#${crate.id}`);
  crateObj?.to({
    x: cellPos(crate.x) - cellSize * 0.45,
    y: cellPos(crate.y) - cellSize * 0.45,
    duration: moveDuration,
  });
};


// Explosion event handlers

const explosionImg = new Image();
explosionImg.src = explosionImgUrl;

const addExplosion = (explosion: Explosion) => {
  const explosionObj = new Konva.Image({
    id: explosion.id,
    image: explosionImg,
    width: cellSize * 0.9,
    height: cellSize * 0.9,
    x: cellPos(explosion.x) - cellSize * 0.45,
    y: cellPos(explosion.y) - cellSize * 0.45,
  });
  items.add(explosionObj);
  explosionObj.to({
    opacity: 0,
    duration: 1,
  });
};


// Wall event handlers

const wallImg = new Image();
wallImg.src = wallImgUrl;

const addWall = (wall: Wall) => {
  walls.add(new Konva.Image({
    id: wall.id,
    image: wallImg,
    width: cellSize,
    height: cellSize,
    x: cellPos(wall.x) - cellSize * 0.5,
    y: cellPos(wall.y) - cellSize * 0.5,
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

const createGroups = () => {
  // This will be the sorting order.
  walls = new Konva.Group();
  items.add(walls);
  coins = new Konva.Group();
  items.add(coins);
  bombs = new Konva.Group();
  items.add(bombs);
  crates = new Konva.Group();
  items.add(crates);
  players = new Konva.Group();
  items.add(players);
};

const drawItems = (state: SokoRoomState) => {
  items.destroyChildren();
  createGroups();

  state.bombs.forEach(addBomb);
  state.coins.forEach(addCoin);
  state.crates.forEach(addCrate);
  state.players.forEach(addPlayer);
  state.walls.forEach(addWall);
};

const removeItem = (item: Item) => {
  items.findOne(`#${item.id}`)?.destroy();
};

let lastPlayerX = 0;
let lastPlayerY = 0;

const updateSize = (
  room: Room<SokoRoomState>, viewWidth: number, viewHeight: number,
) => {
  const maxCellWidth = Math.floor((viewWidth - 1) / minViewCells) - 1;
  const maxCellHeight = Math.floor((viewHeight - 1) / minViewCells) - 1;
  cellSize = clamp(Math.min(maxCellWidth, maxCellHeight), minCellSize, maxCellSize);

  const player = room.state.players.get(room.sessionId);
  if (player) {
    lastPlayerX = player.x;
    lastPlayerY = player.y;
  }

  stage.setAttrs({
    width: viewWidth,
    height: viewHeight,
    offsetX: cellPos(lastPlayerX) - (viewWidth / 2),
    offsetY: cellPos(lastPlayerY) - (viewHeight / 2),
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
  updateInfo: (update: Partial<GameInfo> | ((prevInfo: GameInfo) => Partial<GameInfo>)) => void,
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

  createGroups();

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

      const onMove = () => {
        updateOffset(player);
      };
      player.listen('x', onMove);
      player.listen('y', onMove);

      player.listen('pickupItem', pickupItem => updateInfo({ pickupItem }));
      player.listen('heldItem', heldItem => updateInfo({ heldItem }));
    }
    updatePlayerList();
  });
  room.state.players.onRemove(player => {
    if (player.id === room.sessionId) {
      updateInfo(prevInfo => ({ deadPlayer: prevInfo.players.find(p => p.id === player.id) }));
    }

    removeItem(player);
    updatePlayerList();
  });

  room.state.bombs.onAdd(bomb => {
    addBomb(bomb);
    bomb.listen('hot', () => updateBomb(bomb));
  });
  room.state.bombs.onRemove(bomb => removeItem(bomb));

  room.state.coins.onAdd(coin => addCoin(coin));
  room.state.coins.onRemove(coin => {
    setTimeout(() => removeItem(coin), moveDuration * 1000);
  });

  room.state.crates.onAdd(crate => {
    addCrate(crate);
    crate.onChange(() => updateCrate(crate));
  });
  room.state.crates.onRemove(crate => removeItem(crate));

  room.state.explosions.onAdd(explosion => addExplosion(explosion));
  room.state.explosions.onRemove(explosion => removeItem(explosion));

  room.state.walls.onAdd(wall => addWall(wall));

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

const wasdKeys = ['w', 'd', 's', 'a'];
const arrowKeys = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'];

const getDir = (key: string) => {
  if (wasdKeys.includes(key)) return wasdKeys.indexOf(key);
  if (arrowKeys.includes(key)) return arrowKeys.indexOf(key);
  return null;
};

export const handleInput = (room: Room<SokoRoomState>) => {
  let dir: number | null = null;
  let interval: any;

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'e') {
      room.send('pickup');
    }
    else if (e.key === 'f') {
      room.send('useItem');
    }
    else if (dir === null) {
      const keyDir = getDir(e.key);
      if (keyDir !== null) {
        dir = keyDir;
        room.send('move', dir);
        interval = setInterval(() => room.send('move', dir), moveCooldown);
      }
    }
  };

  const onKeyUp = (e: KeyboardEvent) => {
    if (dir !== null) {
      if (getDir(e.key) === dir) {
        clearInterval(interval);
        dir = null;
      }
    }
  };

  document.body.addEventListener('keydown', onKeyDown);
  document.body.addEventListener('keyup', onKeyUp);

  return () => {
    document.body.removeEventListener('keydown', onKeyDown);
    document.body.removeEventListener('keyup', onKeyUp);
  };
};

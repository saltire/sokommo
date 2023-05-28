/* eslint-disable no-param-reassign */
import { Room, Client } from 'colyseus';
import { Command, Dispatcher } from '@colyseus/command';
import { CollectionSchema, MapSchema, Schema, type } from '@colyseus/schema';
import { v4 as uuid } from 'uuid';


// Schemas and types

export class Item extends Schema {
  @type('string') id!: string;
  @type('number') x!: number;
  @type('number') y!: number;
  @type('boolean') pushable: boolean | undefined;
  @type('boolean') solid: boolean | undefined;
  @type('string') itemName: string | undefined;
}

export class Player extends Item {
  @type('string') name!: string;
  @type('string') color!: string;
  @type('string') imageUrl!: string;
  @type('number') rot!: number;
  @type('number') coins = 0;
  @type(Item) pickupItem: Item | undefined;
  @type(Item) heldItem: Item | undefined;
}
export type PlayerData = {
  name: string,
  color: string,
  imageUrl?: string,
};

export class Bomb extends Item {
  @type('boolean') hot: boolean | undefined;
}

export class Coin extends Item {
}

export class Crate extends Item {
}

export class Explosion extends Item {
}

export class Wall extends Item {
}

export class Cell extends Schema {
  @type('number') x!: number;
  @type('number') y!: number;
  @type({ collection: Item }) items!: CollectionSchema<Item>;
}

export class SokoRoomState extends Schema {
  @type('number') width!: number;
  @type('number') height!: number;
  @type({ map: Cell }) cells!: MapSchema<Cell>;
  @type({ map: Player }) players!: MapSchema<Player>;
  @type({ map: Bomb }) bombs!: MapSchema<Bomb>;
  @type({ map: Coin }) coins!: MapSchema<Coin>;
  @type({ map: Crate }) crates!: MapSchema<Crate>;
  @type({ map: Explosion }) explosions!: MapSchema<Explosion>;
  @type({ map: Wall }) walls!: MapSchema<Wall>;
}


// Room

/* eslint-disable @typescript-eslint/no-use-before-define */
export default class SokoRoom extends Room<SokoRoomState> {
  dispatcher = new Dispatcher(this);

  async onCreate() {
    this.setState(initState());

    this.onMessage('move', (client, dir: number) => {
      this.dispatcher.dispatch(new MovePlayerCmd(), { sessionId: client.sessionId, dir });
    });

    this.onMessage('pickup', client => {
      this.dispatcher.dispatch(new PickupCmd(), client.sessionId);
    });

    this.onMessage('useItem', client => {
      this.dispatcher.dispatch(new UseItemCmd(), client.sessionId);
    });

    this.onMessage('rejoin', (client, playerData: PlayerData) => {
      this.dispatcher.dispatch(new AddPlayerCmd(), { sessionId: client.sessionId, playerData });
    });
  }

  async onAuth(client: Client) {
    console.log(client.sessionId, 'authorizing...');
    return true;
  }

  async onJoin(client: Client, playerData: PlayerData) {
    console.log(client.sessionId, 'joined.');
    this.dispatcher.dispatch(new AddPlayerCmd(), { sessionId: client.sessionId, playerData });
  }

  async onLeave(client: Client) {
    console.log(client.sessionId, 'left.');
    this.dispatcher.dispatch(new RemovePlayerCmd(), client.sessionId);
  }

  async onDispose() {
    console.log('room', this.roomId, 'disposing...');
  }
}


// Cell map utilities

const getFreeSpace = (state: SokoRoomState) => {
  let x = Math.floor(Math.random() * state.width);
  let y = Math.floor(Math.random() * state.height);

  let tries = 0;
  while (state.cells.get(`${x},${y}`)!.items.size > 0) {
    x = Math.floor(Math.random() * state.width);
    y = Math.floor(Math.random() * state.height);
    tries += 1;
    if (tries > 100) {
      throw new Error('Could not place item.');
    }
  }

  return { x, y };
};

const moveItem = (state: SokoRoomState, item: Item, x: number, y: number) => {
  state.cells.get(`${item.x},${item.y}`)?.items.delete(item);
  state.cells.get(`${x},${y}`)?.items.add(item);
  item.x = x;
  item.y = y;
};


// Initial state

const initState = () => {
  const state = new SokoRoomState({
    width: 40,
    height: 40,
    cells: new MapSchema<Cell>(),
    players: new MapSchema<Player>(),
    bombs: new MapSchema<Bomb>(),
    coins: new MapSchema<Coin>(),
    crates: new MapSchema<Crate>(),
    explosions: new MapSchema<Explosion>(),
    walls: new MapSchema<Wall>(),
  });

  for (let y = 0; y < state.width; y += 1) {
    for (let x = 0; x < state.width; x += 1) {
      state.cells.set(`${x},${y}`, new Cell({
        x,
        y,
        items: new CollectionSchema<Item>(),
      }));
    }
  }

  const wallCount = 12;
  const wallMinSize = 2;
  const wallMaxSize = 5;
  for (let i = 0; i < wallCount; i += 1) {
    const { x, y } = getFreeSpace(state);
    const width = Math.floor(Math.random() * (wallMaxSize - wallMinSize + 1)) + wallMinSize;
    const height = Math.floor(Math.random() * (wallMaxSize - wallMinSize + 1)) + wallMinSize;

    for (let wy = 0; wy < height; wy += 1) {
      for (let wx = 0; wx < width; wx += 1) {
        const cx = x - Math.floor(width / 2) + wx;
        const cy = y - Math.floor(height / 2) + wy;
        const cell = state.cells.get(`${cx},${cy}`);
        if (cell) {
          const wall = new Wall({
            id: uuid(),
            x: cx,
            y: cy,
            solid: true,
          });
          state.walls.set(wall.id, wall);
          cell.items.add(wall);
        }
      }
    }
  }

  const bombCount = 40;
  for (let i = 0; i < bombCount; i += 1) {
    const bomb = new Bomb({
      id: uuid(),
      ...getFreeSpace(state),
      itemName: 'Bomb',
      solid: true,
    });
    state.bombs.set(bomb.id, bomb);
    state.cells.get(`${bomb.x},${bomb.y}`)?.items.add(bomb);
  }

  const coinCount = 40;
  for (let i = 0; i < coinCount; i += 1) {
    const coin = new Coin({
      id: uuid(),
      ...getFreeSpace(state),
    });
    state.coins.set(coin.id, coin);
    state.cells.get(`${coin.x},${coin.y}`)?.items.add(coin);
  }

  const crateCount = 40;
  for (let i = 0; i < crateCount; i += 1) {
    const crate = new Crate({
      id: uuid(),
      ...getFreeSpace(state),
      pushable: true,
      solid: true,
    });
    state.crates.set(crate.id, crate);
    state.cells.get(`${crate.x},${crate.y}`)?.items.add(crate);
  }

  return state;
};


// Commands

class AddPlayerCmd extends Command<SokoRoom> {
  execute({ sessionId, playerData }: { sessionId: string, playerData: PlayerData }) {
    const player = new Player({
      id: sessionId,
      name: playerData.name,
      color: playerData.color,
      imageUrl: playerData.imageUrl,
      ...getFreeSpace(this.state),
      rot: Math.floor(Math.random() * 4),
      solid: true,
    });

    this.state.players.set(sessionId, player);
    this.state.cells.get(`${player.x},${player.y}`)?.items.add(player);
  }
}

class RemovePlayerCmd extends Command<SokoRoom> {
  execute(sessionId: string) {
    const player = this.state.players.get(sessionId);
    if (player) {
      this.state.cells.get(`${player.x},${player.y}`)?.items.delete(player);
    }
    this.state.players.delete(sessionId);
  }
}

class MovePlayerCmd extends Command<SokoRoom> {
  dirs = [
    [0, -1], // N
    [1, 0], //  E
    [0, 1], //  S
    [-1, 0], // W
  ];

  execute({ sessionId, dir }: { sessionId: string, dir: number }) {
    const [dx, dy] = this.dirs[dir] || [0, 0];
    const player = this.state.players.get(sessionId);
    if (!player || !(dx || dy)) return;

    const dr = (dir - (player.rot % 4) + 4) % 4;
    player.rot += (dr === 3 ? -1 : dr);

    const plx = player.x + dx;
    const ply = player.y + dy;
    const cell = this.state.cells.get(`${plx},${ply}`);
    if (!cell) return;

    // Check for a solid or pushable item.
    let immovable: Item | undefined;
    let pushable: Item | undefined;
    let pickup: Item | undefined;
    cell.items.forEach(item => {
      if (item.pushable) {
        pushable = item;
      }
      // Pick up any coins.
      else if (item instanceof Coin) {
        cell.items.delete(item);
        this.state.coins.delete(item.id);
        player.coins += 1;
      }
      else if (item.itemName) {
        pickup = item;
      }
      else if (item.solid) {
        immovable = item;
      }
    });
    if (immovable) return;

    if (pushable) {
      const pux = pushable.x + dx;
      const puy = pushable.y + dy;
      const pCell = this.state.cells.get(`${pux},${puy}`);
      if (!pCell) return;

      // Check for a solid item on the other side.
      let solidItem: Item | undefined;
      pCell.items.forEach(item => {
        if (item.solid) {
          solidItem = item;
        }
      });
      if (solidItem) return;

      moveItem(this.state, pushable, pux, puy);
    }

    moveItem(this.state, player, plx, ply);

    player.pickupItem = pickup;
  }
}

class PickupCmd extends Command<SokoRoom> {
  execute(sessionId: string) {
    const player = this.state.players.get(sessionId);
    if (!player) return;

    const cell = this.state.cells.get(`${player.x},${player.y}`);
    const alreadyHeldItem = player.heldItem;
    player.heldItem = undefined;

    // Pick up item, if any.
    if (player.pickupItem) {
      if (player.pickupItem instanceof Bomb) {
        this.state.bombs.delete(player.pickupItem.id);
      }
      cell?.items.delete(player.pickupItem);
      player.heldItem = player.pickupItem;
      player.pickupItem = undefined;
    }

    // Put down held item, if any.
    if (alreadyHeldItem) {
      if (alreadyHeldItem instanceof Bomb) {
        this.state.bombs.set(alreadyHeldItem.id, alreadyHeldItem);
      }
      alreadyHeldItem.x = player.x;
      alreadyHeldItem.y = player.y;
      cell?.items.add(alreadyHeldItem);
      player.pickupItem = alreadyHeldItem;
    }
  }
}

const useBomb = (room: SokoRoom, cell: Cell, bomb: Bomb) => {
  const bombTimer = 2000;
  const explosionTimer = 1000;

  bomb.hot = true;
  bomb.itemName = undefined; // No longer able to pick it up.
  // TODO: allow items to appear in the pickup window without being actually grabbable,
  // and prevent dropping more items in the same cell.
  room.state.bombs.set(bomb.id, bomb);

  room.clock.setTimeout(() => {
    room.state.bombs.delete(bomb.id);
    cell.items.delete(bomb);

    for (let ex = cell.x - 1; ex <= cell.x + 1; ex += 1) {
      for (let ey = cell.y - 1; ey <= cell.y + 1; ey += 1) {
        const eCell = room.state.cells.get(`${ex},${ey}`);
        if (eCell) {
          eCell.items.forEach(item => {
            if (item instanceof Bomb) {
              useBomb(room, eCell, item);
            }
            else if (item instanceof Crate) {
              room.state.crates.delete(item.id);
              eCell.items.delete(item);
            }
            else if (item instanceof Player) {
              room.state.players.delete(item.id);
              eCell.items.delete(item);
            }
          });

          const explosion = new Explosion({
            id: uuid(),
            x: ex,
            y: ey,
          });
          room.state.explosions.set(explosion.id, explosion);
          eCell.items.add(explosion);

          room.clock.setTimeout(() => {
            room.state.explosions.delete(explosion.id);
            eCell.items.delete(explosion);
          }, explosionTimer);
        }
      }
    }
  }, bombTimer);
};

class UseItemCmd extends Command<SokoRoom> {
  execute(sessionId: string) {
    const player = this.state.players.get(sessionId);
    if (!player?.heldItem) return;

    const { x, y } = player;
    const cell = this.state.cells.get(`${x},${y}`);
    if (!cell) return;

    if (player.heldItem instanceof Bomb) {
      useBomb(this.room, cell, player.heldItem);
    }
    player.heldItem.x = player.x;
    player.heldItem.y = player.y;
    cell?.items.add(player.heldItem);
    player.heldItem = undefined;
  }
}

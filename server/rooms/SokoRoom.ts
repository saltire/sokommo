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
}

export class Player extends Item {
  @type('string') name!: string;
  @type('string') color!: string;
  @type('string') imageUrl!: string;
  @type('number') rot!: number;
  @type('number') coins = 0;
}
export type PlayerData = {
  name: string,
  color: string,
  imageUrl?: string,
};

export class Bomb extends Item {
}

export class Coin extends Item {
}

export class Crate extends Item {
}

export class Cell extends Schema {
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
  item.x = x; // eslint-disable-line no-param-reassign
  item.y = y; // eslint-disable-line no-param-reassign
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
  });

  for (let y = 0; y < state.width; y += 1) {
    for (let x = 0; x < state.width; x += 1) {
      state.cells.set(`${x},${y}`, new Cell({
        items: new CollectionSchema<Item>(),
      }));
    }
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

  const bombCount = 40;
  for (let i = 0; i < bombCount; i += 1) {
    const bomb = new Bomb({
      id: uuid(),
      ...getFreeSpace(state),
    });
    state.bombs.set(bomb.id, bomb);
    state.cells.get(`${bomb.x},${bomb.y}`)?.items.add(bomb);
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
    if (player && (dx || dy)) {
      const dr = (dir - (player.rot % 4) + 4) % 4;
      player.rot += (dr === 3 ? -1 : dr);

      const plx = Math.max(0, Math.min(this.state.width - 1, player.x + dx));
      const ply = Math.max(0, Math.min(this.state.height - 1, player.y + dy));
      if (plx === player.x && ply === player.y) return;

      // Check for a solid or pushable item.
      let immovable: Item | undefined;
      let pushable: Item | undefined;
      this.state.cells.get(`${plx},${ply}`)?.items.forEach(item => {
        if (item.pushable) {
          pushable = item;
        }
        // Pick up any coins.
        else if (item instanceof Coin) {
          this.state.cells.get(`${item.x},${item.y}`)?.items.delete(item);
          this.state.coins.delete(item.id);
          player.coins += 1;
        }
        else if (item.solid) {
          immovable = item;
        }
      });
      if (immovable) return;

      if (pushable) {
        const pux = Math.max(0, Math.min(this.state.width - 1, pushable.x + dx));
        const puy = Math.max(0, Math.min(this.state.height - 1, pushable.y + dy));
        if (pux === pushable.x && puy === pushable.y) return;

        // Check for a solid item on the other side.
        let solidItem: Item | undefined;
        this.state.cells.get(`${pux},${puy}`)?.items.forEach(item => {
          if (item.solid) {
            solidItem = item;
          }
        });
        if (solidItem) return;

        moveItem(this.state, pushable, pux, puy);
      }

      moveItem(this.state, player, plx, ply);
    }
  }
}

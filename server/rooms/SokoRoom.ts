import { Room, Client } from 'colyseus';
import { Command, Dispatcher } from '@colyseus/command';
import { CollectionSchema, MapSchema, Schema, type } from '@colyseus/schema';
import { v4 as uuid } from 'uuid';


export type PlayerData = {
  name: string,
  color: string,
  imageUrl?: string,
};

export class Item extends Schema {
  @type('string') id!: string;
  @type('number') x!: number;
  @type('number') y!: number;
  @type('boolean') pushable!: boolean;
}

export class Player extends Item {
  @type('string') name!: string;
  @type('string') color!: string;
  @type('string') imageUrl!: string;
  @type('number') rot!: number;
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
  @type({ collection: Crate }) crates!: CollectionSchema<Crate>;
}

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

const initState = () => {
  const state = new SokoRoomState({
    width: 20,
    height: 15,
    cells: new MapSchema<Cell>(),
    players: new MapSchema<Player>(),
    crates: new CollectionSchema<Crate>(),
  });

  for (let y = 0; y < state.width; y += 1) {
    for (let x = 0; x < state.width; x += 1) {
      state.cells.set(`${x},${y}`, new Cell({
        items: new CollectionSchema<Item>(),
      }));
    }
  }

  const crateCount = 10;
  for (let i = 0; i < crateCount; i += 1) {
    const crate = new Crate({
      id: uuid(),
      x: Math.floor(Math.random() * state.width),
      y: Math.floor(Math.random() * state.height),
      pushable: true,
    });
    state.crates.add(crate);
    state.cells.get(`${crate.x},${crate.y}`)?.items.add(crate);
  }

  return state;
};

class AddPlayerCmd extends Command<SokoRoom> {
  execute({ sessionId, playerData }: { sessionId: string, playerData: PlayerData }) {
    const player = new Player({
      id: sessionId,
      name: playerData.name,
      color: playerData.color,
      imageUrl: playerData.imageUrl,
      x: Math.floor(Math.random() * this.state.width),
      y: Math.floor(Math.random() * this.state.height),
      rot: Math.floor(Math.random() * 4),
    });
    this.state.players.set(sessionId, player);
    this.state.cells.get(`${player.x},${player.y}`)?.items.add(player);
  }
}

class RemovePlayerCmd extends Command<SokoRoom> {
  execute(sessionId: string) {
    this.state.players.delete(sessionId);
  }
}

const moveItem = (cells: MapSchema<Cell>, item: Item, x: number, y: number) => {
  cells.get(`${item.x},${item.y}`)?.items.delete(item);
  cells.get(`${x},${y}`)?.items.add(item);
  item.x = x; // eslint-disable-line no-param-reassign
  item.y = y; // eslint-disable-line no-param-reassign
};

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

      // Check for pushable items.
      let pushable: Item | undefined;
      this.state.cells.get(`${plx},${ply}`)?.items.forEach(item => {
        if (item.pushable) {
          pushable = item;
        }
      });
      if (pushable) {
        const pux = Math.max(0, Math.min(this.state.width - 1, pushable.x + dx));
        const puy = Math.max(0, Math.min(this.state.height - 1, pushable.y + dy));
        if (pux === pushable.x && puy === pushable.y) return;

        let nextItem: Item | undefined;
        this.state.cells.get(`${pux},${puy}`)?.items.forEach(item => {
          if (item) {
            nextItem = item;
          }
        });
        if (nextItem) return;

        moveItem(this.state.cells, pushable, pux, puy);
      }

      moveItem(this.state.cells, player, plx, ply);
    }
  }
}

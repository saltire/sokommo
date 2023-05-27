import { Room, Client } from 'colyseus';
import { Command, Dispatcher } from '@colyseus/command';
import { CollectionSchema, MapSchema, Schema, type } from '@colyseus/schema';
import { v4 as uuid } from 'uuid';


export type PlayerData = {
  name: string,
  color: string,
  imageUrl?: string,
};

export class Player extends Schema {
  @type('string') id!: string;
  @type('string') name!: string;
  @type('string') color!: string;
  @type('string') imageUrl!: string;
  @type('number') x!: number;
  @type('number') y!: number;
  @type('number') rot!: number;
}

export class Crate extends Schema {
  @type('string') id!: string;
  @type('number') x!: number;
  @type('number') y!: number;
}

export class SokoRoomState extends Schema {
  @type('number') width!: number;
  @type('number') height!: number;
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
    players: new MapSchema<Player>(),
    crates: new CollectionSchema<Crate>(),
  });

  const crateCount = 10;
  for (let i = 0; i < crateCount; i += 1) {
    state.crates.add(new Crate({
      id: uuid(),
      x: Math.floor(Math.random() * state.width),
      y: Math.floor(Math.random() * state.height),
    }));
  }

  return state;
};

class AddPlayerCmd extends Command<SokoRoom> {
  execute({ sessionId, playerData }: { sessionId: string, playerData: PlayerData }) {
    this.state.players.set(sessionId, new Player({
      id: sessionId,
      name: playerData.name,
      color: playerData.color,
      imageUrl: playerData.imageUrl,
      x: Math.floor(Math.random() * this.state.width),
      y: Math.floor(Math.random() * this.state.height),
      rot: Math.floor(Math.random() * 4),
    }));
  }
}

class RemovePlayerCmd extends Command<SokoRoom> {
  execute(sessionId: string) {
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

      const npx = Math.max(0, Math.min(this.state.width - 1, player.x + dx));
      const npy = Math.max(0, Math.min(this.state.height - 1, player.y + dy));
      if (npx === player.x && npy === player.y) return;

      // Check for crates.
      // TODO: keep a more efficient map of coords to objects to avoid so much iteration.
      let crate: Crate | undefined;
      this.state.crates.forEach(c => {
        if (c.x === npx && c.y === npy) {
          crate = c;
        }
      });
      if (crate) {
        const ncx = Math.max(0, Math.min(this.state.width - 1, crate.x + dx));
        const ncy = Math.max(0, Math.min(this.state.height - 1, crate.y + dy));
        if (ncx === crate.x && ncy === crate.y) return;

        let nextCrate: Crate | undefined;
        this.state.crates.forEach(c => {
          if (c.x === ncx && c.y === ncy) {
            nextCrate = c;
          }
        });
        if (nextCrate) return;

        crate.x = ncx;
        crate.y = ncy;
      }

      player.x = npx;
      player.y = npy;
    }
  }
}

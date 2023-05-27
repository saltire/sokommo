import { Schema, CollectionSchema, MapSchema, type } from '@colyseus/schema';
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

const dirs = [
  [0, -1], // N
  [1, 0], //  E
  [0, 1], //  S
  [-1, 0], // W
];

export const initState = () => {
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

export const addPlayer = (state: SokoRoomState, sessionId: string, options: PlayerData) => {
  state.players.set(sessionId, new Player({
    id: sessionId,
    name: options.name,
    color: options.color,
    imageUrl: options.imageUrl,
    x: Math.floor(Math.random() * state.width),
    y: Math.floor(Math.random() * state.height),
    rot: Math.floor(Math.random() * 4),
  }));
};

export const removePlayer = (state: SokoRoomState, sessionId: string) => {
  state.players.delete(sessionId);
};

export const movePlayer = (state: SokoRoomState, sessionId: string, dir: number) => {
  const [dx, dy] = dirs[dir] || [0, 0];
  const player = state.players.get(sessionId);
  if (player && (dx || dy)) {
    const dr = (dir - (player.rot % 4) + 4) % 4;
    player.rot += (dr === 3 ? -1 : dr);

    const npx = Math.max(0, Math.min(state.width - 1, player.x + dx));
    const npy = Math.max(0, Math.min(state.height - 1, player.y + dy));
    if (npx === player.x && npy === player.y) return;

    // Check for crates.
    // TODO: keep a more efficient map of coords to objects to avoid so much iteration.
    let crate: Crate | undefined;
    state.crates.forEach(c => {
      if (c.x === npx && c.y === npy) {
        crate = c;
      }
    });
    if (crate) {
      const ncx = Math.max(0, Math.min(state.width - 1, crate.x + dx));
      const ncy = Math.max(0, Math.min(state.height - 1, crate.y + dy));
      if (ncx === crate.x && ncy === crate.y) return;

      let nextCrate: Crate | undefined;
      state.crates.forEach(c => {
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
};

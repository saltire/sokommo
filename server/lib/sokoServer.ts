import { Schema, MapSchema, type } from '@colyseus/schema';


export type PlayerData = {
  name: string,
  color: string,
};

export class Player extends Schema {
  @type('string') id!: string;
  @type('string') name!: string;
  @type('string') color!: string;
  @type('number') x!: number;
  @type('number') y!: number;
  @type('number') rot!: number;
}

export class SokoRoomState extends Schema {
  @type('number') width = 20;
  @type('number') height = 15;
  @type({ map: Player }) players = new MapSchema<Player>();
}

const dirs = [
  [0, -1], // N
  [1, 0], //  E
  [0, 1], //  S
  [-1, 0], // W
];

export const addPlayer = (state: SokoRoomState, sessionId: string, options: PlayerData) => {
  state.players.set(sessionId, new Player({
    id: sessionId,
    name: options.name,
    color: options.color,
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
    player.x = Math.max(0, Math.min(state.width - 1, player.x + dx));
    player.y = Math.max(0, Math.min(state.height - 1, player.y + dy));

    const dr = (dir - (player.rot % 4) + 4) % 4;
    player.rot += (dr === 3 ? -1 : dr);
  }
};

import { Schema, MapSchema, type } from '@colyseus/schema';


export class Player extends Schema {
  @type('string') id!: string;
  @type('number') x!: number;
  @type('number') y!: number;
  @type('string') color!: string;
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

const colors = [
  '#f00',
  '#0f0',
  '#00f',
];

export const addPlayer = (state: SokoRoomState, sessionId: string) => {
  state.players.set(sessionId, new Player({
    id: sessionId,
    x: Math.floor(Math.random() * state.width),
    y: Math.floor(Math.random() * state.height),
    color: colors[state.players.size % colors.length],
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
  }
};

/* eslint-disable @typescript-eslint/no-unused-vars */
import { Room, Client } from 'colyseus';
import { Schema, MapSchema, Context, type } from '@colyseus/schema';
import http from 'http';


const colors = [
  '#f00',
  '#0f0',
  '#00f',
];

const dirs = [
  [0, -1], // N
  [1, 0], //  E
  [0, 1], //  S
  [-1, 0], // W
];

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

export default class SokoRoom extends Room<SokoRoomState> {
  async onCreate(options: any) {
    this.setState(new SokoRoomState());

    this.onMessage('move', (client, dir: number) => {
      const [dx, dy] = dirs[dir] || [0, 0];
      const player = this.state.players.get(client.sessionId);
      if (player && (dx || dy)) {
        player.x = Math.max(0, Math.min(this.state.width - 1, player.x + dx));
        player.y = Math.max(0, Math.min(this.state.height - 1, player.y + dy));
      }
    });
  }

  async onAuth(client: Client, options: any, request: http.IncomingMessage) {
    console.log(client.sessionId, 'authorizing...');
    return true;
  }

  async onJoin(client: Client, options: any) {
    console.log(client.sessionId, 'joined!');

    const player = new Player();
    player.id = client.sessionId;
    player.x = Math.floor(Math.random() * this.state.width);
    player.y = Math.floor(Math.random() * this.state.height);
    player.color = colors[this.state.players.size % colors.length];

    this.state.players.set(client.sessionId, player);
  }

  async onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, 'left!');

    this.state.players.delete(client.sessionId);
  }

  async onDispose() {
    console.log('room', this.roomId, 'disposing...');
  }
}

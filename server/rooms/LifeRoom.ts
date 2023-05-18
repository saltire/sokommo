/* eslint-disable @typescript-eslint/no-unused-vars */
import { Room, Client } from 'colyseus';
import { Schema, SetSchema, Context, type } from '@colyseus/schema';
import http from 'http';


const width = 20;
const height = 20;
const density = 0.4;

export class LifeRoomState extends Schema {
  @type({ set: 'string' }) cells!: SetSchema<string>;
}

const initializeCells = () => {
  const cells = new SetSchema<string>();

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (Math.random() < density) {
        cells.add(`${x},${y}`);
      }
    }
  }

  return cells;
};

const getNewCells = (cells: SetSchema<string>) => {
  const newCells = new SetSchema<string>();

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const ncount = [
        cells.has(`${x - 1},${y - 1}`),
        cells.has(`${x},${y - 1}`),
        cells.has(`${x + 1},${y - 1}`),
        cells.has(`${x - 1},${y}`),
        cells.has(`${x + 1},${y}`),
        cells.has(`${x - 1},${y + 1}`),
        cells.has(`${x},${y + 1}`),
        cells.has(`${x + 1},${y + 1}`),
      ].filter(Boolean).length;

      if (ncount < 2 || ncount > 3) {
        newCells.delete(`${x},${y}`);
      }
      else if (ncount === 3 || cells.has(`${x},${y}`)) {
        newCells.add(`${x},${y}`);
      }
    }
  }

  return newCells;
};

export default class LifeRoom extends Room<LifeRoomState> {
  async onCreate(options: any) {
    this.setState(new LifeRoomState());

    this.state.cells = initializeCells();

    this.onMessage('reset', () => {
      console.log('Reset');
      this.state.cells = initializeCells();
    });

    setInterval(() => {
      this.state.cells = getNewCells(this.state.cells);
    }, 200);
  }

  async onAuth(client: Client, options: any, request: http.IncomingMessage) {
    console.log(client.sessionId, 'authorizing...');
    return true;
  }

  async onJoin(client: Client, options: any) {
    console.log(client.sessionId, 'joined!');
  }

  async onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, 'left!');
  }

  async onDispose() {
    console.log('room', this.roomId, 'disposing...');
  }
}

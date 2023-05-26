/* eslint-disable @typescript-eslint/no-unused-vars */
import { Room, Client } from 'colyseus';
import http from 'http';

import { SokoRoomState, addPlayer, removePlayer, movePlayer } from '../lib/sokoServer';


export default class SokoRoom extends Room<SokoRoomState> {
  async onCreate(options: any) {
    this.setState(new SokoRoomState());

    this.onMessage('move', (client, dir: number) => {
      movePlayer(this.state, client.sessionId, dir);
    });
  }

  async onAuth(client: Client, options: any, request: http.IncomingMessage) {
    console.log(client.sessionId, 'authorizing...');
    return true;
  }

  async onJoin(client: Client, options: any) {
    console.log(client.sessionId, 'joined.');
    addPlayer(this.state, client.sessionId);
  }

  async onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, 'left.');
    removePlayer(this.state, client.sessionId);
  }

  async onDispose() {
    console.log('room', this.roomId, 'disposing...');
  }
}

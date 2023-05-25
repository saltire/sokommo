import { Client } from 'colyseus.js';

import { SokoRoomState } from '../../server/lib/sokoServer';
import { setupSokoClient, handleInput } from '../lib/sokoClient';


const soko = (client: Client) => {
  client.joinOrCreate<SokoRoomState>('soko_room')
    .then(room => {
      setupSokoClient(room.state);
      handleInput(room);
    })
    .catch(e => {
      console.error('JOIN ERROR', e);
    });
};
export default soko;

import { Client } from 'colyseus.js';

import { SokoRoomState } from '../../server/rooms/SokoRoom';
import Soko from '../lib/soko';


const dirKeys = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'];

const sokoClient = (client: Client) => {
  client.joinOrCreate<SokoRoomState>('soko_room')
    .then(room => {
      console.log(room.sessionId, 'joined', room.name);

      const soko = new Soko(room.state); // eslint-disable-line @typescript-eslint/no-unused-vars

      document.body.addEventListener('keyup', e => {
        if (dirKeys.includes(e.key)) {
          room.send('move', dirKeys.indexOf(e.key));
        }
      });
    })
    .catch(e => {
      console.error('JOIN ERROR', e);
    });
};
export default sokoClient;

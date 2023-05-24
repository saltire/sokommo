import { Client } from 'colyseus.js';

import { SokoRoomState } from '../../server/lib/sokoServer';
import SokoClient from '../lib/sokoClient';


const dirKeys = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'];

const sokoClient = (client: Client) => {
  client.joinOrCreate<SokoRoomState>('soko_room')
    .then(room => {
      console.log(room.sessionId, 'joined', room.name);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const soko = new SokoClient(room.state);

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

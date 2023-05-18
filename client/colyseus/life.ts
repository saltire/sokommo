import { Client } from 'colyseus.js';

import { LifeRoomState } from '../../server/rooms/LifeRoom';
import { createGrid, updateCells } from '../lib/life';


const lifeClient = (client: Client) => {
  client.joinOrCreate<LifeRoomState>('life_room')
    .then(room => {
      console.log(room.sessionId, 'joined', room.name);
      createGrid();

      room.onStateChange(state => {
        // console.log('New state:', state);

        updateCells(Array.from(state.cells.values()).map(coord => {
          const [x, y] = coord.split(',').map(Number);
          return [x, y];
        }));
      });

      document.body.addEventListener('keyup', e => {
        if (e.key === 'Enter') {
          room.send('reset');
        }
      });
    })
    .catch(e => {
      console.error('JOIN ERROR', e);
    });
};
export default lifeClient;

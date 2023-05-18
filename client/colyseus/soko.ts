import { Client } from 'colyseus.js';

import { SokoRoomState } from '../../server/rooms/SokoRoom';
import { createGrid, updatePlayers } from '../lib/soko';


const dirKeys = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'];

const sokoClient = (client: Client) => {
  client.joinOrCreate<SokoRoomState>('soko_room')
    .then(room => {
      console.log(room.sessionId, 'joined', room.name);
      createGrid();

      room.state.players.onAdd((player, key) => console.log('onAdd', player, key));
      room.state.players.onRemove((player, key) => console.log('onRemove', player, key));
      room.state.players.onChange((player, key) => console.log('onChange', player, key));

      room.onStateChange(state => {
        console.log('New state:', state);
        // console.log(state.players.get(room.sessionId));

        updatePlayers(Array.from(state.players.values()));
      });

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

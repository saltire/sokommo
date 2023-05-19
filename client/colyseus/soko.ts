import { Client } from 'colyseus.js';

import { SokoRoomState } from '../../server/rooms/SokoRoom';
import { createGrid, addPlayer, updatePlayer, removePlayer } from '../lib/soko';


const dirKeys = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'];

const sokoClient = (client: Client) => {
  client.joinOrCreate<SokoRoomState>('soko_room')
    .then(room => {
      console.log(room.sessionId, 'joined', room.name);
      createGrid();

      room.state.players.onAdd(player => {
        addPlayer(player);
        console.log(player.x, player.y);

        player.onChange(() => updatePlayer(player));
      });

      room.state.players.onRemove(player => {
        removePlayer(player);
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

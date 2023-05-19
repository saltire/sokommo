import { Client } from 'colyseus.js';

import { SokoRoomState } from '../../server/rooms/SokoRoom';
import Soko from '../lib/soko';


const dirKeys = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'];

const sokoClient = (client: Client) => {
  client.joinOrCreate<SokoRoomState>('soko_room')
    .then(room => {
      console.log(room.sessionId, 'joined', room.name);

      const soko = new Soko();

      room.state.players.onAdd(player => {
        soko.addPlayer(player);

        player.onChange(() => soko.updatePlayer(player));
      });

      room.state.players.onRemove(player => {
        soko.removePlayer(player);
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

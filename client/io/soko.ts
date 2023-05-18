import { Socket } from 'socket.io-client';

import { createGrid, updatePlayers, Player } from '../lib/soko';


const dirKeys = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'];

let players: { [id: string]: Player } = {};

const sokoClient = (socket: Socket) => {
  createGrid();

  socket.on('players', (newPlayers: { [id: string]: Player }) => {
    players = newPlayers;
    updatePlayers(players);
  });

  socket.on('playerAdd', (id: string, player: Player) => {
    players[id] = player;
    updatePlayers(players);
  });

  socket.on('playerUpdate', (id: string, player: Player) => {
    players[id] = player;
    updatePlayers(players);
  });

  socket.on('playerDelete', (id: string) => {
    delete players[id];
    updatePlayers(players);
  });

  document.body.addEventListener('keyup', e => {
    if (dirKeys.includes(e.key)) {
      socket.emit('move', dirKeys.indexOf(e.key));
    }
  });
};
export default sokoClient;

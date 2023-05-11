import { Server } from 'socket.io';


type Player = {
  id: string,
  x: number,
  y: number,
  color: string,
};

const players: { [id: string]: Player } = {};

const dirs = [
  [0, -1], // N
  [1, 0], //  E
  [0, 1], //  S
  [-1, 0], // W
];

const colors = [
  'f00',
  '0f0',
  '00f',
];

const soko = (io: Server) => {
  const width = 20;
  const height = 20;

  io.on('connection', socket => {
    console.log('New player', socket.id);
    const player = players[socket.id] = {
      id: socket.id,
      x: Math.floor(Math.random() * width),
      y: Math.floor(Math.random() * height),
      color: colors[Object.keys(players).length % colors.length],
    };

    io.in('room').emit('playerAdd', socket.id, player);

    socket.join('room');
    socket.emit('players', players);

    socket.on('move', (dir: number) => {
      const [dx, dy] = dirs[dir] || [0, 0];
      if (dx || dy) {
        player.x = Math.max(0, Math.min(width - 1, player.x + dx));
        player.y = Math.max(0, Math.min(height - 1, player.y + dy));

        io.in('room').emit('playerUpdate', socket.id, player);
      }
    });

    socket.on('disconnect', () => {
      console.log('Removing player', socket.id);
      delete players[socket.id];

      io.in('room').emit('playerDelete', socket.id);
    });
  });
};

export default soko;

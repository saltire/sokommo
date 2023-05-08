import { Server } from 'socket.io';


const initializeRows = (width: number, height: number, density: number) => {
  const rows: boolean[][] = [];

  for (let y = 0; y < height; y += 1) {
    rows[y] = [];

    for (let x = 0; x < width; x += 1) {
      rows[y][x] = Math.random() < density;
    }
  }

  return rows;
};

const getNewRows = (rows: boolean[][]) => {
  const newRows: boolean[][] = [];

  for (let y = 0; y < rows.length; y += 1) {
    newRows.push([]);

    for (let x = 0; x < rows[y].length; x += 1) {
      const ncount = [
        rows[y - 1]?.[x - 1],
        rows[y - 1]?.[x],
        rows[y - 1]?.[x + 1],
        rows[y][x - 1],
        rows[y][x + 1],
        rows[y + 1]?.[x - 1],
        rows[y + 1]?.[x],
        rows[y + 1]?.[x + 1],
      ].filter(Boolean).length;

      newRows[y].push((ncount < 2 || ncount > 3) ? false
        : (ncount === 3 ? true : rows[y][x]));
    }
  }

  return newRows;
};

const life = (io: Server) => {
  const width = 20;
  const height = 20;
  const density = 0.4;
  let rows = initializeRows(width, height, density);

  setInterval(() => {
    // io.emit('rows', rows);

    io.emit('cells', rows
      .flatMap((row, y) => row.map((cell, x) => cell && [x, y]))
      .filter(Boolean));

    rows = getNewRows(rows);
  }, 250);

  io.on('connection', socket => {
    console.log('Got connection');

    socket.on('reset', () => {
      console.log('reset');
      rows = initializeRows(width, height, density);
    });
  });
};

export default life;

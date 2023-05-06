import io from 'socket.io-client';

import './index.scss';
import { createGrid, updateGrid } from './grid';


const rows = createGrid();

const socket = io();

socket.on('rows', newRows => {
  for (let y = 0; y < newRows.length; y += 1) {
    for (let x = 0; x < newRows[y].length; x += 1) {
      rows[y][x].alive = newRows[y][x];
    }
  }

  updateGrid(rows);
});

document.body.addEventListener('keyup', e => {
  if (e.key === 'Enter') {
    socket.emit('reset');
  }
});

import './index.scss';
import { createGrid, getNewRows, updateGrid } from './grid';


let rows = createGrid();
setInterval(() => {
  rows = getNewRows(rows);
  updateGrid(rows);
}, 250);

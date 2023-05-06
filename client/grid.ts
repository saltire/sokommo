import * as d3 from 'd3';


type Cell = {
  x: number,
  y: number,
  alive: boolean,
};

const size = 50;
const width = 20;
const height = 20;

let grid: d3.Selection<SVGSVGElement, any, HTMLElement, any>;
let row: d3.Selection<SVGGElement, Cell[], SVGSVGElement, any>;
let square: d3.Selection<SVGRectElement, Cell, SVGGElement, Cell[]>;

export const createGrid = () => {
  const rows: Cell[][] = [];

  for (let y = 0; y < height; y += 1) {
    rows.push([]);

    for (let x = 0; x < width; x += 1) {
      rows[y].push({
        x: (x * size) + 1,
        y: (y * size) + 1,
        alive: Math.random() > 0.6,
      });
    }
  }

  grid = d3.select('#grid')
    .append('svg')
    .attr('width', `${(size + 1) * width}px`)
    .attr('height', `${(size + 1) * height}px`);

  row = grid.selectAll('.row')
    .data(rows)
    .enter()
    .append('g')
    .attr('class', 'row');

  square = row.selectAll('.square')
    .data(d => d)
    .enter()
    .append('rect')
    .attr('class', 'square')
    .attr('x', d => d.x)
    .attr('y', d => d.y)
    .attr('width', size)
    .attr('height', size)
    .style('fill', d => (d.alive ? '#666' : '#fff'))
    .style('stroke', '#222');

  return rows;
};

export const getNewRows = (rows: Cell[][]) => {
  const newRows: Cell[][] = [];

  for (let y = 0; y < height; y += 1) {
    newRows.push([]);

    for (let x = 0; x < width; x += 1) {
      const ncount = [
        rows[y - 1]?.[x - 1],
        rows[y - 1]?.[x],
        rows[y - 1]?.[x + 1],
        rows[y][x - 1],
        rows[y][x + 1],
        rows[y + 1]?.[x - 1],
        rows[y + 1]?.[x],
        rows[y + 1]?.[x + 1],
      ].filter(cell => cell?.alive).length;

      newRows[y].push({
        ...rows[y][x],
        alive: (ncount < 2 || ncount > 3) ? false
          : (ncount === 3 ? true : rows[y][x].alive),
      });
    }
  }

  return newRows;
};

export const updateGrid = (newRows: Cell[][]) => {
  row.data(newRows);

  square
    .data(d => d)
    .join('.square')
    .style('fill', d => (d.alive ? '#666' : '#fff'));
};

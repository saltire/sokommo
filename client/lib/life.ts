import * as d3 from 'd3';


type Cell = {
  x: number,
  y: number,
  // alive: boolean,
};

const size = 50;
const width = 20;
const height = 20;

let grid: d3.Selection<SVGSVGElement, any, HTMLElement, any>;
let row: d3.Selection<SVGGElement, Cell[], SVGSVGElement, any>;
// let square: d3.Selection<SVGRectElement, Cell, SVGGElement, Cell[]>;

export const createGrid = () => {
  const rows: Cell[][] = [];

  for (let y = 0; y < height; y += 1) {
    rows.push([]);

    for (let x = 0; x < width; x += 1) {
      rows[y].push({
        x: (x * size) + 1,
        y: (y * size) + 1,
        // alive: false,
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

  // square =
  row.selectAll('.square')
    .data(d => d)
    .enter()
    .append('rect')
    .attr('class', 'square')
    .attr('x', d => d.x)
    .attr('y', d => d.y)
    .attr('width', size)
    .attr('height', size)
    // .style('fill', d => (d.alive ? '#666' : '#fff'))
    .style('fill', '#fff')
    .style('stroke', '#222');

  return rows;
};

type Coord = [number, number];

export const updateCells = (cells: Coord[]) => {
  const transition = d3.transition()
    .duration(100);

  grid.selectAll<SVGSVGElement, Coord>('.cell')
    .data(cells, d => d.join(','))
    .join(
      enter => enter
        .append('rect')
        .attr('class', 'cell')
        .attr('x', d => (d[0] * size) + 1)
        .attr('y', d => (d[1] * size) + 1)
        .attr('width', size)
        .attr('height', size)
        .style('fill', '#dc2f02')
        .style('opacity', 0)
        .call(x => x.transition(transition)
          .style('opacity', 1)),
      update => update
        .attr('x', d => (d[0] * size) + 1)
        .attr('y', d => (d[1] * size) + 1),
      exit => exit
        .call(x => x.transition(transition)
          .style('opacity', 0)
          .remove()),
    );
};

// const updateGrid = (newRows: Cell[][]) => {
//   row.data(newRows);

//   square
//     .data(d => d)
//     .join('.square')
//     .style('fill', d => (d.alive ? '#666' : '#fff'));
// };

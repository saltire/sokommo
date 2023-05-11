import * as d3 from 'd3';
import { Socket } from 'socket.io-client';


type Cell = {
  x: number,
  y: number,
};

type Player = {
  id: string,
  x: number,
  y: number,
  color: string,
};
let players: { [id: string]: Player } = {};

const size = 50;
const width = 20;
const height = 20;

const dirKeys = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'];

let grid: d3.Selection<SVGSVGElement, any, HTMLElement, any>;
let row: d3.Selection<SVGGElement, Cell[], SVGSVGElement, any>;
// let square: d3.Selection<SVGRectElement, Cell, SVGGElement, Cell[]>;

const createGrid = () => {
  const rows: Cell[][] = [];

  for (let y = 0; y < height; y += 1) {
    rows.push([]);

    for (let x = 0; x < width; x += 1) {
      rows[y].push({
        x: (x * size) + 1,
        y: (y * size) + 1,
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

const updatePlayers = () => {
  const transition = d3.transition()
    .duration(100);

  grid.selectAll<SVGSVGElement, Player>('.player')
    .data(Object.values(players), d => d.id)
    .join(
      enter => enter
        .append('rect')
        .attr('class', 'player')
        .attr('x', d => (d.x * size) + 1)
        .attr('y', d => (d.y * size) + 1)
        .attr('width', size)
        .attr('height', size)
        .style('fill', d => `#${d.color}`)
        .style('opacity', 0)
        .call(x => x.transition(transition)
          .style('opacity', 1)),
      update => update
        .call(x => x.transition(transition)
          .attr('x', d => (d.x * size) + 1)
          .attr('y', d => (d.y * size) + 1)),
      exit => exit
        .call(x => x.transition(transition)
          .style('opacity', 0)
          .remove()),
    );
};

const soko = (socket: Socket) => {
  createGrid();

  socket.on('players', (newPlayers: { [id: string]: Player }) => {
    players = newPlayers;
    updatePlayers();
  });

  socket.on('playerAdd', (id: string, player: Player) => {
    players[id] = player;
    updatePlayers();
  });

  socket.on('playerUpdate', (id: string, player: Player) => {
    players[id] = player;
    updatePlayers();
  });

  socket.on('playerDelete', (id: string) => {
    delete players[id];
    updatePlayers();
  });

  document.body.addEventListener('keyup', e => {
    if (dirKeys.includes(e.key)) {
      socket.emit('move', dirKeys.indexOf(e.key));
    }
  });
};
export default soko;

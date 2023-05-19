import Konva from 'konva';

import { SokoRoomState, Player } from '../../server/rooms/SokoRoom';


export default class Soko {
  cellSize: number = 30;

  state: SokoRoomState;

  stage: Konva.Stage;
  grid: Konva.Layer;
  players: Konva.Layer;

  cellPos(cells: number) {
    return cells * (this.cellSize + 1) + 1;
  }

  constructor(state: SokoRoomState) {
    // Handle state

    this.state = state;

    this.state.players.onAdd(player => {
      this.addPlayer(player);
      player.onChange(() => this.updatePlayer(player));
    });

    this.state.players.onRemove(player => {
      this.removePlayer(player);
    });

    // Initialize stage and layers

    this.stage = new Konva.Stage({
      container: 'grid',
    });

    this.grid = new Konva.Layer({
      listening: false,
    });
    this.stage.add(this.grid);

    this.players = new Konva.Layer({
      listening: false,
      visible: false,
    });
    this.stage.add(this.players);

    // Set up resize observer

    let debounceTimeout: any;
    const observer = new ResizeObserver(entries => {
      entries.forEach(entry => {
        entry.contentBoxSize.forEach(boxSize => {
          clearTimeout(debounceTimeout);
          debounceTimeout = setTimeout(() => {
            this.updateSize(boxSize.inlineSize, boxSize.blockSize);
          }, 200);
        });
      });
    });

    // Once we have grid size from state, start triggering draw events on window resize
    this.state.listen('width', () => {
      observer.observe(document.body);
    });
  }

  updateSize(maxWidth: number, maxHeight: number) {
    const maxCellWidth = Math.floor((maxWidth - 1) / this.state.width) - 1;
    const maxCellHeight = Math.floor((maxHeight - 1) / this.state.height) - 1;
    const cellSize = Math.max(5, Math.min(50, Math.min(maxCellWidth, maxCellHeight)));

    if (cellSize !== this.cellSize) {
      this.cellSize = cellSize;

      this.stage.size({
        width: this.cellPos(this.state.width),
        height: this.cellPos(this.state.height),
      });
      this.drawGrid();
      this.drawPlayers();
    }
  }

  drawGrid() {
    this.players.visible(false);
    this.grid.destroyChildren();
    for (let y = 0; y < this.state.height; y += 1) {
      for (let x = 0; x < this.state.width; x += 1) {
        this.grid.add(new Konva.Rect({
          x: this.cellPos(x),
          y: this.cellPos(y),
          width: this.cellSize + 1,
          height: this.cellSize + 1,
          stroke: 'black',
          strokeWidth: 1,
        }));
      }
    }
    this.players.visible(true);
  }

  addPlayer(player: Player) {
    this.players.add(new Konva.Rect({
      id: player.id,
      x: this.cellPos(player.x),
      y: this.cellPos(player.y),
      width: this.cellSize,
      height: this.cellSize,
      fill: player.color,
    }));
  }

  updatePlayer(player: Player) {
    this.players.findOne(`#${player.id}`).to({
      x: this.cellPos(player.x),
      y: this.cellPos(player.y),
      duration: 0.05,
    });
  }

  removePlayer(player: Player) {
    this.players.findOne(`#${player.id}`).destroy();
  }

  drawPlayers() {
    this.players.destroyChildren();
    this.state.players.forEach(player => this.addPlayer(player));
  }
}

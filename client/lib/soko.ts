import Konva from 'konva';

import { SokoRoomState, Player } from '../../server/rooms/SokoRoom';


export default class Soko {
  cellSize: number = 30;
  gridSize: number = 20;

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
      width: this.cellPos(this.gridSize),
      height: this.cellPos(this.gridSize),
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

    // Size grid to window

    let debounceTimeout: any;

    const observer = new ResizeObserver(entries => {
      entries.forEach(entry => {
        entry.contentBoxSize.forEach(boxSize => {
          clearTimeout(debounceTimeout);
          debounceTimeout = setTimeout(() => {
            this.updateSize(boxSize.blockSize, boxSize.inlineSize);
          }, 200);
        });
      });
    });
    observer.observe(document.body);
  }

  updateSize(width: number, height: number) {
    const windowSize = Math.min(width, height);
    const cellSize = Math.max(5, Math.min(50, Math.floor((windowSize - 1) / this.gridSize) - 1));

    if (cellSize !== this.cellSize) {
      this.cellSize = cellSize;

      this.stage.size({
        width: this.cellPos(this.gridSize),
        height: this.cellPos(this.gridSize),
      });
      this.drawGrid();
      this.drawPlayers();
    }
  }

  drawGrid() {
    this.players.visible(false);
    this.grid.destroyChildren();
    for (let y = 0; y < this.gridSize; y += 1) {
      for (let x = 0; x < this.gridSize; x += 1) {
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

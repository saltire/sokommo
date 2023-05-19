import Konva from 'konva';

import { Player } from '../../server/rooms/SokoRoom';


const cellSize = 30;
const gridWidth = 20;
const gridHeight = 20;

const gridPos = (
  units: number, unitSize: number = cellSize, borderSize: number = 1,
) => units * (unitSize + borderSize) + borderSize;

export default class Soko {
  stage: Konva.Stage;
  grid: Konva.Layer;
  players: Konva.Layer;

  constructor() {
    this.stage = new Konva.Stage({
      container: 'grid',
      width: gridPos(gridWidth),
      height: gridPos(gridHeight),
    });

    this.grid = new Konva.Layer({
      listening: false,
    });
    this.stage.add(this.grid);

    this.players = new Konva.Layer({
      listening: false,
    });
    this.stage.add(this.players);

    this.drawGrid();
  }

  drawGrid() {
    for (let y = 0; y < gridHeight; y += 1) {
      for (let x = 0; x < gridWidth; x += 1) {
        this.grid.add(new Konva.Rect({
          x: gridPos(x),
          y: gridPos(y),
          width: cellSize + 1,
          height: cellSize + 1,
          stroke: 'black',
          strokeWidth: 1,
        }));
      }
    }
  }

  addPlayer(player: Player) {
    this.players.add(new Konva.Rect({
      id: player.id,
      x: gridPos(player.x),
      y: gridPos(player.y),
      width: cellSize,
      height: cellSize,
      fill: player.color,
    }));
  }

  updatePlayer(player: Player) {
    this.players.findOne(`#${player.id}`).to({
      x: gridPos(player.x),
      y: gridPos(player.y),
      duration: 0.05,
    });
  }

  removePlayer(player: Player) {
    this.players.findOne(`#${player.id}`).destroy();
  }
}

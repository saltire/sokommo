import Konva from 'konva';

import { Player } from '../../server/rooms/SokoRoom';


const size = 30;
const width = 20;
const height = 20;

const players: { [index: string]: Konva.Rect } = {};

let layer: Konva.Layer;

export const createGrid = () => {
  const stage = new Konva.Stage({
    container: 'grid',
    width: width * (size + 1) + 1,
    height: height * (size + 1) + 1,
  });

  const grid = new Konva.Layer({
    listening: false,
  });
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      grid.add(new Konva.Rect({
        x: x * (size + 1) + 1,
        y: y * (size + 1) + 1,
        width: size + 1,
        height: size + 1,
        stroke: 'black',
        strokeWidth: 1,
      }));
    }
  }
  stage.add(grid);

  layer = new Konva.Layer({
    listening: false,
  });
  stage.add(layer);
};

export const addPlayer = (player: Player) => {
  players[player.id] = new Konva.Rect({
    x: player.x * (size + 1) + 1,
    y: player.y * (size + 1) + 1,
    width: size,
    height: size,
    fill: player.color,
  });
  layer.add(players[player.id]);
};

export const updatePlayer = (player: Player) => {
  players[player.id].to({
    x: player.x * (size + 1) + 1,
    y: player.y * (size + 1) + 1,
    duration: 0.05,
  });
};

export const removePlayer = (player: Player) => {
  players[player.id].destroy();
  delete players[player.id];
};

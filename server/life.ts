export const initializeRows = (width: number, height: number, density: number) => {
  const rows: boolean[][] = [];

  for (let y = 0; y < height; y += 1) {
    rows[y] = [];

    for (let x = 0; x < width; x += 1) {
      rows[y][x] = Math.random() < density;
    }
  }

  return rows;
};

export const getNewRows = (rows: boolean[][]) => {
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

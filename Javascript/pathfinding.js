// pathfinding.js
import { ROWS, COLS } from './state.js';
import { shuffle } from './data.js';

export function neighbors(r, c) {
  return [[r-1,c],[r+1,c],[r,c-1],[r,c+1]]
    .filter(([rr,cc]) => rr>=0&&rr<ROWS&&cc>=0&&cc<COLS);
}

export function findPath(path = [[0,0]], visited = new Set(['0,0'])) {
  // Your DFS Hamiltonian path search
  if (path.length === ROWS * COLS) return path;
  const [r, c] = path[path.length - 1];
  for (let [nr, nc] of shuffle(neighbors(r, c))) {
    const key = `${nr},${nc}`;
    if (!visited.has(key)) {
      visited.add(key); path.push([nr, nc]);
      const res = findPath(path, visited);
      if (res) return res;
      visited.delete(key); path.pop();
    }
  }
  return null;
}
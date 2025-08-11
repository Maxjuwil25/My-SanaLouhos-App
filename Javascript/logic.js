// logic.js
import { state, refs, clearSelection } from './state.js';
import { drawConnections } from './connections.js';
import { announce } from './ui.js';

export function isAdjacent(a, b) {
  const r1 = +a.dataset.row; const c1 = +a.dataset.col;
  const r2 = +b.dataset.row; const c2 = +b.dataset.col;
  return Math.abs(r1 - r2) <= 1 && Math.abs(c1 - c2) <= 1;
}

export function handleTileClick(e) {
  const tile = e.target;

  const last = state.selectedTiles[state.selectedTiles.length - 1];
  const secondLast = state.selectedTiles[state.selectedTiles.length - 2];

  if (!(tile instanceof HTMLElement) || !tile.classList.contains('tile')) return;

  // Clicking a completed tile removes that whole word
  if (tile.classList.contains('complete')) {
    const group = state.completedTiles.find(g => g.includes(tile));
    if (group) {
      group.forEach(t => {
        t.classList.remove('complete');
        t.classList.remove('current');
        t.classList.remove('selected');
        t.removeAttribute('data-group-index');
      });
      state.completedTiles = state.completedTiles.filter(g => g !== group);
      drawConnections();
      clearSelection();
    }
    return;
  }

  if (tile === last) {
      if (state.selectedTiles.length > 1) {
        secondLast.classList.add('current');
      }
    tile.classList.remove('selected');
    tile.classList.remove('current');
    state.selectedTiles.pop();
    return;
    }

  // Prevent selecting same tile twice
  if (state.selectedTiles.includes(tile)) return;

 
  if (!last || isAdjacent(tile, last)) {
    tile.classList.add('selected');
    state.selectedTiles.forEach(t => t.classList.remove('current'));
    tile.classList.add('current');
    state.selectedTiles.push(tile);
  }
}

export function submitWord() {
  if (!state.selectedTiles.length) return;
  const word = state.selectedTiles.map(t => t.textContent).join('').toLowerCase();
  if (!word) return;
  console.log(word);

  if (state.dictionaryArray.includes(word)) {
    state.selectedTiles.forEach(t => t.classList.add('complete'));
    announce('Word accepted!');
    state.completedTiles.push([...state.selectedTiles]);
    drawConnections();
    clearSelection();

    if (checkWin()) {
      setTimeout(() => {
        alert('+999,999,999 Social Credit');
        announce('You win!');
        resetGame();
      }, 50);
    }
  } else {
    alert(`"${word}" ei löytynyt sanakirjasta.`);
    clearSelection();
  }
}

export function allTilesUsed() {
  const totalTiles = document.querySelectorAll('.tile').length;
  const used = new Set();
  state.completedTiles.forEach(group => group.forEach(tile => used.add(tile)));
  console.log(used.size);
  return used.size === totalTiles && totalTiles > 0;
}

export function checkWin() {
  return allTilesUsed();
}

export function resetGame() {
  state.completedTiles.forEach(group =>
    group.forEach(tile => tile.classList.remove('complete'))
  );
  state.completedTiles = [];
  drawConnections();
  clearSelection();
  shuffleGrid();
}

// Wire your existing shuffle + render pipeline
import { pickWords, segmentPath } from './data.js';
import { findPath } from './pathfinding.js';
import { renderGrid } from './ui.js';

export function shuffleGrid() {
  state.selectedTiles = [];
  // (You had a stray completedWords = [] in source; using completedTiles only)
  state.currentWords = pickWords().sort(() => Math.random() - 0.5);
  console.log(state.currentWords);

  const path = findPath();
  state.gridData = segmentPath(path, state.currentWords);

  renderGrid();
  drawConnections();
}
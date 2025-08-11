// state.js
export const ROWS = 6;
export const COLS = 5;

// Game-wide state
export const state = {
  gridData: [],            // 6x5 grid of letters
  selectedTiles: [],       // tiles selected for the current word
  completedTiles: [],      // array of tiles for completed words
  dictionaryArray: [],     // words_fi.json for correct word checks
  commonArray: [],         // common words list from which the grid is generated
  currentWords: [],        // chosen 5 words (sum length = 30)
};

// DOM refs
export const refs = {
  gridEl: null,            // <div id="grid">
  svg: null,               // <svg id="connections">
  submitBtn: null,         // <button id="btn">
};

export function initRefs() {
  refs.gridEl = document.getElementById('grid');
  refs.submitBtn = document.getElementById('btn');
}

export function clearSelection() {
  state.selectedTiles.forEach(t => t.classList.remove('selected'));
  state.selectedTiles.forEach(t => t.classList.remove('current'));
  state.selectedTiles = [];
}
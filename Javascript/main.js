// main.js
import { initRefs, refs } from './state.js';
import { loadDictionaries } from './data.js';
import { renderGrid } from './ui.js';
import { handleTileClick, submitWord, shuffleGrid } from './logic.js';

window.addEventListener('DOMContentLoaded', async () => {
  initRefs();
  renderGrid();

  if (refs.gridEl) refs.gridEl.addEventListener('click', handleTileClick);
  if (refs.submitBtn) refs.submitBtn.addEventListener('click', submitWord);
  document.addEventListener('keydown', e => { if (e.key === 'Enter') submitWord(); });

  await loadDictionaries();
  shuffleGrid();
});
// ui.js
import { refs, state } from './state.js';
import { drawConnections } from './connections.js';

export function ensureSvgLayer() {
  if (!refs.gridEl) return;
  refs.gridEl.style.position = 'relative';
  if (!refs.svg) {
    const ns = 'http://www.w3.org/2000/svg';
    refs.svg = document.createElementNS(ns, 'svg');
    refs.svg.setAttribute('id', 'connections');
    refs.svg.style.position = 'absolute';
    refs.svg.style.inset = '0';
    refs.svg.style.pointerEvents = 'none';
    refs.gridEl.appendChild(refs.svg);
  }
}

export function renderGrid() {
  if (!refs.gridEl) return;
  ensureSvgLayer();
  refs.gridEl.innerHTML = '';
  refs.gridEl.appendChild(refs.svg); // keep SVG under tiles

  for (let r = 0; r < state.gridData.length; r++) {
    for (let c = 0; c < state.gridData[r].length; c++) {
      const tile = document.createElement('button');
      tile.type = 'button';
      tile.className = 'tile';
      tile.setAttribute('role', 'gridcell');
      tile.dataset.row = r;
      tile.dataset.col = c;
      tile.textContent = state.gridData[r][c];
      refs.gridEl.appendChild(tile);
    }
  }

  drawConnections();
}

export function announce(msg) {
  const status = document.getElementById('status');
  if (status) status.textContent = msg;
}
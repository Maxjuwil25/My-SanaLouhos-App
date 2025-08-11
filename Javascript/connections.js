// connections.js
import { refs, state, clearSelection } from './state.js';
import { installHoverHighlights } from './highlight.js';

export function drawConnections2() {
  if (!refs.svg) return;
  while (refs.svg.firstChild) refs.svg.removeChild(refs.svg.firstChild);
  const gridRect = refs.gridEl.getBoundingClientRect();

  const offset = 5;

    state.completedTiles.forEach((group, gi) => {
        group.forEach(tile => {
        tile.dataset.groupIndex = String(gi);
        tile.classList.add('complete')
        })
        
        const centers = group.map(tile => {
            const rect = tile.getBoundingClientRect();
            return {
                x: (rect.left + rect.right) / 2 - gridRect.left,
                y: (rect.top + rect.bottom) / 2 - gridRect.top
            };
        })

        let start = centers[0];
        if (centers.length > 1) {
            const next = centers[1];
            const dx = start.x - next.x;
            const dy = start.y - next.y
            const len = Math.hypot(dx, dy) || 1;
            start = {
                x: start.x + (dx/len) * offset,
                y: start.y + (dy/len) * offset
            };
        }
        

        let end = centers[centers.length - 1];
        if (centers.length > 1) {
            const prev = centers[centers.length - 2];
            const dx = end.x - prev.x;
            const dy = end.y - prev.y
            const len = Math.hypot(dx, dy) || 1;
            end = {
                x: end.x + (dx/len) * offset,
                y: end.y + (dy/len) * offset
            };
        }
        console.log(end + start);
        

        const allPoints = [start, ...centers, end]
        .map(p => `${p.x}, ${p.y}`)
        .join(' ');

        const ns = 'http://www.w3.org/2000/svg';
        const poly = document.createElementNS(ns, 'polyline');
        poly.setAttribute('points', allPoints);
        poly.classList.add('connection');
        poly.dataset.groupIndex = String(gi);

        poly.style.pointerEvents = 'all';

        poly.addEventListener('click', e => {
            e.stopPropagation();               
            const idx = +poly.dataset.groupIndex;
            const groupToClear = state.completedTiles[idx];
            groupToClear.forEach(tile => {
                tile.classList.remove('complete'); 
                tile.classList.remove('current'); 
                tile.classList.remove('selected');
                tile.removeAttribute('data-group-index');
            });
            state.completedTiles.splice(idx, 1);
            drawConnections();
            clearSelection();
        });

        refs.svg.appendChild(poly);
        
    });
  

    installHoverHighlights();
}

export function drawConnections() {
  while (refs.svg.firstChild) refs.svg.removeChild(refs.svg.firstChild);

  const gridRect = refs.gridEl.getBoundingClientRect();

  // keep SVG coords in sync with the grid box (helps on resize)
  refs.svg.setAttribute('viewBox', `0 0 ${gridRect.width} ${gridRect.height}`);
  refs.svg.setAttribute('width', gridRect.width);
  refs.svg.setAttribute('height', gridRect.height);

  const offset = 6; // px to extend line ends

  state.completedTiles.forEach((group, gi) => {
    group.forEach(tile => {
      tile.dataset.groupIndex = String(gi);
      tile.classList.add('complete');
    });

    // centers in SVG coords
    const centers = group.map(tile => {
      const r = tile.getBoundingClientRect();
      return {
        x: (r.left + r.right) / 2 - gridRect.left,
        y: (r.top + r.bottom) / 2 - gridRect.top,
      };
    });

    if (!centers.length) return;

    // replace first/last with trimmed versions (don't append)
    const pts = centers.slice();

    if (pts.length > 1) {
      const shrinkToward = (a, b) => {
        const dx = a.x - b.x, dy = a.y - b.y;
        const len = Math.hypot(dx, dy) || 1;
        return { x: a.x + (dx / len) * offset, y: a.y + (dy / len) * offset };
      };
      pts[0] = shrinkToward(pts[0], pts[1]);
      pts[pts.length - 1] = shrinkToward(pts[pts.length - 1], pts[pts.length - 2]);
    }

    const ns = 'http://www.w3.org/2000/svg';
    const poly = document.createElementNS(ns, 'polyline');
    poly.setAttribute('points', pts.map(p => `${p.x},${p.y}`).join(' '));
    poly.dataset.groupIndex = String(gi);

    poly.style.pointerEvents = 'all'; // Lines are clickable

    poly.addEventListener('click', e => {
      e.stopPropagation();
      const idx = +poly.dataset.groupIndex;
      const groupToClear = state.completedTiles[idx];
      if (!groupToClear) return;
      groupToClear.forEach(tile => {
        tile.classList.remove('complete', 'current', 'selected');
        tile.removeAttribute('data-group-index');
      });
      state.completedTiles.splice(idx, 1);
      drawConnections();
      clearSelection();
    });

    refs.svg.appendChild(poly);
  });

  installHoverHighlights();
}

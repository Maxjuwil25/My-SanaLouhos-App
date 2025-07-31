const gridEl = document.getElementById('grid');

const gridData = [
    ['K','E','D','A','S'],
    ['I','S','O','T','I'],
    ['A','S','T','O','R'],
    ['M','I','S','J','H'],
    ['A','M','L','E','O'],
    ['A','I','L','M','A']
];

let selectedTiles = [];
let completedTiles = [];
let dictionary = new Set();
let WORDS_TO_FIND = 5;



fetch('words_fi.json')
    .then(res => res.json())
    .then(words => {
        dictionary = new Set(words);
     })
    .catch(err => console.error('Dictionary load failed', err));

document.addEventListener('DOMContentLoaded', () => {
  renderGrid();
  document.getElementById('btn').addEventListener('click', submitWord);
});

function renderGrid () {
    for (let r=0; r < gridData.length; r++) {
        for (let c=0; c < gridData[r].length; c++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            tile.dataset.row = r;
            tile.dataset.col = c;
            tile.textContent = gridData[r][c];
            gridEl.appendChild(tile);
        }

    }   
}

gridEl.addEventListener('click', (e) => {

  const tile = e.target;
  if (!tile.classList.contains('tile')) return;

  if (tile.classList.contains('complete')) {
    const group = completedTiles.find(g => g.includes(tile));
    
    
    if (group) {
      group.forEach(t => t.classList.remove('complete'));
      completedTiles = completedTiles.filter(g => g !== group);
      drawConnections();
    }
    return;
  }

  handleTileClick(tile);
});

function handleTileClick (tile) {
    const last = selectedTiles[selectedTiles.length - 1];
    if (tile === last) {
    tile.classList.remove('selected');
    tile.classList.remove('current');
    selectedTiles.pop();
    return;
    }

    if (selectedTiles.includes(tile)) {
    return;
    }

    if (!last || isAdjacent(tile, last)) {
    tile.classList.add('selected');
    selectedTiles.forEach(t => t.classList.remove('current'));
    tile.classList.add('current');
    selectedTiles.push(tile);
    }

}

function isAdjacent(a, b) {
  const r1 = +a.dataset.row;
  const c1 = +a.dataset.col;
  const r2 = +b.dataset.row;
  const c2 = +b.dataset.col;
  return Math.abs(r1 - r2) <= 1 && Math.abs(c1 - c2) <= 1;
}

function submitWord() {
  const word = selectedTiles.map(t => t.textContent).join('').toLowerCase(); 
  if (!word) return;

  if (dictionary.has(word)) {
    selectedTiles.forEach(t => t.classList.add('complete'));
    completedTiles.push([...selectedTiles]);
    drawConnections();

    if (completedTiles.length >= WORDS_TO_FIND) {
      setTimeout(() => {
        alert('+999,999,999 Social Credit');
        resetGame();
      }, 50);
    }

  } else {
    alert(`"${word}" ei löytynyt sanakirjasta.`);
  }

  clearSelection();
}

function resetGame () {
  completedTiles.forEach(group =>
    group.forEach(tile => tile.classList.remove('complete'))
  );
  completedTiles = [];
  drawConnections();
  clearSelection();

  // Here a shuffle function can be implemented
}

function clearSelection() {
  selectedTiles.forEach(t => t.classList.remove('selected'));
  selectedTiles.forEach(t => t.classList.remove('current'));
  selectedTiles = [];
}

const svgNS = 'http://www.w3.org/2000/svg';
const svg = document.createElementNS(svgNS, 'svg');
svg.setAttribute('id', 'connections');
svg.style.position = 'absolute';
svg.style.top = '0'; svg.style.left = '0';
svg.style.width = '100%'; svg.style.height = '100%';
svg.style.pointerEvents = 'none';
gridEl.style.position = 'relative';
gridEl.appendChild(svg);

function drawConnections() {
  while (svg.firstChild) svg.removeChild(svg.firstChild);
  const gridRect = gridEl.getBoundingClientRect();

  const offset = 5;

  completedTiles.forEach((group, gi) => {
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
      prev = centers[centers.length - 2];
      const dx = end.x - prev.x;
      const dy = end.y - prev.y
      const len = Math.hypot(dx, dy) || 1;
      end = {
        x: end.x + (dx/len) * offset,
        y: end.y + (dy/len) * offset
      };
    }

    const allPoints = [start, ...centers, end]
      .map(p => `${p.x}, ${p.y}`)
      .join(' ');

    const poly = document.createElementNS(svgNS, 'polyline');
    poly.setAttribute('points', allPoints);

    poly.dataset.groupIndex = gi;

    poly.style.pointerEvents = 'all';

    poly.addEventListener('click', e => {
      e.stopPropagation();               
      const idx = +poly.dataset.groupIndex;
      const groupToClear = completedTiles[idx];
      groupToClear.forEach(t => t.classList.remove('complete'));
      completedTiles.splice(idx, 1);
      drawConnections();
    });

    svg.appendChild(poly);
  });
}
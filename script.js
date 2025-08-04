
/* const gridData = [
    ['K','E','D','A','S'],
    ['I','S','O','T','I'],
    ['A','S','T','O','R'],
    ['M','I','S','J','H'],
    ['A','M','L','E','O'],
    ['A','I','L','M','A']
]; */

let dictionary = new Set();
let WORDS_TO_FIND = 5;
gridEl = document.getElementById('grid');

let dictionaryArray = [];
let commonArray = [];
let currentWords = [];
let gridData = [];
let selectedTiles = [];
let completedTiles = [];

const svgNS = 'http://www.w3.org/2000/svg';
const svg = document.createElementNS(svgNS, 'svg');
svg.setAttribute('id', 'connections');
svg.style.position = 'absolute';
svg.style.top = '0'; svg.style.left = '0';
svg.style.width = '100%'; svg.style.height = '100%';
svg.style.pointerEvents = 'none';
gridEl.style.position = 'relative';
gridEl.appendChild(svg);

document.addEventListener('DOMContentLoaded', async () => {
  renderGrid();
  document.getElementById('btn').addEventListener('click', submitWord);
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      submitWord();
    }
  });
  await loadDictionary();
  shuffleGrid();
});

async function loadDictionary() {
  try {
    const response = await fetch('dictionaries/words_fi.json');
    if (!response.ok) {
      throw new Error(`Dictionary fetch failed: ${response.status}`);
    }
    dictionaryArray = await response.json();
    console.log('Loaded', dictionaryArray.length, 'words');
  } catch (err) {
    console.error('Failed to load dictionary', err);
    dictionaryArray = [];
  }
  try {
    const response = await fetch('dictionaries/words.json');
    if (!response.ok) {
      throw new Error(`Dictionary fetch failed: ${response.status}`);
    }
    commonArray = await response.json();
    commonArray = commonArray.map(w => w.split(' ')[0]);
    console.log('Loaded', commonArray.length, 'common-words');
  } catch (err) {
    console.error('Failed to load dictionary', err);
    commonArray = [];
  }
}

function pickWords() {
  const target = 30, count = 5;
  const filtered = commonArray.filter(w => w.length >= 3 && w.length <= 8 && !w.includes('-'));
  const shuffled = shuffle(filtered);
  let result = null;
  function backtrack(start, chosen, sum) {
    if (chosen.length === count) {
      if (sum === target) { result = chosen.slice(); return true; }
      return false;
    }
    for (let i = start; i < shuffled.length; i++) {
      const w = shuffled[i];
      if (sum + w.length > target) continue;
      chosen.push(w);
      if (backtrack(i + 1, chosen, sum + w.length)) return true;
      chosen.pop();
    }
    return false;
  }
  backtrack(0, [], 0);
  if (!result) throw new Error('No word combination found');
  return result
}

function shuffleGrid () {
  selectedTiles = [];
  completedWords = [];

  currentWords = pickWords().sort(() => Math.random() - 0.5);
  console.log(currentWords);
  

  const path = findPath();

  gridData = segmentPath(path, currentWords);

  renderGrid();
  drawConnections();
}

function renderGrid () {
  if (!gridEl) return;
  gridEl.innerHTML = '';
  gridEl.appendChild(svg);

    for (let r=0; r < gridData.length; r++) {
        for (let c=0; c < gridData[r].length; c++) {
            const tile = document.createElement('button');
            tile.type = 'button';
            tile.className = 'tile';
            tile.setAttribute('role','gridcell');
            tile.dataset.row = r;
            tile.dataset.col = c;
            tile.textContent = gridData[r][c];
            gridEl.appendChild(tile);
        }

    }   
}

function segmentPath(path, words) {
  const data = Array.from({ length: 6 }, () => Array(5).fill(''));
  let idx = 0;
  for (let w of words) {
    for (let ch of w) {
      const [r, c] = path[idx++];
      data[r][c] = ch.toUpperCase();
    }
  }
  return data;
}

const ROWS = 6, COLS = 5;
function neighbors(r, c) {
  return [[r-1,c],[r+1,c],[r,c-1],[r,c+1]]
    .filter(([rr,cc]) => rr>=0&&rr<ROWS&&cc>=0&&cc<COLS);
}
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length-1; i>0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}
function findPath(path = [[0,0]], visited = new Set(['0,0'])) {
  if (path.length === ROWS*COLS) return path;
  const [r,c] = path[path.length-1];
  for (let [nr,nc] of shuffle(neighbors(r,c))) {
    const key = `${nr},${nc}`;
    if (!visited.has(key)) {
      visited.add(key); path.push([nr,nc]);
      const res = findPath(path, visited);
      if (res) return res;
      visited.delete(key); path.pop();
    }
  }
  return null;
}

gridEl.addEventListener('click', (e) => {

  const tile = e.target;
  if (!tile.classList.contains('tile')) return;

  if (tile.classList.contains('complete')) {
    const group = completedTiles.find(g => g.includes(tile));
    
    
    if (group) {
      group.forEach(tile => {
        tile.classList.remove('complete'); 
        tile.classList.remove('current'); 
        tile.classList.remove('selected');
      });
      completedTiles = completedTiles.filter(g => g !== group);
      drawConnections();
    }
    return;
  }

  handleTileClick(tile);
});

function handleTileClick (tile) {
    const last = selectedTiles[selectedTiles.length - 1];
    const secondLast = selectedTiles[selectedTiles.length - 2];
    if (tile === last) {
      if (selectedTiles.length > 1) {
        secondLast.classList.add('current');
      }
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
  console.log(dictionaryArray);
  if (!selectedTiles.length) return;
  const word = selectedTiles.map(t => t.textContent).join('').toLowerCase(); 
  if (!word) return;
  console.log(word);
  

  if (dictionaryArray.includes(word)) {
    selectedTiles.forEach(t => t.classList.add('complete'));
    announce("Word accepted!");
    completedTiles.push([...selectedTiles]);
    drawConnections();
    clearSelection();

    if (completedTiles.length >= WORDS_TO_FIND) {
      setTimeout(() => {
        alert('+999,999,999 Social Credit');
        announce("You win!");
        resetGame();
      }, 50);
    }

  } else {
    alert(`"${word}" ei löytynyt sanakirjasta.`);
    clearSelection();
  }
}

function resetGame () {
  completedTiles.forEach(group =>
    group.forEach(tile => tile.classList.remove('complete'))
  );
  completedTiles = [];
  drawConnections();
  clearSelection();

  shuffleGrid();

  // Here a shuffle function can be implemented
}

function clearSelection() {
  selectedTiles.forEach(t => t.classList.remove('selected'));
  selectedTiles.forEach(t => t.classList.remove('current'));
  selectedTiles = [];
}

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
      groupToClear.forEach(tile => {
        tile.classList.remove('complete'); 
        tile.classList.remove('current'); 
        tile.classList.remove('selected');
      });
      completedTiles.splice(idx, 1);
      drawConnections();
      clearSelection();
    });

    svg.appendChild(poly);
  });
}

function announce(msg) {
  const status = document.getElementById('status');
  status.textContent = msg;
}
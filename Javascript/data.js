// data.js
import { state } from './state.js';

export async function loadDictionaries() {
  // Your original two fetches, made properly async
  try {
    const response = await fetch('dictionaries/words_fi.json');
    if (!response.ok) throw new Error(`Dictionary fetch failed: ${response.status}`);
    state.dictionaryArray = await response.json();
    console.log('Loaded', state.dictionaryArray.length, 'words');
  } catch (err) {
    console.error('Failed to load dictionary', err);
    state.dictionaryArray = [];
  }
  try {
    const response = await fetch('dictionaries/words.json');
    if (!response.ok) throw new Error(`Common list fetch failed: ${response.status}`);
    // Your original code maps to first token
    state.commonArray = (await response.json()).map(w => w.split(' ')[0]);
  } catch (err) {
    console.error('Failed to load common words', err);
    state.commonArray = [];
  }
}

export function pickWords() {
  // Moved over from your script as-is
  const target = 30, count = 5;
  const filtered = state.commonArray.filter(w => w.length >= 3 && w.length <= 8 && !w.includes('-'));
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
  return result;
}

export function segmentPath(path, words) {
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

export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
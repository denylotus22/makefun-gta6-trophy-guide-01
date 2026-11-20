// Progress store: earned trophies + spoiler setting in localStorage, with JSON export/import.
// Nothing leaves the browser: the file is written by download, and import reads a file the user picks.
export const STORAGE_KEY = 'gta6-trophy-guide-v1';

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { earned: {}, spoiler: true };
    const data = JSON.parse(raw);
    return {
      earned: (data && typeof data.earned === 'object' && data.earned !== null) ? data.earned : {},
      spoiler: data && typeof data.spoiler === 'boolean' ? data.spoiler : true,
    };
  } catch {
    return { earned: {}, spoiler: true };
  }
}

export function saveProgress(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ earned: state.earned, spoiler: state.spoiler }));
  } catch {
    // Storage full or blocked (private mode): progress still works for this session.
  }
}

export function toggleEarned(state, id) {
  const next = { ...state, earned: { ...state.earned } };
  if (next.earned[id]) delete next.earned[id];
  else next.earned[id] = true;
  saveProgress(next);
  return next;
}

export function earnedCount(state) {
  return Object.keys(state.earned).length;
}

export function earnedByGrade(state, trophies) {
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of trophies) if (state.earned[t.id]) counts[t.grade] += 1;
  return counts;
}

export function exportProgress(state) {
  const blob = new Blob([JSON.stringify({ app: 'gta6-trophy-guide', earned: Object.keys(state.earned).map(Number).sort((a, b) => a - b), exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'gta6-trophy-progress.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function parseImportedProgress(text, trophies) {
  const data = JSON.parse(text);
  const ids = Array.isArray(data) ? data : data.earned;
  if (!Array.isArray(ids)) throw new Error('File must hold an "earned" array of trophy ids.');
  const known = new Set(trophies.map((t) => t.id));
  const earned = {};
  for (const id of ids) {
    const n = Number(id);
    if (known.has(n)) earned[n] = true;
  }
  return earned;
}

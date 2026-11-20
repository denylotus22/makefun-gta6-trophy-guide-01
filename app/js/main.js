// Boot: load the trophy data, wire the controls, route between Tracker / Roadmap / Missables,
// and keep the checklist, the guide pane and the progress bar in sync.
import { earnedCount, exportProgress, loadProgress, parseImportedProgress, saveProgress, toggleEarned } from './store.js';
import { renderDetail, renderMissables, renderProgress, renderRoadmap, renderTracker } from './views.js';

const state = loadProgress();
let trophies = [];
let selectedId = null;
const filters = { search: '', grade: 'all', kind: 'all', earned: 'all' };

function currentView() {
  const hash = location.hash || '#/tracker';
  if (hash.startsWith('#/roadmap')) return 'roadmap';
  if (hash.startsWith('#/missables')) return 'missables';
  return 'tracker';
}

function refreshAll() {
  renderProgress(state, trophies);
  document.querySelectorAll('.tab').forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.view === currentView());
  });
  document.getElementById('view-tracker').hidden = currentView() !== 'tracker';
  document.getElementById('view-roadmap').hidden = currentView() !== 'roadmap';
  document.getElementById('view-missables').hidden = currentView() !== 'missables';
  const selected = trophies.find((t) => t.id === selectedId) || null;
  if (currentView() === 'tracker') {
    renderTracker(state, trophies, filters, selectedId, selectTrophy, toggleTrophy);
    renderDetail(state, selected, toggleTrophy);
  } else if (currentView() === 'roadmap') {
    renderRoadmap(state, trophies);
  } else {
    renderMissables(state, trophies);
  }
}

function selectTrophy(id) {
  selectedId = id;
  refreshAll();
}

function toggleTrophy(id) {
  const next = toggleEarned(state, id);
  state.earned = next.earned;
  refreshAll();
}

function bindControls() {
  document.getElementById('search').addEventListener('input', (e) => {
    filters.search = e.target.value;
    refreshAll();
  });
  document.getElementById('gradeFilter').addEventListener('change', (e) => {
    filters.grade = e.target.value;
    refreshAll();
  });
  document.getElementById('kindFilter').addEventListener('change', (e) => {
    filters.kind = e.target.value;
    refreshAll();
  });
  document.getElementById('earnedFilter').addEventListener('change', (e) => {
    filters.earned = e.target.value;
    refreshAll();
  });
  const spoiler = document.getElementById('spoilerToggle');
  spoiler.checked = state.spoiler;
  spoiler.addEventListener('change', () => {
    state.spoiler = spoiler.checked;
    saveProgress(state);
    refreshAll();
  });
  document.getElementById('exportBtn').addEventListener('click', () => exportProgress(state));
  document.getElementById('importFile').addEventListener('change', async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      const earned = parseImportedProgress(await file.text(), trophies);
      state.earned = earned;
      saveProgress(state);
      refreshAll();
      alert(`Imported progress: ${earnedCount(state)} of ${trophies.length} trophies earned.`);
    } catch (err) {
      alert(`Could not import that file: ${err.message}`);
    }
    e.target.value = '';
  });
  window.addEventListener('hashchange', refreshAll);
}

async function bootGuide() {
  const res = await fetch('data/trophies.json');
  if (!res.ok) throw new Error(`Could not load data/trophies.json (${res.status})`);
  const data = await res.json();
  trophies = Array.isArray(data) ? data : data.trophies;
  bindControls();
  refreshAll();
}

bootGuide().catch((err) => {
  document.getElementById('trophyList').innerHTML = `<li class="trophy-row">Could not load the trophy list: ${err.message}</li>`;
});

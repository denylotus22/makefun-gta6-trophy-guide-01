// Renderers: the tracker list + guide pane, the platinum roadmap, and the missables page.
// The roadmap stages are built from each trophy's stage, which comes from its official description.
import { earnedByGrade, earnedCount } from './store.js';
import { filterTrophies, gradeLabel, isHiddenBySpoiler, kindLabel } from './filters.js';

const ROADMAP_STAGES = [
  {
    id: 'story',
    title: 'Step 1 — Play the story (Chapters 1–5)',
    note: 'About 60–80 hours. All 12 story trophies unlock automatically, none can be missed — but do the Chapter 1 meditation for Positive Mental Attitude before Chapter 1 ends, and clear stranger strands as they open. There is no mission replay.',
    hours: '60–80 hours',
  },
  {
    id: 'strangers',
    title: 'Step 2 — Strangers & side missions',
    note: 'Eight stranger strands for the silver, including the five named strangers with their own trophies. Hunt Bret’s unique animal and meditate at every spot you pass.',
    hours: 'Alongside the story',
  },
  {
    id: 'activities',
    title: 'Step 3 — Activities & challenges',
    note: 'Work the 9 activity types (Touchpad > Progress > Activities): 250 stunts, gold medals at the Shooting Range, drone races, 20 different races, fishing, arcade, bowling — and 50 of the 80 challenges.',
    hours: 'Tens of hours',
  },
  {
    id: 'collectibles',
    title: 'Step 4 — Collectibles & exploration',
    note: 'Explore all of Leonida, discover and scan 100 vehicles (200 of 277 for 100%), complete 3 card sets, WAiNK It at 100 locations, register 10 vehicles to the Scooter Bros app.',
    hours: 'Tens of hours',
  },
  {
    id: 'crime',
    title: 'Step 5 — Crime, money & secrets',
    note: 'Shop robberies with your partner, bank vaults, armored trucks, gang operations, Marked Bills laundering ($250,000), $100,000 of spending, all garages — plus the secret trophies whose triggers players are still pinning down.',
    hours: 'Tens of hours',
  },
  {
    id: 'cleanup',
    title: 'Step 6 — 100% checklist, then the platinum',
    note: 'After the story the 35-line 100% checklist opens (Progress menu). It is about 60% true completion and needs any 70 of 80 challenges. Finish it for A Long Road, and Vice Got a Price! follows.',
    hours: 'About 100 hours',
  },
];

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
}

export function renderProgress(state, trophies) {
  const n = earnedCount(state);
  const byGrade = earnedByGrade(state, trophies);
  document.getElementById('earnedCount').textContent = String(n);
  document.getElementById('progressFill').style.width = `${Math.round((n / trophies.length) * 100)}%`;
  document.getElementById('progressDetail').textContent =
    `Platinum ${byGrade.platinum}/1 · Gold ${byGrade.gold}/2 · Silver ${byGrade.silver}/6 · Bronze ${byGrade.bronze}/46`;
}

export function renderTracker(state, trophies, filters, selectedId, onSelect, onToggle) {
  const list = document.getElementById('trophyList');
  const shown = filterTrophies(trophies, state, filters);
  document.getElementById('listMeta').textContent =
    `Showing ${shown.length} of ${trophies.length} trophies · ${earnedCount(state)} earned`;
  list.innerHTML = '';
  for (const t of shown) {
    const hidden = isHiddenBySpoiler(t, state);
    const li = el('li', `trophy-row${state.earned[t.id] ? ' earned' : ''}${selectedId === t.id ? ' selected' : ''}`);
    li.dataset.id = String(t.id);
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = Boolean(state.earned[t.id]);
    box.setAttribute('aria-label', `Mark ${hidden ? 'story trophy' : t.name} earned`);
    box.addEventListener('click', (e) => { e.stopPropagation(); onToggle(t.id); });
    li.appendChild(box);
    li.appendChild(el('span', `medal ${t.grade}`));
    const main = el('div', 'trophy-main');
    main.appendChild(el('div', 'trophy-name', hidden ? 'Hidden story trophy' : t.name));
    main.appendChild(el('div', 'trophy-desc', hidden ? 'Complete the story to reveal this trophy.' : t.description));
    const tags = el('div', 'trophy-tags');
    tags.appendChild(el('span', `tag grade-${t.grade}`, gradeLabel(t.grade)));
    if (t.kind !== 'platinum') tags.appendChild(el('span', 'tag', kindLabel(t.kind)));
    if (t.missable) tags.appendChild(el('span', 'tag missable', '⚠ Missable'));
    if (hidden) tags.appendChild(el('span', 'tag hidden-trophy', 'Hidden on PlayStation'));
    main.appendChild(tags);
    li.appendChild(main);
    li.addEventListener('click', () => onSelect(t.id));
    list.appendChild(li);
  }
  if (shown.length === 0) {
    list.appendChild(el('li', 'trophy-row', 'No trophies match these filters.'));
  }
}

export function renderDetail(state, trophy, onToggle) {
  const pane = document.getElementById('detailPane');
  pane.innerHTML = '';
  if (!trophy) {
    pane.appendChild(el('p', 'detail-empty', 'Select a trophy to read its guide, sources and missable notes.'));
    return;
  }
  const hidden = isHiddenBySpoiler(trophy, state);
  pane.appendChild(el('h2', '', hidden ? 'Hidden story trophy' : trophy.name));
  const tags = el('div', 'trophy-tags');
  tags.appendChild(el('span', `tag grade-${trophy.grade}`, gradeLabel(trophy.grade)));
  if (trophy.kind !== 'platinum') tags.appendChild(el('span', 'tag', kindLabel(trophy.kind)));
  if (trophy.missable) tags.appendChild(el('span', 'tag missable', '⚠ Missable'));
  pane.appendChild(tags);
  pane.appendChild(el('p', 'official', hidden ? 'Official description hidden until earned (spoiler setting is on).' : `Official description: “${trophy.description}”`));
  if (trophy.missable) {
    pane.appendChild(el('div', 'missable-warn', '⚠ Missable — PowerPyx flags this as the only potentially missable trophy: the first meditation spot, at Jason’s house in Chapter 1, becomes unavailable after that chapter. Meditate there before finishing Chapter 1.'));
  }
  pane.appendChild(el('h3', '', 'Guide'));
  pane.appendChild(el('p', 'guide-text', hidden ? 'Earn this trophy to reveal its guide.' : trophy.guide));
  pane.appendChild(el('h3', '', 'Sources'));
  const ul = el('ul', 'sources');
  for (const s of trophy.sources) ul.appendChild(el('li', '', s));
  pane.appendChild(ul);
  const btn = el('button', `earn-btn${state.earned[trophy.id] ? ' earned' : ''}`, state.earned[trophy.id] ? '✓ Earned — click to unmark' : 'Mark as earned');
  btn.type = 'button';
  btn.addEventListener('click', () => onToggle(trophy.id));
  pane.appendChild(btn);
}

export function renderRoadmap(state, trophies) {
  const intro = document.getElementById('roadmapIntro');
  intro.innerHTML = '';
  intro.appendChild(el('p', '', 'One playthrough, about 200 hours, difficulty 4/10. No online trophies, no difficulty settings, and cheats disable trophies and saving — keep cheats off for the whole run. The order below is built from the official trophy descriptions.'));
  const stats = el('div', 'stats');
  for (const [value, label] of [['200 hours', 'to the platinum'], ['4 / 10', 'difficulty (PowerPyx)'], ['1', 'playthrough needed'], ['0', 'online trophies'], ['5', 'story chapters'], ['35 lines', '100% checklist']]) {
    const s = el('div', 'stat');
    s.appendChild(el('b', '', value));
    s.appendChild(el('span', '', label));
    stats.appendChild(s);
  }
  intro.appendChild(stats);
  const ol = document.getElementById('roadmapStages');
  ol.innerHTML = '';
  for (const stage of ROADMAP_STAGES) {
    const items = trophies.filter((t) => t.stage === stage.id);
    const li = el('li', 'roadmap-stage');
    const h = el('h2', '', `${stage.title} `);
    h.appendChild(el('span', 'stage-count', `· ${items.filter((t) => state.earned[t.id]).length}/${items.length} earned · ${stage.hours}`));
    li.appendChild(h);
    li.appendChild(el('p', '', stage.note));
    const chips = el('div', 'stage-trophies');
    for (const t of items) {
      const hidden = isHiddenBySpoiler(t, state);
      chips.appendChild(el('span', 'tag', `${state.earned[t.id] ? '✓ ' : ''}${hidden ? 'Hidden story trophy' : t.name}`));
    }
    li.appendChild(chips);
    ol.appendChild(li);
  }
}

export function renderMissables(state, trophies) {
  const body = document.getElementById('missablesBody');
  body.innerHTML = '';
  const missable = trophies.filter((t) => t.missable);
  const hero = el('div', 'missable-hero');
  hero.appendChild(el('h2', '', `Only ${missable.length} trophy can be missed`));
  hero.appendChild(el('p', '', 'PowerPyx — the guide this page cites — flags exactly one trophy as potentially missable. Every other trophy can be earned in free-roam after the story, so there is no need to rush or to start over.'));
  hero.appendChild(el('p', '', 'One warning still applies: there is no mission replay, so anything tied to a story mission must be done when the mission runs. The story trophies themselves are automatic and cannot be missed.'));
  body.appendChild(hero);
  const list = el('div', 'missable-list');
  for (const t of missable) {
    const card = el('div', 'trophy-row');
    card.appendChild(el('span', `medal ${t.grade}`));
    const main = el('div', 'trophy-main');
    main.appendChild(el('div', 'trophy-name', `${t.name} — ${gradeLabel(t.grade)}`));
    main.appendChild(el('div', 'trophy-desc', t.description));
    main.appendChild(el('p', 'guide-text', t.guide));
    const tags = el('div', 'trophy-tags');
    tags.appendChild(el('span', 'tag missable', '⚠ Missable'));
    tags.appendChild(el('span', 'tag', state.earned[t.id] ? '✓ Earned' : 'Not earned yet'));
    main.appendChild(tags);
    card.appendChild(main);
    list.appendChild(card);
  }
  body.appendChild(list);
  body.appendChild(el('p', 'safe-note', 'Safe: the 12 story trophies (chapters and named missions) unlock automatically and cannot be missed. Collectibles, activities, stranger strands, crime and money trophies are all repeatable or doable in free-roam after the story. Cheats disable trophies — keep them off.'));
}

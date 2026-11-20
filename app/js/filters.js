// Filtering and the spoiler rule. A story trophy stays hidden (name, description and guide
// masked) while spoilers are on and it is not yet earned; earning it reveals it.
export function isStoryTrophy(trophy) {
  return trophy.kind === 'story';
}

export function isHiddenBySpoiler(trophy, state) {
  return state.spoiler && isStoryTrophy(trophy) && !state.earned[trophy.id];
}

export function filterTrophies(trophies, state, filters) {
  const query = (filters.search || '').trim().toLowerCase();
  return trophies.filter((t) => {
    if (filters.grade !== 'all' && t.grade !== filters.grade) return false;
    if (filters.kind === 'missable' && !t.missable) return false;
    else if (filters.kind !== 'all' && filters.kind !== 'missable' && t.kind !== filters.kind) return false;
    if (filters.earned === 'earned' && !state.earned[t.id]) return false;
    if (filters.earned === 'remaining' && state.earned[t.id]) return false;
    if (query) {
      const hay = `${t.name} ${t.description} ${t.guide} ${t.kind}`.toLowerCase();
      if (!hay.includes(query)) return false;
    }
    return true;
  });
}

export function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

export function kindLabel(kind) {
  const labels = {
    story: 'Story', activity: 'Activity', collectible: 'Collectible', stranger: 'Stranger',
    crime: 'Crime', money: 'Money', misc: 'Secret & misc', completion: '100% completion', platinum: 'Platinum',
  };
  return labels[kind] || kind;
}

// highlight.js
export const mqHover = matchMedia('(hover: hover) and (pointer: fine)');

export function highlightGroup(groupId, on) {
  document
    .querySelectorAll(`#connections polyline[data-group-index="${groupId}"]`)
    .forEach(pl => pl.classList.toggle('highlight', !!on));
}

export function installHoverHighlights() {
  const tiles = document.querySelectorAll('.tile[data-group-index]');

  tiles.forEach(t => {
    t.onpointerenter = t.onpointerleave = t.onfocus = t.onblur =
    t.onpointerdown = t.onpointerup = t.onpointercancel = null;
  });

  tiles.forEach(t => {
    const gid = t.dataset.groupIndex;

    t.onfocus = () => highlightGroup(gid, true);
    t.onblur  = () => highlightGroup(gid, false);

    if (mqHover.matches) {
      t.onpointerenter = () => highlightGroup(gid, true);
      t.onpointerleave = () => highlightGroup(gid, false);
    } else {
      t.onpointerdown   = () => highlightGroup(gid, true);
      t.onpointerup     = () => highlightGroup(gid, false);
      t.onpointercancel = () => highlightGroup(gid, false);
    }
  });
}
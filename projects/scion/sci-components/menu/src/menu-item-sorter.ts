import {SciMenuItemLike} from './menu.model';

/**
 * Standard JavaScript sorting algorithms cannot be used as it requires strict weak element ordering (transitivity),
 * not given for elements positioned relative to each other.
 */
export function sortMenuItems(menuItems: SciMenuItemLike[]): SciMenuItemLike[] {
  const sorted = [] as SciMenuItemLike[];
  const queue = new Set(menuItems);

  // Add contributions which do not declare an insertion point or a non-existent insertion point.
  menuItems.forEach(menuItem => {
    // Add contribution if not declaring an insertion point.
    if (!menuItem.position) {
      sorted.push(menuItem);
      queue.delete(menuItem);
    }
    // Add contribution if declaring a "non-existent"  insertion point.
    else if (menuItem.position?.before && !menuItems.some(it => it.name === menuItem.position!.before)) {
      sorted.push(menuItem);
      queue.delete(menuItem);
    }
    // Add contribution if declaring a "non-existent" insertion point.
    else if (menuItem.position?.after && !menuItems.some(it => it.name === menuItem.position!.after)) {
      sorted.push(menuItem);
      queue.delete(menuItem);
    }
  });

  // Add contributions at start and end
  menuItems.forEach(menuItem => {
    if (menuItem.position?.position === 'start') {
      sorted.unshift(menuItem);
      queue.delete(menuItem);
    }
    else if (menuItem.position?.position === 'end') {
      sorted.push(menuItem);
      queue.delete(menuItem);
    }
  });

  // Add contributions declaring an insertion point. Multiple iterations may be required.
  while (queue.size) {
    const queueSize = queue.size;

    for (const menuItem of queue) {
      // Add contributions declaring a before "insertion point".
      if (menuItem.position?.before) {
        const index = sorted.findIndex(candidate => candidate.name === menuItem.position!.before);
        if (index !== -1) {
          sorted.splice(index, 0, menuItem);
          queue.delete(menuItem);
        }
      }
      // Add contributions declaring an after "insertion point".
      else if (menuItem.position?.after) {
        const index = sorted.findIndex(candidate => candidate.name === menuItem.position!.after);
        if (index !== -1) {
          sorted.splice(index + 1, 0, menuItem);
          queue.delete(menuItem);
        }
      }
    }

    if (queue.size === queueSize) {
      console.warn('Dangling menu contributions detected. Adding contributions to the end.', queue);
      sorted.push(...queue);
      queue.clear();
    }
  }

  return sorted;
}

// function compare(a: SciMenuItemContribution | SciMenuContribution | SciMenuGroupContribution, b: SciMenuItemContribution | SciMenuContribution | SciMenuGroupContribution): number {
//   if ((a.position?.before && b.name.some(name => name === a.position!.before)) || (b.position?.after && a.name.some(name => name === b.position!.after))) {
//     return -1;
//   }
//   if ((a.position?.after && b.name.some(name => name === a.position!.after)) || (b.position?.before && a.name.some(name => name === b.position!.before))) {
//     return 1;
//   }
//   return 0;
//
//   // TODO WHY UI Fehler?
//   // if (a.position?.before === b.name || b.position?.after === a.name) {
//   //   return -1;
//   // }
//   // if (a.position?.after === b.name || b.position?.before === a.name) {
//   //   return 1;
//   // }
//   // return 0;
// }


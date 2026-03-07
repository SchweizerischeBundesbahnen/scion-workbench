import {SciMenuContributions} from './menu-contribution.model';

/**
 * Standard JavaScript sorting algorithms cannot be used as it requires strict weak element ordering (transitivity),
 * not given for elements positioned relative to each other.
 */
export function sortMenuContributions(contributions: SciMenuContributions): SciMenuContributions {
  const sorted = [] as SciMenuContributions;
  const queue = new Set(contributions);

  // Add contributions which do not declare an insertion point or a non-existent insertion point.
  contributions.forEach(contribution => {
    // Add contribution if not declaring an insertion point.
    if (!contribution.position?.before && !contribution.position?.after) {
      sorted.push(contribution);
      queue.delete(contribution);
    }

    // Add contribution if declaring a "non-existent"  insertion point.
    if (contribution.position?.before && !contributions.some(it => it.name === contribution.position!.before)) {
      sorted.push(contribution);
      queue.delete(contribution);
    }

    // Add contribution if declaring a "non-existent" insertion point.
    if (contribution.position?.after && !contributions.some(it => it.name === contribution.position!.after)) {
      sorted.push(contribution);
      queue.delete(contribution);
    }
  });

  // Add contributions declaring an insertion point. Multiple iterations may be required.
  while (queue.size) {
    const queueSize = queue.size;

    for (const contribution of queue) {
      // Add contributions declaring a before "insertion point".
      if (contribution.position?.before) {
        const index = sorted.findIndex(candidate => candidate.name === contribution.position!.before);
        if (index !== -1) {
          sorted.splice(index, 0, contribution);
          queue.delete(contribution);
        }
      }
      // Add contributions declaring an after "insertion point".
      else if (contribution.position?.after) {
        const index = sorted.findIndex(candidate => candidate.name === contribution.position!.after);
        if (index !== -1) {
          sorted.splice(index + 1, 0, contribution);
          queue.delete(contribution);
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


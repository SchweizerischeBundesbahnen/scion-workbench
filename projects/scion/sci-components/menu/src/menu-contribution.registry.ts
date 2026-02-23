import {computed, inject, Injectable, signal, Signal, WritableSignal} from '@angular/core';
import {SciMenuContributionUnion} from './menu-contribution.model';
import {Disposable} from './common/disposable';
import {SCI_MENU_ADAPTER} from './menu-adapter';

@Injectable({providedIn: 'root'})
export class SciMenuContributionRegistry {

  private readonly _contributions = new Map<string, WritableSignal<SciMenuContributionUnion[]>>;
  private readonly _menuAdapter = inject(SCI_MENU_ADAPTER, {optional: true});

  public registerMenuContributions(location: `menu:${string}` | `toolbar:${string}` | `group:${string}`, contributions: SciMenuContributionUnion[]): Disposable {
    if (this._menuAdapter) {
      return this._menuAdapter.contributeMenu(location, contributions);
    }

    if (!this._contributions.has(location)) {
      this._contributions.set(location, signal([]));
    }

    this._contributions.get(location)!.update(currentContributions => currentContributions.concat(contributions));

    return {
      dispose: () => {
        // Do not remove signal for listener to never have a "stale" signal.
        this._contributions.get(location)!.update(currentContributions => currentContributions.filter(candidate => !contributions.includes(candidate)));
      },
    }
  }

  public menuContributions(...locations: Array<`menu:${string}` | `toolbar:${string}` | `group:${string}` | undefined>): Signal<SciMenuContributionUnion[]> {
    return computed(() => {
      return sort(locations
        .filter(location => location !== undefined)
        .reduce((contributions, location) => contributions.concat(this.findByLocation(location)()), new Array<SciMenuContributionUnion>()))
    });
  }

  private findByLocation(location: `menu:${string}` | `toolbar:${string}` | `group:${string}`): Signal<SciMenuContributionUnion[]> {
    if (this._menuAdapter) {
      return this._menuAdapter.menuContributions(location);
    }

    // If no contributions are registered yet, register signal for the signal to "emit" when contributions are registered.
    if (!this._contributions.has(location)) {
      this._contributions.set(location, signal([]));
    }

    return this._contributions.get(location)!;
  }
}

export function compare(a: SciMenuContributionUnion, b: SciMenuContributionUnion): number {
  if ((a.position?.before && a.position.before === b.name) || (b.position?.after && b.position.after === a.name)) {
    return -1;
  }
  if ((a.position?.after && a.position.after === b.name) || (b.position?.before && b.position.before === a.name)) {
    return 1;
  }
  return 0;

  // TODO WHY UI Fehler?
  // if (a.position?.before === b.name || b.position?.after === a.name) {
  //   return -1;
  // }
  // if (a.position?.after === b.name || b.position?.before === a.name) {
  //   return 1;
  // }
  // return 0;
}

/**
 * Standard JavaScript sorting algorithms cannot be used as it requires strict weak element ordering (transitivity),
 * not given for elements positioned relative to each other.
 */
function sort(contributions: SciMenuContributionUnion[]): SciMenuContributionUnion[] {
  const sorted = new Array<SciMenuContributionUnion>();
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

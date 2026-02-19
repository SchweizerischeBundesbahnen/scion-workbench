import {computed, inject, Injectable, Signal, signal} from '@angular/core';
import {SciMenuItem} from '../ɵmenu';

@Injectable()
export class MenuFilter {

  private readonly _parentFilter = inject(MenuFilter, {skipSelf: true, optional: true});
  private readonly _filter = signal<RegExp | null>(null);

  public readonly filterActive: Signal<boolean> = computed(() => {
    if (this._filter()) {
      return true;
    }
    return this._parentFilter?.filterActive() ?? false;
  });

  public setFilter(filter: string | null): void {
    this._filter.set(filter ? new RegExp(filter, 'i') : null);
  }

  public matches(menuItem: SciMenuItem): Signal<boolean> {
    return computed(() => {
      const filter = this._filter();
      // Test against current filter
      if (filter) {
        if (menuItem.matchesFilter && !menuItem.matchesFilter(filter.source)) {
          return false;
        }

        const label = menuItem.label?.();
        if (typeof label === 'string' && !label.match(filter)) {
          return false;
        }
      }

      // Test again parent filter
      if (this._parentFilter && !this._parentFilter.matches(menuItem)()) {
        return false;
      }

      return true;
    });
  }
}

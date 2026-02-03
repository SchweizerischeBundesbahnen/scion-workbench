import {computed, inject, Injectable, Signal, signal} from '@angular/core';

@Injectable()
export class MenuFilter {

  private readonly _parent = inject(MenuFilter, {skipSelf: true, optional: true});
  private readonly _filter = signal<RegExp | null>(null);

  public setFilter(filter: string | null): void {
    this._filter.set(filter ? new RegExp(filter, 'i') : null);
  }

  public matches(text: string | undefined): Signal<boolean> {
    return computed(() => {
      if (!text) {
        return false;
      }

      const filter = this._filter();
      if (filter && !text.match(filter)) {
        return false;
      }

      if (this._parent && !this._parent.matches(text)()) {
        return false;
      }

      return true;
    });
  }
}

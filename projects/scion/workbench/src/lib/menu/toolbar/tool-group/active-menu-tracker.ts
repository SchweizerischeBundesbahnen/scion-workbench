import {DestroyRef, Directive, inject, Injectable, signal} from '@angular/core';

@Directive({selector: '[wbActiveMenuTracker]'})
export class ActiveMenuTrackerDirective {

  constructor() {
    console.log('>>> construct ActiveMenuTrackerDirective');
    const activeMenuService = inject(ActiveMenuTracker);

    activeMenuService.registerActiveMenu(this);
    inject(DestroyRef).onDestroy(() => activeMenuService.unregisterActiveMenu(this));
  }
}

@Injectable()
export class ActiveMenuTracker {

  private readonly _activeMenu = signal<ActiveMenuTrackerDirective | null>(null);

  public hasActiveMenu(): boolean {
    return this._activeMenu() !== null;
  }

  public registerActiveMenu(menu: ActiveMenuTrackerDirective): void {
    this._activeMenu.set(menu);
  }

  public unregisterActiveMenu(menu: ActiveMenuTrackerDirective): void {
    this._activeMenu.update(activeMenu => activeMenu === menu ? null : activeMenu);
  }
}

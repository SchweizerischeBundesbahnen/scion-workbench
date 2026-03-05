import {SciMenu, SciMenuGroup} from './menu/menu.model';
import {ɵSciMenu} from './menu/ɵmenu.model';
import {effect, inject, Injector, runInInjectionContext, untracked} from '@angular/core';
import {SciToolbar, SciToolbarGroup} from './toolbar/toolbar.model';
import {ɵSciToolbar} from './toolbar/ɵtoolbar.model';
import {Disposable} from './common/disposable';
import {ɵSciMenuService} from './ɵmenu.service';
import {SciMenuContextProvider} from './menu-context-provider';
import {coerceSignal} from './common/common';

export function contributeMenu(location: `menu:${string}` | SciMenuContributionLocation, menuFactoryFn: (menu: SciMenu) => SciMenu, options?: SciMenuContributionOptions): Disposable;
export function contributeMenu(location: `toolbar:${string}` | SciToolbarContributionLocation, menuFactoryFn: (toolbar: SciToolbar) => SciToolbar, options?: SciMenuContributionOptions): Disposable;
export function contributeMenu(location: `group(menu):${string}` | SciToolbarGroupContributionLocation, menuFactoryFn: (group: SciMenuGroup) => SciMenuGroup, options?: SciMenuContributionOptions): Disposable;
export function contributeMenu(location: `group(toolbar):${string}` | SciMenuGroupContributionLocation, menuFactoryFn: (group: SciToolbarGroup) => SciToolbarGroup, options?: SciMenuContributionOptions): Disposable;
/** @internal */
export function contributeMenu(location: string | SciContributionLocation, factoryFn: Function, options?: SciMenuContributionOptions): Disposable;
export function contributeMenu(locationArg: string | SciContributionLocation, factoryFn: Function, options?: SciMenuContributionOptions): Disposable {
  const injector = Injector.create({parent: options?.injector ?? inject(Injector), providers: []});

  const {location, before, after, context} = typeof locationArg === 'string' ? {location: locationArg} : locationArg;
  return runInInjectionContext(injector, () => {
    const menuService = inject(ɵSciMenuService);

    const {contributions, menuContributions, groupContributions} = constructMenu(location, factoryFn);
    const environmentMenuContext = coerceSignal(inject(SciMenuContextProvider, {optional: true})?.provideContext?.());

    // Sort relative to other contributions.
    contributions.forEach(contribution => contribution.position = {before, after});

    effect((onCleanup) => {
      const mergedContext = new Map([...environmentMenuContext?.() ?? new Map(), ...context ?? new Map()]);

      untracked(() => {
        const registrations = new Array<Disposable>();
        registrations.push(menuService.contributeMenu(normalizeGroupLocation(location), contributions, mergedContext));
        registrations.push(...menuContributions.map(menuContribution => contributeMenu(menuContribution.location, menuContribution.factoryFn, {...options, injector})));
        registrations.push(...groupContributions.map(groupContribution => contributeMenu(groupContribution.location, groupContribution.factoryFn, {...options, injector})));

        onCleanup(() => {
          registrations.forEach(registration => registration.dispose());
          registrations.length = 0;
        })
      });
    });

    return {
      dispose: () => injector.destroy(),
    };
  });
}

function normalizeGroupLocation(location: string): `menu:${string}` | `toolbar:${string}` | `group:${string}` {
  const regex = /^group\((menu|toolbar)\):(?<name>.+)/;
  const match = regex.exec(location);
  if (match) {
    return `group:${match.groups!['name']}`;
  }
  return location as `menu:${string}` | `toolbar:${string}` | `group:${string}`;
}

function constructMenu(location: string, factoryFn: Function): ɵSciMenu | ɵSciToolbar {
  if (location.startsWith('menu:') || location.startsWith('group(menu):')) {
    const menu = new ɵSciMenu();
    void factoryFn(menu);
    return menu;
  }
  else if (location.startsWith('toolbar:') || location.startsWith('group(toolbar):')) {
    const toolbar = new ɵSciToolbar();
    void factoryFn(toolbar);
    return toolbar;
  }
  else {
    throw Error('Illegal contribution point');
  }
}

export interface SciMenuContributionOptions {
  /**
   * This function must be called within an injection context, or an explicit {@link Injector} passed. Destroying the injection context will unregister contributed menus.
   */
  injector?: Injector;
}

export interface SciMenuContributionLocation {
  location: `menu:${string}`;
  context?: Map<string, unknown>;
  before?: `menuitem:${string}` | `menu:${string}` | `group:${string}`;
  after?: `menuitem:${string}` | `menu:${string}` | `group:${string}`;
}

export interface SciToolbarContributionLocation {
  location: `toolbar:${string}`;
  context?: Map<string, unknown>;
  before?: `menuitem:${string}` | `menu:${string}` | `group:${string}`;
  after?: `menuitem:${string}` | `menu:${string}` | `group:${string}`;
}

export interface SciMenuGroupContributionLocation {
  location: `group(menu):${string}`;
  context?: Map<string, unknown>;
  before?: `menuitem:${string}` | `menu:${string}` | `group:${string}`;
  after?: `menuitem:${string}` | `menu:${string}` | `group:${string}`;
}

export interface SciToolbarGroupContributionLocation {
  location: `group(toolbar):${string}`;
  context?: Map<string, unknown>;
  before?: `menuitem:${string}` | `menu:${string}` | `group:${string}`;
  after?: `menuitem:${string}` | `menu:${string}` | `group:${string}`;
}

export interface SciContributionLocation {
  location: string;
  context?: Map<string, unknown>;
  before?: `menuitem:${string}` | `menu:${string}` | `group:${string}`;
  after?: `menuitem:${string}` | `menu:${string}` | `group:${string}`;
}

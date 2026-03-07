import {SciMenu, SciMenuGroup} from './menu/menu.model';
import {ɵSciMenu} from './menu/ɵmenu.model';
import {assertNotInReactiveContext, effect, inject, Injector, untracked} from '@angular/core';
import {SciToolbar, SciToolbarGroup} from './toolbar/toolbar.model';
import {ɵSciToolbar} from './toolbar/ɵtoolbar.model';
import {Disposable} from './common/disposable';
import {ɵSciMenuService} from './ɵmenu.service';
import {SciMenuContextProvider} from './menu-context-provider';
import {coerceSignal} from './common/common';
import {SciMenuContributionLocation, SciMenuGroupContributionLocation, SciToolbarContributionLocation, SciToolbarGroupContributionLocation} from './menu-contribution.model';

export function contributeMenu(location: `menu:${string}` | SciMenuContributionLocation, menuFactoryFn: (menu: SciMenu, context: Map<string, unknown>) => void, options?: SciMenuContributionOptions): Disposable;
export function contributeMenu(location: `toolbar:${string}` | SciToolbarContributionLocation, menuFactoryFn: (toolbar: SciToolbar, context: Map<string, unknown>) => void, options?: SciMenuContributionOptions): Disposable;
export function contributeMenu(location: `group(menu):${string}` | SciMenuGroupContributionLocation, groupFactoryFn: (group: SciMenuGroup, context: Map<string, unknown>) => void, options?: SciMenuContributionOptions): Disposable;
export function contributeMenu(location: `group(toolbar):${string}` | SciToolbarGroupContributionLocation, groupFactoryFn: (group: SciToolbarGroup, context: Map<string, unknown>) => void, options?: SciMenuContributionOptions): Disposable;
/** @internal */
export function contributeMenu(locationLike: string | SciContributionLocation, factoryFn: Function, options?: SciMenuContributionOptions): Disposable;
export function contributeMenu(locationLike: string | SciContributionLocation, factoryFn: Function, options?: SciMenuContributionOptions): Disposable {
  assertNotInReactiveContext(contributeMenu, 'Call contributeMenu in a non-reactive (non-tracking) context, such as within the untracked() function.');

  const injector = Injector.create({parent: options?.injector ?? inject(Injector), providers: []});
  const {location, before, after, context} = typeof locationLike === 'string' ? {location: locationLike} as SciContributionLocation : locationLike;

  const menuService = injector.get(ɵSciMenuService);
  const menuContextProvider = injector.get(SciMenuContextProvider, null, {optional: true});
  const environmentMenuContext = coerceSignal(menuContextProvider?.provideContext?.());

  effect((onCleanup) => {
    const mergedContext = new Map([...environmentMenuContext?.() ?? new Map(), ...context ?? new Map()]);

    untracked(() => {
      const contributionRef = menuService.contributeMenu(normalizeLocation(location), {
        scope: location.startsWith('menu:') || location.startsWith('group(menu):') ? 'menu' : 'toolbar',
        factory: factoryFn as ((menu: SciMenu | SciToolbar, context: Map<string, unknown>) => void) | ((group: SciMenuGroup | SciToolbarGroup, context: Map<string, unknown>) => void),
        context: mergedContext,
        before, after,
      });
      onCleanup(() => contributionRef.dispose());
    });
  }, {injector});

  return {
    dispose: () => injector.destroy(),
  };
}

// export function contributeMenu(locationLike: string | SciContributionLocation, factoryFn: Function, options?: SciMenuContributionOptions): Disposable {
//   const injector = Injector.create({parent: options?.injector ?? inject(Injector), providers: []});
//
//   const {location, before, after, context} = typeof locationLike === 'string' ? {location: locationLike} as SciContributionLocation : locationLike;
//   return runInInjectionContext(injector, () => {
//     const menuService = inject(ɵSciMenuService);
//
//     const {contributions, menuContributions, groupContributions} = constructMenu(location, factoryFn);
//     const environmentMenuContext = coerceSignal(inject(SciMenuContextProvider, {optional: true})?.provideContext?.());
//
//     // Sort relative to other contributions.
//     contributions.forEach(contribution => contribution.position = {before, after});
//
//     effect((onCleanup) => {
//       const mergedContext = new Map([...environmentMenuContext?.() ?? new Map(), ...context ?? new Map()]);
//
//       untracked(() => {
//         const registrations = new Array<Disposable>();
//         registrations.push(menuService.contributeMenu(location, contributions, mergedContext));
//         registrations.push(...menuContributions.map(menuContribution => contributeMenu({location: menuContribution.location, context}, menuContribution.factoryFn, {...options, injector})));
//         registrations.push(...groupContributions.map(groupContribution => contributeMenu({location: groupContribution.location, context}, groupContribution.factoryFn, {...options, injector})));
//
//         onCleanup(() => {
//           registrations.forEach(registration => registration.dispose());
//           registrations.length = 0;
//         })
//       });
//     });
//
//     return {
//       dispose: () => injector.destroy(),
//     };
//   });
// }

function constructMenu(location: string, factoryFn: Function): ɵSciMenu | ɵSciToolbar {
  if (location.startsWith('menu:') || location.startsWith('group(menu):')) {
    const menu = new ɵSciMenu();
    factoryFn(menu);
    return menu;
  }
  else if (location.startsWith('toolbar:') || location.startsWith('group(toolbar):')) {
    const toolbar = new ɵSciToolbar();
    factoryFn(toolbar);
    return toolbar;
  }
  else {
    throw Error('Illegal contribution point');
  }
}

function normalizeLocation(location: `menu:${string}` | `toolbar:${string}` | `group(menu):${string}` | `group(toolbar):${string}`): `menu:${string}` | `toolbar:${string}` | `group:${string}` {
  const regex = /^group\((menu|toolbar)\):(?<name>.+)/;
  const match = regex.exec(location);
  if (match) {
    return `group:${match.groups!['name']}`;
  }
  return location as `menu:${string}` | `toolbar:${string}`;
}

export interface SciMenuContributionOptions {
  /**
   * This function must be called within an injection context, or an explicit {@link Injector} passed. Destroying the injection context will unregister contributed menus.
   */
  injector?: Injector;
}

export type SciContributionLocation = SciMenuContributionLocation | SciToolbarContributionLocation | SciMenuGroupContributionLocation | SciToolbarGroupContributionLocation;

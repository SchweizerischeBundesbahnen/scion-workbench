import {SciMenuFactory, SciMenuGroupFactory} from './menu/menu.factory';
import {assertNotInReactiveContext, effect, inject, Injector, untracked} from '@angular/core';
import {SciToolbarFactory, SciToolbarGroupFactory} from './toolbar/toolbar.factory';
import {Disposable} from './common/disposable';
import {ɵSciMenuService} from './ɵmenu.service';
import {SciMenuContextProvider} from './menu-context-provider';
import {coerceSignal} from './common/common';
import {SciMenuContributionLocation, SciMenuContributionPosition, SciMenuGroupContributionLocation, SciToolbarContributionLocation, SciToolbarGroupContributionLocation} from './menu-contribution.model';
import {prune} from './common/prune.util';

export function contributeMenu(location: `menu:${string}` | SciMenuContributionLocation, menuFactoryFn: (menu: SciMenuFactory, context: Map<string, unknown>) => void, options?: SciMenuContributionOptions): Disposable;
export function contributeMenu(location: `toolbar:${string}` | SciToolbarContributionLocation, menuFactoryFn: (toolbar: SciToolbarFactory, context: Map<string, unknown>) => void, options?: SciMenuContributionOptions): Disposable;
export function contributeMenu(location: `group(menu):${string}` | SciMenuGroupContributionLocation, groupFactoryFn: (group: SciMenuGroupFactory, context: Map<string, unknown>) => void, options?: SciMenuContributionOptions): Disposable;
export function contributeMenu(location: `group(toolbar):${string}` | SciToolbarGroupContributionLocation, groupFactoryFn: (group: SciToolbarGroupFactory, context: Map<string, unknown>) => void, options?: SciMenuContributionOptions): Disposable;
/** @internal */
export function contributeMenu(locationLike: string | SciContributionLocation, factoryFn: Function, options?: SciMenuContributionOptions): Disposable;
export function contributeMenu(locationLike: string | SciContributionLocation, factoryFn: Function, options?: SciMenuContributionOptions): Disposable {
  assertNotInReactiveContext(contributeMenu, 'Call contributeMenu in a non-reactive (non-tracking) context, such as within the untracked() function.');

  const injector = Injector.create({parent: options?.injector ?? inject(Injector), providers: []});
  const {location, before, after, position} = typeof locationLike === 'string' ? {location: locationLike} as SciContributionLocation : locationLike;

  const menuService = injector.get(ɵSciMenuService);
  const menuContextProvider = injector.get(SciMenuContextProvider, null, {optional: true});
  const environmentContext = coerceSignal(menuContextProvider?.provideContext?.());

  effect((onCleanup) => {
    const requiredContext = environmentContext?.() ?? new Map();

    untracked(() => {
      const contributionRef = menuService.contributeMenu(normalizeLocation(location), {
        scope: location.startsWith('menu:') || location.startsWith('group(menu):') ? 'menu' : 'toolbar',
        factory: factoryFn as ((menu: SciMenuFactory | SciToolbarFactory, context: Map<string, unknown>) => void) | ((group: SciMenuGroupFactory | SciToolbarGroupFactory, context: Map<string, unknown>) => void),
        requiredContext,
        position: prune({before, after, position} as SciMenuContributionPosition, {pruneIfEmpty: true}),
      });
      onCleanup(() => contributionRef.dispose());
    });
  }, {injector});

  return {
    dispose: () => injector.destroy(),
  };
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

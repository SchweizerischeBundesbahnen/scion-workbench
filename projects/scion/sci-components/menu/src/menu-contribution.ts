import {assertInInjectionContext, assertNotInReactiveContext, effect, inject, runInInjectionContext, untracked} from '@angular/core';
import {Disposable} from './common/disposable';
import {ɵSciMenuService} from './ɵmenu.service';
import {SciMenuContextProvider} from './menu-context-provider';
import {coerceSignal} from './common/common';
import {SciMenuContributionLocation, SciMenuContributionLocationLike, SciMenuContributionOptions, SciMenuFactoryFn, SciMenuFactoryFnLike, SciMenuGroupContributionLocation, SciMenuGroupFactoryFn, SciToolbarContributionLocation, SciToolbarFactoryFn, SciToolbarGroupContributionLocation, SciToolbarGroupFactoryFn} from './menu-contribution.model';
import {createDestroyableInjector} from './common/injector.util';
import {SciMenuContributionInstantProvider} from './menu-contribution-instant.provider';

/**
 * By default, the contribution will be unregistered when the current injection context is destroyed.
 */
export function contributeMenu(location: `menu:${string}` | SciMenuContributionLocation, menuFactoryFn: SciMenuFactoryFn, options?: SciMenuContributionOptions): Disposable;
export function contributeMenu(location: `toolbar:${string}` | SciToolbarContributionLocation, toolbarFactoryFn: SciToolbarFactoryFn, options?: SciMenuContributionOptions): Disposable;
export function contributeMenu(location: `group(menu):${string}` | SciMenuGroupContributionLocation, groupFactoryFn: SciMenuGroupFactoryFn, options?: SciMenuContributionOptions): Disposable;
export function contributeMenu(location: `group(toolbar):${string}` | SciToolbarGroupContributionLocation, groupFactoryFn: SciToolbarGroupFactoryFn, options?: SciMenuContributionOptions): Disposable;
export function contributeMenu(locationLike: string | SciMenuContributionLocationLike, factoryFn: SciMenuFactoryFnLike, options?: SciMenuContributionOptions): Disposable {
  assertNotInReactiveContext(contributeMenu, 'Call contributeMenu in a non-reactive (non-tracking) context, such as within the untracked() function.');
  if (!options?.injector) {
    assertInInjectionContext(contributeMenu);
  }

  const injector = createDestroyableInjector({parent: options?.injector});
  const location = typeof locationLike === 'string' ? {location: locationLike} as SciMenuContributionLocationLike : locationLike;

  const menuService = injector.get(ɵSciMenuService);
  const menuContextProvider = injector.get(SciMenuContextProvider, null, {optional: true});
  const environmentContext = coerceSignal(runInInjectionContext(injector, () => menuContextProvider?.provideContext?.()));

  // Each contribution is assigned a unique contribution instant to keep its original order even if the reactive context changes.
  const contributionInstant = options?.contributionInstant ?? inject(SciMenuContributionInstantProvider).next();

  effect((onCleanup) => {
    const requiredContext = new Map([...environmentContext?.() ?? new Map(), ...options?.requiredContext ?? new Map()]);

    untracked(() => {
      const contributionRef = menuService.contributeMenu(location, factoryFn, {...options, requiredContext, contributionInstant});
      onCleanup(() => contributionRef.dispose());
    });
  }, {injector});

  return {
    dispose: () => injector.destroy(),
  };
}

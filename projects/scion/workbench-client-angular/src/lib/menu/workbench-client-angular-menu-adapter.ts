/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Disposable, SciMenuAdapter, SciMenuContextProvider, SciMenuContributionLocation, SciMenuContributionLocationLike, SciMenuContributionOptions, SciMenuFactoryFn, SciMenuFactoryFnLike, SciMenuItemLike, SciMenuOptions, SciMenuOrigin, SciMenuRef, SciToolbarContributionLocation, SciToolbarFactoryFn} from '@scion/sci-components/menu';
import {assertNotInReactiveContext, effect, ElementRef, EnvironmentProviders, inject, Injector, linkedSignal, makeEnvironmentProviders, runInInjectionContext, signal, Signal, untracked} from '@angular/core';
import {MaybeObservable, WorkbenchMenuFactory, WorkbenchMenuOrigin, WorkbenchMenuService, WorkbenchToolbarFactory, ɵWorkbenchMenuService} from '@scion/workbench-client';
import {coerceElement} from '@angular/cdk/coercion';
import {WorkbenchClientMenuFactoryDelegate} from './workbench-client-menu-factory-delegate';
import {WorkbenchClientToolbarFactoryDelegate} from './workbench-client-toolbar-factory-delegate';
import {SciMenuItems} from './workbench-client-menu-transform';
import {createDestroyableInjector} from '../common/injector.util';
import {Beans} from '@scion/toolkit/bean-manager';
import {ɵassertInInjectionContext} from '../common/common';
import {map} from 'rxjs/operators';
import {MaybeSignal, RequireOne} from '@scion/sci-components/common';
import {Translatable} from '@scion/sci-components/text';
import {toLazyObservable} from '../common/lazy-observable.util';
import {parseMenuLocation} from './workbench-menu-location-parser';

/**
 * Delegates menu contribution to `@scion/workbench`, enabling rendering of menu popover in the workbench host application and federation of menu items contributed by different micro apps.
 */
export class WorkbenchClientAngularMenuAdapter implements SciMenuAdapter {

  private readonly _workbenchMenuService = inject(ɵWorkbenchMenuService);
  private readonly _menuContextProvider = inject(SciMenuContextProvider, {optional: true});
  private readonly _injector = inject(Injector);

  /** @inheritDoc */
  public contributeMenu(location: SciMenuContributionLocationLike, factoryFn: SciMenuFactoryFnLike, options: SciMenuContributionOptions): Disposable {
    const {scope} = parseMenuLocation(location.location);

    // Delegate to `WorkbenchMenuService.contributeMenu` of `@scion/workbench-client`.
    switch (scope) {
      case 'menu': {
        return this._workbenchMenuService.contributeMenu(location as SciMenuContributionLocation, (menu, context) => {
          const menuFactoryFn = factoryFn as SciMenuFactoryFn;

          const injector = createDestroyableInjector({
            parent: this._injector,
            providers: this._menuContextProvider?.provideInjectionContext?.(context),
          });

          return runInInjectionContext(injector, () => tracked(() => menuFactoryFn(new WorkbenchClientMenuFactoryDelegate(menu), context), menu));
        }, {requiredContext: options.requiredContext, metadata: options.metadata, contributionInstant: options.contributionInstant});
      }
      case 'toolbar': {
        return this._workbenchMenuService.contributeMenu(location as SciToolbarContributionLocation, (toolbar, context) => {
          const toolbarFactoryFn = factoryFn as SciToolbarFactoryFn;

          const injector = createDestroyableInjector({
            parent: this._injector,
            providers: this._menuContextProvider?.provideInjectionContext?.(context),
          });

          return runInInjectionContext(injector, () => tracked(() => toolbarFactoryFn(new WorkbenchClientToolbarFactoryDelegate(toolbar), context), toolbar));
        }, {requiredContext: options.requiredContext, metadata: options.metadata, contributionInstant: options.contributionInstant});
      }
    }

    /**
     * Runs given function in a reactive context.
     */
    function tracked(fn: () => void, factory: WorkbenchMenuFactory | WorkbenchToolbarFactory): void {
      const injector = createDestroyableInjector({parent: inject(Injector)});

      // The menu factory function must be called synchronously. Since an effect runs asynchronously, we wrap the function call in a signal that we invoke immediately.
      // We then pass the signal to an effect to track changes. When tracked dependencies change, we only invalidate the menu, causing the re-creating of the menu.
      const executeFn = linkedSignal({
        source: () => undefined,
        computation: (_source, previous) => {
          // Create the menu if called for the first time.
          if (!previous) {
            console.warn('>>> [ClientAngularAdapter] instantiate menu factory', location);
            fn();
          }
          else {
            // If 'previous' is set, this is a reactive update, not the initial call.
            untracked(() => factory.invalidate());
          }
        },
      });

      // Execute immediately for synchronous menu creation.
      executeFn();

      // Bind signal to a reactive context.
      effect(() => executeFn(), {injector});
      factory.onCleanup(() => {
        console.warn('>>> [ClientAngularAdapter] destroy (previous) menu instance (onCleanup)', location);
        injector.destroy()
      });
    }
  }

  /** @inheritDoc */
  public menuItems(location: Signal<`menu:${string}` | `toolbar:${string}`>, context: Signal<Map<string, unknown>>, options: {injector?: Injector; metadata?: {[key: string]: unknown}}): Signal<SciMenuItemLike[]> {
    assertNotInReactiveContext(this.menuItems, 'Call menuItems() in a non-reactive (non-tracking) context. Each invocation creates a new subscription, asynchronously setting the signal\'s value, leading to an infinite loop if called in a reactive context.');
    if (!options.injector) {
      ɵassertInInjectionContext(this.menuItems, 'Call menuItems() in an injection context, as it allocates resources that are not released until the injection context is destroyed.')
    }
    const injector = options.injector ?? inject(Injector);
    const menuContributions = signal<SciMenuItemLike[]>([]);

    effect(onCleanup => {
      const tracked = {location: location(), context: context()};

      untracked(() => {
        const subscription = this._workbenchMenuService.menuItems$(tracked.location, tracked.context)
          .pipe(map(menuItemProxies => SciMenuItems.fromWorkbenchMenuItemProxies(menuItemProxies, {injector: this._injector})))
          .subscribe(menuItems => menuContributions.set(menuItems));
        onCleanup(() => subscription.unsubscribe());
      });
    }, {injector});

    return menuContributions;
  }

  /** @inheritDoc */
  public openMenu(menuLike: `menu:${string}` | SciMenuItemLike[], options: SciMenuOptions): SciMenuRef {
    const menu = Array.isArray(menuLike) ? SciMenuItems.toWorkbenchMenuItems(menuLike, {injector: this._injector}) : menuLike;
    const filter = coerceFilterDescriptor(options.filter);
    const menuRef = this._workbenchMenuService.open(menu, {
      anchor: coerceAnchor(options.anchor),
      align: options.align,
      size: {
        width: options.size?.width,
        minWidth: options.size?.minWidth,
        maxWidth: options.size?.maxWidth,
      },
      filter: filter && {
        placeholder: toLazyObservable(filter?.placeholder, {injector: this._injector}),
        notFoundText: toLazyObservable(filter?.notFoundText, {injector: this._injector}),
      } as RequireOne<{placeholder?: MaybeObservable<Translatable>; notFoundText?: MaybeObservable<Translatable>}> | undefined,
      focus: options.focus,
      cssClass: options.cssClass,
      context: options.context ?? new Map(),
    });

    return {
      close: () => menuRef.close(),
      onClose: onClose => menuRef.onClose(onClose),
    };
  }
}

function coerceAnchor(anchor: HTMLElement | ElementRef<HTMLElement> | SciMenuOrigin | MouseEvent): HTMLElement | WorkbenchMenuOrigin | MouseEvent {
  if (anchor instanceof ElementRef) {
    return coerceElement(anchor);
  }
  return anchor;
}

function coerceFilterDescriptor(filter: SciMenuOptions['filter'] | undefined): {placeholder?: MaybeSignal<Translatable>; notFoundText?: MaybeSignal<Translatable>} | undefined {
  if (typeof filter === 'object') {
    return {
      placeholder: filter.placeholder,
      notFoundText: filter.notFoundText,
    };
  }
  return filter === true ? {} : undefined;
}

/**
 * Enables rendering of menu popover in the workbench host application and federation of menu items contributed by different micro apps.
 */
export function provideWorkbenchMenuAdapter(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {provide: SciMenuAdapter, useClass: WorkbenchClientAngularMenuAdapter, multi: true},
    {provide: WorkbenchMenuService, useFactory: () => Beans.get(WorkbenchMenuService)},
    {provide: ɵWorkbenchMenuService, useFactory: () => Beans.get(ɵWorkbenchMenuService)},
  ]);
}

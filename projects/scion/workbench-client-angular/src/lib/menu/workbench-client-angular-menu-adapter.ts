import {Disposable, SciMenuAdapter, SciMenuContributionLocation, SciMenuContributionLocationLike, SciMenuContributionOptions, SciMenuFactoryFn, SciMenuFactoryFnLike, SciMenuGroupContributionLocation, SciMenuGroupFactoryFn, SciMenuItemLike, SciMenuOptions, SciMenuOrigin, SciMenuRef, SciToolbarContributionLocation, SciToolbarFactoryFn, SciToolbarGroupContributionLocation, SciToolbarGroupFactoryFn} from '@scion/sci-components/menu';
import {assertNotInReactiveContext, effect, ElementRef, inject, Injector, linkedSignal, Provider, runInInjectionContext, signal, Signal, untracked} from '@angular/core';
import {WorkbenchMenuFactory, WorkbenchMenuGroupFactory, WorkbenchMenuOptions, WorkbenchMenuOrigin, WorkbenchMenuService, WorkbenchToolbarFactory, WorkbenchToolbarGroupFactory, ɵWorkbenchMenuService} from '@scion/workbench-client';
import {map} from 'rxjs';
import {ɵassertInInjectionContext} from '../common/common';
import {coerceElement} from '@angular/cdk/coercion';
import {WorkbenchClientMenuFactoryDelegate} from './workbench-client-menu-factory-delegate';
import {WorkbenchClientToolbarFactoryDelegate} from './workbench-client-toolbar-factory-delegate';
import {SciMenuItems} from './workbench-client-menu-transform';
import {createDestroyableInjector} from '../common/injector.util';
import {Beans} from '@scion/toolkit/bean-manager';

export class WorkbenchClientAngularMenuAdapter implements SciMenuAdapter {

  private readonly _workbenchMenuService = inject(ɵWorkbenchMenuService);
  private readonly _injector = inject(Injector);

  /** @inheritDoc */
  public contributeMenu(location: SciMenuContributionLocationLike, factoryFn: SciMenuFactoryFnLike, options: SciMenuContributionOptions): Disposable {
    const rootInjector = this._injector;
    const [scope] = location.location.split(':', 1) as ['menu' | 'toolbar' | 'group(menu)' | 'group(toolbar)', string];

    // Delegate to `WorkbenchMenuService.contributeMenu` of `@scion/workbench-client`.
    switch (scope) {
      case 'menu': {
        return this._workbenchMenuService.contributeMenu(location as SciMenuContributionLocation, (menu, context) => {
          const menuFactoryFn = factoryFn as SciMenuFactoryFn;
          return tracked(() => menuFactoryFn(new WorkbenchClientMenuFactoryDelegate(menu), context), menu);
        }, {requiredContext: options.requiredContext, metadata: options.metadata});
      }
      case 'group(menu)': {
        return this._workbenchMenuService.contributeMenu(location as SciMenuGroupContributionLocation, (group, context) => {
          const groupFactoryFn = factoryFn as SciMenuGroupFactoryFn;
          return tracked(() => groupFactoryFn(new WorkbenchClientMenuFactoryDelegate(group), context), group);
        }, {requiredContext: options.requiredContext, metadata: options.metadata});
      }
      case 'toolbar': {
        return this._workbenchMenuService.contributeMenu(location as SciToolbarContributionLocation, (toolbar, context) => {
          const toolbarFactoryFn = factoryFn as SciToolbarFactoryFn;
          return tracked(() => toolbarFactoryFn(new WorkbenchClientToolbarFactoryDelegate(toolbar), context), toolbar);
        }, {requiredContext: options.requiredContext, metadata: options.metadata});
      }
      case 'group(toolbar)': {
        return this._workbenchMenuService.contributeMenu(location as SciToolbarGroupContributionLocation, (group, context) => {
          const groupFactoryFn = factoryFn as SciToolbarGroupFactoryFn;
          return tracked(() => groupFactoryFn(new WorkbenchClientToolbarFactoryDelegate(group), context), group);
        }, {requiredContext: options.requiredContext, metadata: options.metadata});
      }
    }

    /**
     * Runs given function in a reactive context.
     */
    function tracked(fn: () => void, factory: WorkbenchMenuFactory | WorkbenchToolbarFactory | WorkbenchMenuGroupFactory | WorkbenchToolbarGroupFactory): void {
      const injector = createDestroyableInjector({parent: rootInjector});

      // The menu factory function must be called synchronously. Since an effect runs asynchronously, we wrap the function call in a signal that we invoke immediately.
      // We then pass the signal to an effect to track changes. When tracked dependencies change, we only invalidate the menu, causing the re-creating of the menu.
      const executeFn = linkedSignal({
        source: () => undefined,
        computation: (_source, previous) => {
          // Create the menu if called for the first time.
          if (!previous) {
            console.warn('>>> [ClientAngularAdapter] instantiate menu factory', location);
            runInInjectionContext(injector, fn);
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
  public menuContributions(location: Signal<`menu:${string}` | `toolbar:${string}` | `group:${string}`>, context: Signal<Map<string, unknown>>, options: {injector?: Injector; metadata?: {[key: string]: unknown}}): Signal<SciMenuItemLike[]> {
    assertNotInReactiveContext(this.menuContributions, 'Call menuContributions() in a non-reactive (non-tracking) context. Each invocation creates a new subscription, asynchronously setting the signal\'s value, leading to an infinite loop if called in a reactive context.');
    if (!options.injector) {
      ɵassertInInjectionContext(this.menuContributions, 'Call menuContributions() in an injection context, as it allocates resources that are not released until the injection context is destroyed.')
    }
    const injector = options.injector ?? inject(Injector);
    const menuContributions = signal<SciMenuItemLike[]>([]);

    effect(onCleanup => {
      const _location = location();
      const _context = context();

      untracked(() => {
        const subscription = this._workbenchMenuService.menuContributions$(_location, _context)
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

    const menuRef = this._workbenchMenuService.open(menu, {
      anchor: coerceAnchor(options.anchor),
      align: options.align,
      size: {
        width: options.size?.width,
        minWidth: options.size?.minWidth,
        maxWidth: options.size?.maxWidth,
      },
      filter: coerceFilter(options.filter),
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

function coerceFilter(filter: SciMenuOptions['filter'] | undefined): WorkbenchMenuOptions['filter'] | undefined {
  if (filter === undefined) {
    return undefined;
  }
  if (typeof filter === 'boolean') {
    return filter;
  }
  return {
    placeholder: filter.placeholder,
    notFoundText: filter.notFoundText,
  };
}

export function provideWorkbenchClientAngularMenuAdapter(): Provider[] {
  return [
    {provide: SciMenuAdapter, useClass: WorkbenchClientAngularMenuAdapter, multi: true},
    {provide: WorkbenchMenuService, useFactory: () => Beans.get(WorkbenchMenuService)},
    {provide: ɵWorkbenchMenuService, useFactory: () => Beans.get(ɵWorkbenchMenuService)},
  ];
}

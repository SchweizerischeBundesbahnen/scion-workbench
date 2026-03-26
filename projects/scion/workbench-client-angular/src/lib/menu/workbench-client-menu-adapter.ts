import {Disposable, SciMenuAdapter, SciMenuContributionLocation, SciMenuContributionLocationLike, SciMenuContributionOptions, SciMenuFactoryFn, SciMenuFactoryFnLike, SciMenuGroupContributionLocation, SciMenuGroupFactoryFn, SciMenuItemLike, SciMenuOptions, SciMenuOrigin, SciMenuRef, SciToolbarContributionLocation, SciToolbarFactoryFn, SciToolbarGroupContributionLocation, SciToolbarGroupFactoryFn} from '@scion/sci-components/menu';
import {assertNotInReactiveContext, effect, ElementRef, inject, Injector, linkedSignal, runInInjectionContext, signal, Signal, untracked} from '@angular/core';
import {WorkbenchMenuOptions, WorkbenchMenuOrigin, ɵWorkbenchMenuService} from '@scion/workbench-client';
import {first, map, Observable} from 'rxjs';
import {ɵassertInInjectionContext} from '../common/common';
import {coerceElement} from '@angular/cdk/coercion';
import {WorkbenchClientMenuFactoryDelegate} from './workbench-client-menu-factory-delegate';
import {WorkbenchClientToolbarFactoryDelegate} from './workbench-client-toolbar-factory-delegate';
import {SciMenuItems} from './workbench-client-menu-transform';
import {UUID} from '@scion/toolkit/uuid';
import {toLazyObservable} from '../common/lazy-observable.util';

export class WorkbenchClientMenuAdapter implements SciMenuAdapter {

  private readonly _workbenchMenuService = inject(ɵWorkbenchMenuService);
  private readonly _injector = inject(Injector);

  /** @inheritDoc */
  public contributeMenu(location: SciMenuContributionLocationLike, factoryFn: SciMenuFactoryFnLike, options?: SciMenuContributionOptions): Disposable {
    const injector = this._injector;
    const [scope] = location.location.split(':', 1) as ['menu' | 'toolbar' | 'group(menu)' | 'group(toolbar)', string];

    // Delegate to `WorkbenchMenuService.contributeMenu` of `@scion/workbench-client`.
    switch (scope) {
      case 'menu': {
        return this._workbenchMenuService.contributeMenu(location as SciMenuContributionLocation, (menu, context) => {
          const menuFactoryFn = factoryFn as SciMenuFactoryFn;
          return tracked(() => menuFactoryFn(new WorkbenchClientMenuFactoryDelegate(menu), context));
        }, {requiredContext: options?.requiredContext});
      }
      case 'group(menu)': {
        return this._workbenchMenuService.contributeMenu(location as SciMenuGroupContributionLocation, (group, context) => {
          const groupFactoryFn = factoryFn as SciMenuGroupFactoryFn;
          return tracked(() => groupFactoryFn(new WorkbenchClientMenuFactoryDelegate(group), context));
        }, {requiredContext: options?.requiredContext});
      }
      case 'toolbar': {
        return this._workbenchMenuService.contributeMenu(location as SciToolbarContributionLocation, (toolbar, context) => {
          const toolbarFactoryFn = factoryFn as SciToolbarFactoryFn;
          return tracked(() => toolbarFactoryFn(new WorkbenchClientToolbarFactoryDelegate(toolbar), context));
        }, {requiredContext: options?.requiredContext});
      }
      case 'group(toolbar)': {
        return this._workbenchMenuService.contributeMenu(location as SciToolbarGroupContributionLocation, (group, context) => {
          const groupFactoryFn = factoryFn as SciToolbarGroupFactoryFn;
          return tracked(() => groupFactoryFn(new WorkbenchClientToolbarFactoryDelegate(group), context));
        }, {requiredContext: options?.requiredContext});
      }
    }

    /**
     * Runs given function in a reactive context, returning an observable emitting when tracked dependencies change.
     */
    function tracked(fn: () => void): Observable<unknown> {
      // Wrap factory in a signal to notify when tracked signals change.
      const executeFn = linkedSignal({
        source: () => undefined,
        computation: (_source, previous) => {
          if (!previous) {
            runInInjectionContext(injector, fn);
          }
          return UUID.randomUUID();
        },
      });

      // Execute immediately for synchronous menu creation.
      const initialExecutionIdentifier = executeFn();

      // Create observable running the function in a reactive context, emitting when tracked dependencies change.
      return toLazyObservable(executeFn, {injector}).pipe(first(executionIdentifier => executionIdentifier !== initialExecutionIdentifier)); // skip emission of initial execution
    }
  }

  /** @inheritDoc */
  public menuContributions(location: Signal<`menu:${string}` | `toolbar:${string}` | `group:${string}`>, context: Signal<Map<string, unknown>>, options ?: {injector?: Injector}): Signal<SciMenuItemLike[]> {
    assertNotInReactiveContext(this.menuContributions, 'Call menuContributions() in a non-reactive (non-tracking) context. Each invocation creates a new subscription, asynchronously setting the signal\'s value, leading to an infinite loop if called in a reactive context.');
    if (!options?.injector) {
      ɵassertInInjectionContext(this.menuContributions, 'Call menuContributions() in an injection context, as it allocates resources that are not released until the injection context is destroyed.')
    }
    const injector = options?.injector ?? inject(Injector);
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
  public openMenu(menuLike: `menu:${string}` | SciMenuItemLike[], options: SciMenuOptions & {focus?: boolean}): SciMenuRef {
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

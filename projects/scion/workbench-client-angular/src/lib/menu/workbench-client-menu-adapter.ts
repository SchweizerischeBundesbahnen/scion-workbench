import {Disposable, SciMenuAdapter, SciMenuContribution, SciMenuItemLike, SciMenuOptions, SciMenuOrigin, SciMenuRef, SciToolbarContribution} from '@scion/sci-components/menu';
import {assertInInjectionContext, assertNotInReactiveContext, effect, ElementRef, inject, Injector, linkedSignal, runInInjectionContext, signal, Signal, untracked} from '@angular/core';
import {WorkbenchMenuContributionLocation, WorkbenchMenuGroupContributionLocation, WorkbenchMenuOptions, WorkbenchMenuOrigin, WorkbenchToolbarContributionLocation, WorkbenchToolbarGroupContributionLocation, ɵWorkbenchMenuService} from '@scion/workbench-client';
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
  public contributeMenu(location: `menu:${string}` | `toolbar:${string}` | `group:${string}`, contribution: SciMenuContribution | SciToolbarContribution): Disposable {
    assertInInjectionContext(this.contributeMenu);
    const {scope, name} = parseLocation(location, contribution);
    const injector = this._injector;

    // Delegate to `WorkbenchMenuService.contributeMenu()` of `@scion/workbench-client`.
    switch (scope) {
      case 'menu': {
        const menuContribution = contribution as SciMenuContribution;
        const location = {location: `menu:${name}`, ...contribution.position} satisfies WorkbenchMenuContributionLocation;

        // Delegate contribution to `WorkbenchMenuService.contributeMenu` of `@scion/workbench-client`.
        return this._workbenchMenuService.contributeMenu(location, (menu, context) => {
          return tracked(() => menuContribution.factory(new WorkbenchClientMenuFactoryDelegate(menu), context));
        }, {requiredContext: contribution.requiredContext});
      }
      case 'group(menu)': {
        const menuContribution = contribution as SciMenuContribution;
        const location = {location: `group(menu):${name}`, ...contribution.position} satisfies WorkbenchMenuGroupContributionLocation;

        // Delegate contribution to `WorkbenchMenuService.contributeMenu` of `@scion/workbench-client`.
        return this._workbenchMenuService.contributeMenu(location, (group, context) => {
          return tracked(() => menuContribution.factory(new WorkbenchClientMenuFactoryDelegate(group), context));
        }, {requiredContext: contribution.requiredContext});
      }
      case 'toolbar': {
        const toolbarContribution = contribution as SciToolbarContribution;
        const location = {location: `toolbar:${name}`, ...contribution.position} satisfies WorkbenchToolbarContributionLocation;

        // Delegate contribution to `WorkbenchMenuService.contributeMenu` of `@scion/workbench-client`.
        return this._workbenchMenuService.contributeMenu(location, (toolbar, context) => {
          return tracked(() => toolbarContribution.factory(new WorkbenchClientToolbarFactoryDelegate(toolbar), context));
        }, {requiredContext: contribution.requiredContext});
      }
      case 'group(toolbar)': {
        const toolbarContribution = contribution as SciToolbarContribution;
        const location = {location: `group(toolbar):${name}`, ...contribution.position} satisfies WorkbenchToolbarGroupContributionLocation;

        // Delegate contribution to `WorkbenchMenuService.contributeMenu` of `@scion/workbench-client`.
        return this._workbenchMenuService.contributeMenu(location, (group, context) => {
          return tracked(() => toolbarContribution.factory(new WorkbenchClientToolbarFactoryDelegate(group), context));
        }, {requiredContext: contribution.requiredContext});
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

function parseLocation(location: `menu:${string}` | `toolbar:${string}` | `group:${string}`, contribution: SciMenuContribution | SciToolbarContribution): {scope: 'menu' | 'toolbar' | 'group(menu)' | 'group(toolbar)'; name: string} {
  const regex = /^(?<type>.+):(?<name>.+)$/;
  const {name} = regex.exec(location)!.groups!;

  if (location.startsWith('menu:') || location.startsWith('toolbar:')) {
    return {scope: contribution.scope, name: name!};
  }
  else {
    return {scope: `group(${contribution.scope})`, name: name!};
  }
}

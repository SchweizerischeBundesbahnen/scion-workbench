import {Disposable, SciMenuAdapter, SciMenuContribution, SciMenuItemLike, SciMenuOptions, SciMenuOrigin, SciMenuRef, SciToolbarContribution, ɵcreateSciMenu, ɵcreateSciToolbar} from '@scion/sci-components/menu';
import {assertInInjectionContext, assertNotInReactiveContext, DestroyRef, effect, ElementRef, inject, Injector, runInInjectionContext, signal, Signal, untracked} from '@angular/core';
import {UUID} from '@scion/toolkit/uuid';
import {mapToBody, MessageClient, MicrofrontendPlatform, PlatformState} from '@scion/microfrontend-platform';
import {WORKBENCH_ELEMENT, WorkbenchClientMenuItemLike, WorkbenchClientMenuOpenOptions, WorkbenchClientMenuOrigin, WorkbenchElement, ɵWorkbenchClientMenuContributionCreateCommand, ɵWorkbenchClientMenuContributionRegisterCommand, ɵWorkbenchClientMenuItemLookupCommand, ɵWorkbenchClientMenuOpenCommand} from '@scion/workbench-client';
import {fromRemoteSignal, toRemoteSignal} from './remote-signal';
import {firstValueFrom, map, Observable} from 'rxjs';
import {createDestroyableInjector} from '../common/injector.util';
import {prune, ɵassertInInjectionContext} from '../common/common';
import {coerceElement} from '@angular/cdk/coercion';
import {Beans} from '@scion/toolkit/bean-manager';

export class WorkbenchClientMenuAdapter implements SciMenuAdapter {

  private readonly _messageClient = inject(MessageClient);
  private readonly _injector = inject(Injector);

  /** @inheritDoc */
  public contributeMenu(location: `menu:${string}` | `toolbar:${string}` | `group:${string}`, contribution: SciMenuContribution | SciToolbarContribution): Disposable {
    assertInInjectionContext(this.contributeMenu);

    const contributionId = UUID.randomUUID();
    const contributionInjector = createDestroyableInjector({parent: this._injector});

    void this._messageClient.publish<ɵWorkbenchClientMenuContributionRegisterCommand>(`workbench/menu/contribution/${contributionId}/register`, {
      location,
      scope: contribution.scope,
      requiredContext: contribution.requiredContext,
      position: contribution.position,
    });

    const subscription = this._messageClient.onMessage<ɵWorkbenchClientMenuContributionCreateCommand, WorkbenchClientMenuItemLike[]>(`workbench/menu/contribution/${contributionId}/create`, request => {
      const {context} = request.body!;

      console.warn('>>> [Client] menu factory', location, context);

      return new Observable<WorkbenchClientMenuItemLike[]>(observer => {
        const effectRef = effect(onCleanup => { // describe why effect -> creating menu in reactive context
          const injector = createDestroyableInjector({parent: contributionInjector});

          runInInjectionContext(injector, () => {
            if (contribution.scope === 'menu') {
              const menuItems = ɵcreateSciMenu(contribution.factory, context);
              untracked(() => observer.next(transformToWorkbenchClientModel(menuItems)));
            }
            else if (contribution.scope === 'toolbar') {
              const menuItems = ɵcreateSciToolbar(contribution.factory, context);
              untracked(() => observer.next(transformToWorkbenchClientModel(menuItems)));
            }
            else {
              observer.next([]);
            }
          });

          onCleanup(() => injector.destroy());
          onCleanup(() => console.warn('>>> [Client] menu factory effect DESTROY', location, context));
        }, {injector: contributionInjector});

        return () => effectRef.destroy(); // all locations are gone
      });
    });

    // Unregister contribution
    contributionInjector.get(DestroyRef).onDestroy(() => {
      subscription.unsubscribe();
      void this._messageClient.publish(`workbench/menu/contribution/${contributionId}/unregister`);
    });

    // Unregister menu contributions when stopping the platform, e.g., when closing the view, part, ..., or during hot code replacement.
    void MicrofrontendPlatform.whenState(PlatformState.Stopping).then(() => contributionInjector.destroy());

    return {
      dispose: () => contributionInjector.destroy(),
    }
  }

  /** @inheritDoc */
  public menuContributions(location: Signal<`menu:${string}` | `toolbar:${string}` | `group:${string}`>, context: Signal<Map<string, unknown>>, options?: {injector?: Injector}): Signal<SciMenuItemLike[]> {
    assertNotInReactiveContext(this.menuContributions, 'Call menuContributions() in a non-reactive (non-tracking) context. Each invocation creates a new subscription, asynchronously setting the signal\'s value, leading to an infinite loop if called in a reactive context.');
    if (!options?.injector) {
      ɵassertInInjectionContext(this.menuContributions, 'Call menuContributions() in an injection context, as it allocates resources that are not released until the injection context is destroyed.')
    }
    const injector = options?.injector ?? inject(Injector);
    const menuContributions = signal<SciMenuItemLike[]>([]);

    effect(onCleanup => {
      const command: ɵWorkbenchClientMenuItemLookupCommand = {location: location(), context: context()};

      untracked(() => {
        const subscription = this._messageClient.request$<WorkbenchClientMenuItemLike[]>('workbench/menu/items', command)
          .pipe(
            mapToBody(),
            map(menuItems => transformToSignalMenuModel(menuItems, {injector: this._injector})),
          )
          .subscribe(menuItems => {
            menuContributions.set(menuItems);
          });
        onCleanup(() => subscription.unsubscribe());
      });
    }, {injector});

    return menuContributions;
  }

  /** @inheritDoc */
  public openMenu(menu: `menu:${string}` | SciMenuItemLike[], options: SciMenuOptions & {focus?: boolean}): SciMenuRef {
    const injector = createDestroyableInjector({parent: this._injector});
    const destroyRef = injector.get(DestroyRef);
    const menuId = UUID.randomUUID();
    const whenClose = firstValueFrom(this._messageClient.request$<void>(`workbench/menu/${menuId}/open`, {
      menu: Array.isArray(menu) ? transformToWorkbenchClientModel(menu, {injector}) : menu,
      options: prune({
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
      }),
      context: options.context ?? new Map(),
      workbenchElementId: Beans.get<WorkbenchElement>(WORKBENCH_ELEMENT).id,
    } satisfies ɵWorkbenchClientMenuOpenCommand));

    whenClose.finally(() => injector.destroy());

    return {
      close: () => this._messageClient.publish<void>(`workbench/menu/${menuId}/close`),
      onClose: onClose => destroyRef.destroyed ? onClose() : destroyRef.onDestroy(onClose),
    }
  }
}

function transformToWorkbenchClientModel(menuItems: SciMenuItemLike[], options?: {injector?: Injector}): WorkbenchClientMenuItemLike[] {
  const injector = options?.injector ?? inject(Injector);

  return menuItems.map((menuItem: SciMenuItemLike): WorkbenchClientMenuItemLike => {
    const menuItemId = UUID.randomUUID();

    switch (menuItem.type) {
      case 'menu-item': {
        return {
          id: menuItemId,
          type: menuItem.type,
          name: menuItem.name,
          label: fromRemoteSignal(`label-${menuItemId}`, menuItem.label?.text, {injector}),
          icon: fromRemoteSignal(`icon-${menuItemId}`, menuItem.icon, {injector}),
          tooltip: fromRemoteSignal(`tooltip-${menuItemId}`, menuItem.tooltip, {injector}),
          accelerator: menuItem.accelerator,
          disabled: fromRemoteSignal(`disabled-${menuItemId}`, menuItem.disabled, {injector}),
          checked: fromRemoteSignal(`checked-${menuItemId}`, menuItem.checked, {injector}),
          actions: transformToWorkbenchClientModel(menuItem.actions, {injector}),
          cssClass: menuItem.cssClass,
          position: menuItem.position,
        };
      }
      case 'menu': {
        return {
          id: menuItemId,
          type: menuItem.type,
          name: menuItem.name,
          label: fromRemoteSignal(`label-${menuItemId}`, menuItem.label?.text, {injector}),
          icon: fromRemoteSignal(`icon-${menuItemId}`, menuItem.icon, {injector}),
          tooltip: fromRemoteSignal(`tooltip-${menuItemId}`, menuItem.tooltip, {injector}),
          disabled: fromRemoteSignal(`disabled-${menuItemId}`, menuItem.disabled, {injector}),
          visualMenuHint: menuItem.visualMenuHint,
          position: menuItem.position,
          menu: {
            width: menuItem.menu.width,
            minWidth: menuItem.menu.minWidth,
            maxWidth: menuItem.menu.maxWidth,
            maxHeight: menuItem.menu.maxHeight,
            filter: menuItem.menu.filter,
          },
          cssClass: menuItem.cssClass,
          children: transformToWorkbenchClientModel(menuItem.children, {injector}),
        };
      }
      case 'group': {
        return {
          id: menuItemId,
          type: menuItem.type,
          name: menuItem.name,
          label: fromRemoteSignal(`label-${menuItemId}`, menuItem.label, {injector}),
          collapsible: menuItem.collapsible,
          position: menuItem.position,
          disabled: fromRemoteSignal(`disabled-${menuItemId}`, menuItem.disabled, {injector}),
          children: transformToWorkbenchClientModel(menuItem.children, {injector}),
          cssClass: menuItem.cssClass,
        };
      }
    }
  });
}

function transformToSignalMenuModel(menuItems: WorkbenchClientMenuItemLike[], options?: {injector?: Injector}): SciMenuItemLike[] {
  const injector = options?.injector ?? inject(Injector);

  return menuItems.map((menuItem: WorkbenchClientMenuItemLike): SciMenuItemLike => {
    switch (menuItem.type) {
      case 'menu-item': {
        return {
          type: menuItem.type,
          name: menuItem.name,
          label: menuItem.label ? {text: toRemoteSignal(`label-${menuItem.id}`, menuItem.label, {injector})} : undefined,
          icon: toRemoteSignal(`icon-${menuItem.id}`, menuItem.icon, {injector}),
          tooltip: toRemoteSignal(`tooltip-${menuItem.id}`, menuItem.tooltip, {injector}),
          accelerator: menuItem.accelerator,
          disabled: toRemoteSignal(`disabled-${menuItem.id}`, menuItem.disabled, {injector}),
          checked: toRemoteSignal(`checked-${menuItem.id}`, menuItem.checked, {injector}),
          actions: transformToSignalMenuModel(menuItem.actions, {injector}),
          // matchesFilter: (filter: string) => true; // TODO
          cssClass: menuItem.cssClass,
          position: menuItem.position,
          onSelect: () => true,
        };
      }
      case 'menu': {
        return {
          type: menuItem.type,
          name: menuItem.name,
          label: menuItem.label ? {text: toRemoteSignal(`label-${menuItem.id}`, menuItem.label, {injector})} : undefined,
          icon: toRemoteSignal(`icon-${menuItem.id}`, menuItem.icon, {injector}),
          tooltip: toRemoteSignal(`tooltip-${menuItem.id}`, menuItem.tooltip, {injector}),
          disabled: toRemoteSignal(`disabled-${menuItem.id}`, menuItem.disabled, {injector}),
          visualMenuHint: menuItem.visualMenuHint,
          position: menuItem.position,
          menu: {
            width: menuItem.menu.width,
            minWidth: menuItem.menu.minWidth,
            maxWidth: menuItem.menu.maxWidth,
            maxHeight: menuItem.menu.maxHeight,
            filter: menuItem.menu.filter,
          },
          cssClass: menuItem.cssClass,
          children: transformToSignalMenuModel(menuItem.children, {injector}),
        };
      }
      case 'group': {
        return {
          type: menuItem.type,
          name: menuItem.name,
          label: toRemoteSignal(`label-${menuItem.id}`, menuItem.label, {injector}),
          collapsible: menuItem.collapsible,
          position: menuItem.position,
          disabled: toRemoteSignal(`disabled-${menuItem.id}`, menuItem.disabled, {injector}),
          children: transformToSignalMenuModel(menuItem.children, {injector}),
          cssClass: menuItem.cssClass,
        };
      }
    }
  });
}

function coerceAnchor(anchor: HTMLElement | ElementRef<HTMLElement> | SciMenuOrigin | MouseEvent): WorkbenchClientMenuOrigin {
  if (anchor instanceof ElementRef || anchor instanceof HTMLElement) {
    const {x, y, width, height} = coerceElement(anchor).getBoundingClientRect();
    return {x, y, width, height};
  }
  else if (anchor instanceof MouseEvent) {
    return {x: anchor.x, y: anchor.y};
  }
  else {
    return {x: anchor.x, y: anchor.y, width: anchor.width, height: anchor.height};
  }
}

function coerceFilter(filter: SciMenuOptions['filter'] | undefined): WorkbenchClientMenuOpenOptions['filter'] | undefined {
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

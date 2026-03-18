import {DestroyRef, DOCUMENT, EnvironmentInjector, EnvironmentProviders, inject, Injector, makeEnvironmentProviders, signal, Signal, untracked} from '@angular/core';
import {mapToBody, MessageClient} from '@scion/microfrontend-platform';
import {takeUntilDestroyed, toObservable, toSignal} from '@angular/core/rxjs-interop';
import {MicrofrontendPlatformStartupPhase, provideMicrofrontendPlatformInitializer} from '@scion/workbench';
import {WorkbenchClientMenuItemLike, WorkbenchClientMenuOpenOptions, WorkbenchClientMenuOrigin, ɵWorkbenchClientMenuContributionCreateCommand, ɵWorkbenchClientMenuContributionRegisterCommand, ɵWorkbenchClientMenuItemLookupCommand, ɵWorkbenchClientMenuOpenCommand} from '@scion/workbench-client';
import {SciMenuAdapter, SciMenuContributionPosition, SciMenuDescriptor, SciMenuFactory, SciMenuGroupDescriptor, SciMenuItemLike, SciMenuOptions, SciToolbarFactory, SciToolbarGroupDescriptor, SciToolbarMenuDescriptor} from '@scion/sci-components/menu';
import {finalize, map} from 'rxjs/operators';
import {fromRemoteSignal, toRemoteSignal} from './remote-signal';
import {UUID} from '@scion/toolkit/uuid';
import {Objects} from '@scion/toolkit/util';
import {createDestroyableInjector} from '../../common/injector.util';
import {prune} from '../../common/prune.util';
import {fromEvent} from 'rxjs';
import {createInvocationContext} from '../../invocation-context/invocation-context';

// TODO move to support
function installMenuRegisterHandler(): void {
  const messageClient = inject(MessageClient);
  const menuAdapter = inject(SciMenuAdapter);
  const injector = inject(Injector);

  messageClient.onMessage<ɵWorkbenchClientMenuContributionRegisterCommand>('workbench/menu/contribution/:contributionId/register', message => {
    const contributionId = message.params!.get('contributionId') as string;
    const contribution = message.body!;

    const menuItemsCache = new WorkbenchClientMenuItemsCache();
    const {before, after, position} = contribution.position ?? {};

    // Contribute menu.
    const contributionRef = menuAdapter.contributeMenu(contribution.location, {
      scope: contribution.scope,
      requiredContext: contribution.requiredContext,
      position: prune({before, after, position} as SciMenuContributionPosition, {pruneIfEmpty: true}),
      factory: (factory: SciMenuFactory | SciToolbarFactory, context: Map<string, unknown>) => {
        // Menu items are constructed asynchronously via messaging. Therefore, we create an initially empty signal and update it when receiving the menu items.
        // We must memoize the signal for therequest not to be performed anew.
        const menuItems = menuItemsCache.computeIfAbsent(context, () => untracked(() => {
          const command: ɵWorkbenchClientMenuContributionCreateCommand = {context};
          const menuItems$ = messageClient.request$<WorkbenchClientMenuItemLike[]>(`workbench/menu/contribution/${contributionId}/create`, command).pipe(mapToBody());
          return toSignal(menuItems$, {initialValue: []});
        }))();

        untracked(() => {
          // Populate menu or toolbar.
          if (contribution.scope === 'menu') {
            populateMenu(factory as SciMenuFactory, transformToSignalMenuModel(menuItems));
          }
          else if (contribution.scope === 'toolbar') {
            populateToolbar(factory as SciToolbarFactory, transformToSignalMenuModel(menuItems));
          }
        });
      },
    });

    // Dispose menu when unregistering the contribution.
    const subscription = messageClient.observe$<void>(`workbench/menu/contribution/${contributionId}/unregister`)
      .pipe(takeUntilDestroyed(injector.get(DestroyRef)))
      .subscribe(() => {
        contributionRef.dispose();
        subscription.unsubscribe();
      });
  });
}

function installMenuItemLookupHandler(): void {
  const environmentInjector = inject(EnvironmentInjector);
  const messageClient = inject(MessageClient);
  const menuAdapter = inject(SciMenuAdapter);

  messageClient.onMessage<ɵWorkbenchClientMenuItemLookupCommand>('workbench/menu/items', request => {
    const {location, context} = request.body!;
    const injector = createDestroyableInjector({parent: environmentInjector});

    const menuItems = menuAdapter.menuContributions(signal(location), signal(context), {injector});
    return toObservable(menuItems, {injector})
      .pipe(
        map(menuItems => transformToWorkbenchClientModel(menuItems, {injector})),
        finalize(() => injector.destroy()),
      );
  });
}

function installMenuOpenHandler(): void {
  const environmentInjector = inject(EnvironmentInjector);
  const messageClient = inject(MessageClient);
  const menuAdapter = inject(SciMenuAdapter);

  messageClient.onMessage<ɵWorkbenchClientMenuOpenCommand, void>('workbench/menu/:menuId/open', request => {
    const menuId = request.params!.get('menuId') as string;
    const command = request.body!;
    const injector = createDestroyableInjector({parent: environmentInjector});
    const invocationContext = createInvocationContext(command.workbenchElementId, {injector});

    const menu = Array.isArray(command.menu) ? transformToSignalMenuModel(command.menu, {injector}) : command.menu
    // Open the menu.
    const menuRef = menuAdapter.openMenu(menu, prune({
      anchor: {
        x: command.options.anchor.x + (invocationContext?.bounds()?.x ?? 0),
        y: command.options.anchor.y + (invocationContext?.bounds()?.y ?? 0),
        width: command.options.anchor.width,
        height: command.options.anchor.height,
      },
      align: command.options.align,
      size: {
        width: command.options.size?.width,
        minWidth: command.options.size?.minWidth,
        maxWidth: command.options.size?.maxWidth,
      },
      filter: coerceFilter(command.options.filter),
      focus: command.options.focus,
      context: command.context,
      cssClass: command.options.cssClass,
    }));

    // Destroy injector when closing the menu.
    menuRef.onClose(() => injector.destroy());

    // Close menu when receiving a close request from the client.
    messageClient.observe$<void>(`workbench/menu/${menuId}/close`)
      .pipe(takeUntilDestroyed(injector.get(DestroyRef)))
      .subscribe(() => menuRef.close());

    // Wait until closing the menu.
    return new Promise<void>(resolve => {
      menuRef.onClose(resolve);
    });
  });
}

/**
 * Closes the menu when a microfrontend gains focus.
 */
function installMenuCloseHandler(): void {
  const document = inject(DOCUMENT);

  fromEvent(document.documentElement, 'sci-microfrontend-focusin')
    .pipe(takeUntilDestroyed())
    .subscribe(() => {
      const popover = document.documentElement.appendChild(document.createElement('div'));
      popover.setAttribute('popover', '');
      popover.style.setProperty('display', 'none');
      popover.showPopover();
      popover.remove();
    });
}

/**
 * Populates given menu with passed menu items.
 */
function populateMenu(menu: SciMenuFactory, menuItems: SciMenuItemLike[]): void {
  for (const menuItem of menuItems) {
    switch (menuItem.type) {
      case 'menu-item': {
        menu.addMenuItem({
          name: menuItem.name,
          label: menuItem.label?.text!,
          icon: menuItem.icon,
          checked: menuItem.checked,
          tooltip: menuItem.tooltip,
          accelerator: menuItem.accelerator,
          disabled: menuItem.disabled,
          actions: actions => populateToolbar(actions, menuItem.actions),
          // onFilter?: (filter: string) => boolean;
          cssClass: menuItem.cssClass,
          onSelect: () => true,
          data: menuItem.data,
        });
        break;
      }
      case 'menu': {
        const menuDescriptor: SciMenuDescriptor = {
          name: menuItem.name,
          label: menuItem.label?.text!,
          icon: menuItem.icon,
          tooltip: menuItem.tooltip,
          disabled: menuItem.disabled,
          menu: {
            width: menuItem.menu.width,
            minWidth: menuItem.menu.minWidth,
            maxWidth: menuItem.menu.maxWidth,
            filter: menuItem.menu.filter,
          },
          cssClass: menuItem.cssClass,
          data: menuItem.data,
        };
        menu.addMenu(menuDescriptor, menu => populateMenu(menu, menuItem.children));
        break;
      }
      case 'group': {
        const groupDescriptor: SciMenuGroupDescriptor = {
          name: menuItem.name,
          label: menuItem.label,
          collapsible: menuItem.collapsible,
          disabled: menuItem.disabled,
          cssClass: menuItem.cssClass,
          data: menuItem.data,
        };
        menu.addGroup(groupDescriptor, group => populateMenu(group, menuItem.children));
        break;
      }
    }
  }
}

/**
 * Populates given toolbar with passed menu items.
 */
function populateToolbar(toolbar: SciToolbarFactory, menuItems: SciMenuItemLike[]): void {
  for (const menuItem of menuItems) {
    switch (menuItem.type) {
      case 'menu-item': {
        toolbar.addToolbarItem({
          name: menuItem.name,
          label: menuItem.label?.text,
          icon: menuItem.icon!,
          checked: menuItem.checked,
          tooltip: menuItem.tooltip,
          accelerator: menuItem.accelerator,
          disabled: menuItem.disabled,
          cssClass: menuItem.cssClass,
          onSelect: () => {
            // TODO
          },
          data: menuItem.data,
        });
        break;
      }
      case 'menu': {
        const menuDescriptor: SciToolbarMenuDescriptor = {
          name: menuItem.name,
          label: menuItem.label?.text,
          icon: menuItem.icon,
          tooltip: menuItem.tooltip,
          disabled: menuItem.disabled,
          visualMenuHint: menuItem.visualMenuHint,
          menu: {
            width: menuItem.menu.width,
            minWidth: menuItem.menu.minWidth,
            maxWidth: menuItem.menu.maxWidth,
            filter: menuItem.menu.filter,
          },
          cssClass: menuItem.cssClass,
          data: menuItem.data,
        };
        toolbar.addMenu(menuDescriptor, menu => populateMenu(menu, menuItem.children));
        break;
      }
      case 'group': {
        const groupDescriptor: SciToolbarGroupDescriptor = {
          name: menuItem.name,
          disabled: menuItem.disabled,
          cssClass: menuItem.cssClass,
          data: menuItem.data,
        };
        toolbar.addGroup(groupDescriptor, group => populateToolbar(group, menuItem.children));
        break;
      }
    }
  }
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

/**
 * Maps given context coordinates to absolute page coordinates.
 */
function mapToPageCoordinates(origin: WorkbenchClientMenuOrigin, relativeTo: DOMRect): WorkbenchClientMenuOrigin {
  const xy = origin as Partial<WorkbenchClientMenuOrigin>;
  if (xy.x !== undefined && xy.y !== undefined) {
    return {
      x: relativeTo.x + xy.x,
      y: relativeTo.y + xy.y,
    };
  }
  throw Error('[PopupOriginError] Illegal popup origin; must be "Point", "TopLeftPoint", "TopRightPoint", "BottomLeftPoint" or "BottomRightPoint".');
}

/**
 * Registers a set of DI providers to set up workbench menus.
 */
export function provideWorkbenchClientMenu(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideMicrofrontendPlatformInitializer(() => {
      installMenuRegisterHandler();
      installMenuItemLookupHandler();
      installMenuOpenHandler();
      installMenuCloseHandler();
    }, {phase: MicrofrontendPlatformStartupPhase.PostStartup}),
  ]);
}

function coerceFilter(filter: WorkbenchClientMenuOpenOptions['filter'] | undefined): SciMenuOptions['filter'] | undefined {
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

class WorkbenchClientMenuItemsCache {

  private readonly _cache = new Array<{context: Map<string, unknown>, menuItems: Signal<WorkbenchClientMenuItemLike[]>}>;

  public computeIfAbsent(context: Map<string, unknown>, computeFn: () => Signal<WorkbenchClientMenuItemLike[]>): Signal<WorkbenchClientMenuItemLike[]> {
    const cachedMenuItems = this._cache.find(cacheEntry => Objects.isEqual(cacheEntry.context, context))?.menuItems;
    if (cachedMenuItems) {
      return cachedMenuItems;
    }

    const cacheEntry = {context, menuItems: computeFn()};
    this._cache.push(cacheEntry);

    inject(DestroyRef).onDestroy(() => {
      const index = this._cache.findIndex(entry => entry === cacheEntry);
      this._cache.splice(index, 1);
    });

    return cacheEntry.menuItems;
  }
}

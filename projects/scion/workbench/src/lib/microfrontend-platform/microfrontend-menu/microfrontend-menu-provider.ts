import {DestroyRef, DOCUMENT, EnvironmentProviders, inject, Injector, makeEnvironmentProviders, Signal, untracked} from '@angular/core';
import {mapToBody, MessageClient, MessageHeaders} from '@scion/microfrontend-platform';
import {takeUntilDestroyed, toObservable, toSignal} from '@angular/core/rxjs-interop';
import {WorkbenchMenuItemProxyLike, WorkbenchMenuItems, WorkbenchMenuItemTransferableLike, ɵWorkbenchMenuContributionConstructCommand, ɵWorkbenchMenuContributionRegisterCommand, ɵWorkbenchMenuItemLookupCommand, ɵWorkbenchMenuOpenCommand} from '@scion/workbench-client';
import {SciMenubarFactory, SciMenuContributionLocationLike, SciMenuFactory, SciMenuFilterConfig, SciMenuItem, SciMenuOptions, SciToolbarFactory, ɵSciMenuService} from '@scion/components/menu';
import {finalize, map} from 'rxjs/operators';
import {Objects, prune} from '@scion/toolkit/util';
import {createDestroyableInjector} from '@scion/components/common';
import {fromEvent, Observable, switchMap} from 'rxjs';
import {createInvocationContext} from '../../invocation-context/invocation-context';
import {MicrofrontendPlatformStartupPhase, provideMicrofrontendPlatformInitializer} from '../microfrontend-platform-initializer';
import {SciMenuItems} from './workbench-client-menu-transform';
import {RequireOne} from '@scion/toolkit/types';

/**
 * Registers a set of DI providers to set up workbench menus.
 */
export function provideMicrofrontendMenu(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideMicrofrontendPlatformInitializer(() => {
      installMenuContributionHandler();
      installMenuItemLookupHandler();
      installMenuOpenHandler();
      installMenuCloseHandler();
    }, {phase: MicrofrontendPlatformStartupPhase.PostStartup}),
  ]);
}

function installMenuContributionHandler(): void {
  const menuService = inject(ɵSciMenuService);
  const messageClient = inject(MessageClient);
  const injector = inject(Injector);

  messageClient.onMessage<ɵWorkbenchMenuContributionRegisterCommand>('workbench/menu/contribution/:contributionId/register', message => {
    const contributionId = message.params!.get('contributionId')!;
    const appSymbolicName = message.headers.get(MessageHeaders.AppSymbolicName) as string;
    const {location, position, requiredContext, metadata, contributionInstant} = message.body!;
    const scope = parseMenuLocationScope(location);

    const menuItemsCache = new WorkbenchClientMenuItemsCache();

    // Contribute menu.
    const contributionRef = menuService.contributeMenu({location, ...position} as SciMenuContributionLocationLike, (factory: SciMenuFactory | SciToolbarFactory | SciMenubarFactory, context: Map<string, unknown>) => {
      // Menu items are constructed asynchronously via messaging. Therefore, we create an initially empty signal and update it when receiving the menu items.
      // We must memoize the signal for therequest not to be performed anew.
      const menuItems = menuItemsCache.computeIfAbsent(context, () => untracked(() => {
        const command: ɵWorkbenchMenuContributionConstructCommand = {context};
        const menuItems$ = messageClient.request$<WorkbenchMenuItemTransferableLike[]>(`workbench/menu/contribution/${contributionId}/construct`, command)
          .pipe(
            mapToBody(),
            map(menuItems => WorkbenchMenuItems.fromTransferable(menuItems)),
          );
        return toSignal(menuItems$, {initialValue: []});
      }))();

      untracked(() => {
        switch (scope) {
          case 'menu': {
            populateMenu(factory as SciMenuFactory, menuItems, {appSymbolicName});
            break;
          }
          case 'toolbar': {
            populateToolbar(factory as SciToolbarFactory, menuItems, {appSymbolicName});
            break;
          }
          case 'menubar': {
            populateMenubar(factory as SciMenubarFactory, menuItems, {appSymbolicName});
            break;
          }
        }
      });
    }, {requiredContext, metadata, contributionInstant});

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
  const menuService = inject(ɵSciMenuService);
  const messageClient = inject(MessageClient);
  const rootInjector = inject(Injector);

  messageClient.onMessage<ɵWorkbenchMenuItemLookupCommand, WorkbenchMenuItemTransferableLike[]>('workbench/menu/items', request => {
    const {location, context, metadata} = request.body!;
    const injector = createDestroyableInjector({parent: rootInjector});

    const menuItems = menuService.menuItems(location, context, {injector, metadata});
    return toObservable(menuItems, {injector})
      .pipe(
        switchMap(menuItems => WorkbenchMenuItems.toTransferable$(SciMenuItems.toWorkbenchMenuItems(menuItems, {injector}))),
        finalize(() => injector.destroy()),
      );
  });
}

function installMenuOpenHandler(): void {
  const menuService = inject(ɵSciMenuService);
  const messageClient = inject(MessageClient);
  const rootInjector = inject(Injector);

  messageClient.onMessage<ɵWorkbenchMenuOpenCommand, void>('workbench/menu/open', request => {
    const command = request.body!;
    const injector = createDestroyableInjector({parent: rootInjector});
    const invocationContext = createInvocationContext(command.workbenchElementId, {injector});

    // Unmarshall the menu.
    const {menu, cssClass, attributes} = SciMenuItems.fromWorkbenchMenuItemProxies(WorkbenchMenuItems.fromTransferable([command.menuItem]), {injector})[0] as SciMenuItem;

    // Open the menu.
    const menuRef = menuService.open(menu!.name ?? menu!.children, prune({
      anchor: {
        x: command.anchor.x + (invocationContext?.bounds()?.x ?? 0),
        y: command.anchor.y + (invocationContext?.bounds()?.y ?? 0),
        width: command.anchor.width,
        height: command.anchor.height,
      },
      align: command.align,
      width: menu!.width,
      minWidth: menu!.minWidth,
      maxWidth: menu!.maxWidth,
      maxHeight: menu!.maxHeight,
      filter: menu!.filter as SciMenuOptions['filter'],
      context: command.context,
      cssClass: cssClass,
      attributes: attributes,
      metadata: command.metadata,
    }, {recursive: true}));

    // Wait until closing the menu.
    return new Observable<never>(observer => {
      menuRef.onClose(() => observer.complete());
      return () => {
        injector.destroy();
        menuRef.close();
      };
    });
  });
}

/**
 * Closes menus on close request or when a microfrontend gains focus.
 */
function installMenuCloseHandler(): void {
  const menuService = inject(ɵSciMenuService);

  // Close menus on close request.
  inject(MessageClient).onMessage<void>('workbench/menus/close', () => {
    menuService.closeAll();
  });

  // Close menus when a microfrontend gains focus.
  fromEvent(inject(DOCUMENT).documentElement, 'sci-microfrontend-focusin')
    .pipe(takeUntilDestroyed())
    .subscribe(() => {
      menuService.closeAll();
    });
}

/**
 * Populates the given menu with passed menu items.
 */
function populateMenu(menu: SciMenuFactory, menuItemProxies: WorkbenchMenuItemProxyLike[], metadata: {appSymbolicName: string}): void {
  for (const menuItemProxy of menuItemProxies) {
    switch (menuItemProxy.type) {
      case 'menu-item': {
        if (menuItemProxy.menu) {
          menu.addMenu({
            name: menuItemProxy.name,
            label: toSignal(menuItemProxy.label!, {requireSync: true}),
            icon: menuItemProxy.icon && toSignal(menuItemProxy.icon, {requireSync: true}),
            disabled: menuItemProxy.disabled && toSignal(menuItemProxy.disabled, {requireSync: true}),
            visible: menuItemProxy.visible && toSignal(menuItemProxy.visible, {requireSync: true}),
            cssClass: menuItemProxy.cssClass,
            attributes: {...menuItemProxy.attributes, 'data-app': metadata.appSymbolicName},
            menu: {
              name: menuItemProxy.menu.name,
              width: menuItemProxy.menu.width,
              minWidth: menuItemProxy.menu.minWidth,
              maxWidth: menuItemProxy.menu.maxWidth,
              maxHeight: menuItemProxy.menu.maxHeight,
              filter: menuItemProxy.menu.filter && {
                placeholder: menuItemProxy.menu.filter.placeholder && toSignal(menuItemProxy.menu.filter.placeholder, {requireSync: true}),
                notFoundMessage: menuItemProxy.menu.filter.notFoundMessage && toSignal(menuItemProxy.menu.filter.notFoundMessage, {requireSync: true}),
                focus: menuItemProxy.menu.filter.focus,
              } as RequireOne<SciMenuFilterConfig>,
            },
          }, menu => populateMenu(menu, menuItemProxy.menu!.children, metadata));
        }
        else {
          menu.addMenuItem({
            name: menuItemProxy.name,
            label: toSignal(menuItemProxy.label!, {requireSync: true}),
            icon: menuItemProxy.icon && toSignal(menuItemProxy.icon, {requireSync: true}),
            checked: menuItemProxy.checked && toSignal(menuItemProxy.checked, {requireSync: true}),
            active: menuItemProxy.active && toSignal(menuItemProxy.active, {requireSync: true}),
            tooltip: menuItemProxy.tooltip && toSignal(menuItemProxy.tooltip, {requireSync: true}),
            accelerator: menuItemProxy.accelerator,
            disabled: menuItemProxy.disabled && toSignal(menuItemProxy.disabled, {requireSync: true}),
            visible: menuItemProxy.visible && toSignal(menuItemProxy.visible, {requireSync: true}),
            actions: actions => populateToolbar(actions, menuItemProxy.actions, metadata),
            cssClass: menuItemProxy.cssClass,
            attributes: {...menuItemProxy.attributes, 'data-app': metadata.appSymbolicName},
            onSelect: menuItemProxy.select!,
          });
        }
        break;
      }
      case 'group': {
        menu.addGroup({
          name: menuItemProxy.name as `menu:${string}`,
          label: menuItemProxy.label && toSignal(menuItemProxy.label, {requireSync: true}),
          collapsible: menuItemProxy.collapsible,
          glyphArea: menuItemProxy.glyphArea,
          disabled: menuItemProxy.disabled && toSignal(menuItemProxy.disabled, {requireSync: true}),
          visible: menuItemProxy.visible && toSignal(menuItemProxy.visible, {requireSync: true}),
          actions: actions => populateToolbar(actions, menuItemProxy.actions, metadata),
          cssClass: menuItemProxy.cssClass,
        }, group => populateMenu(group, menuItemProxy.children, metadata));
        break;
      }
    }
  }
}

/**
 * Populates the given toolbar with passed menu items.
 */
function populateToolbar(toolbar: SciToolbarFactory, menuItemProxies: WorkbenchMenuItemProxyLike[], metadata: {appSymbolicName: string}): void {
  for (const menuItemProxy of menuItemProxies) {
    switch (menuItemProxy.type) {
      case 'menu-item': {
        // Add toolbar button.
        if (menuItemProxy.select && !menuItemProxy.menu) {
          toolbar.addToolbarButton({
            name: menuItemProxy.name,
            label: menuItemProxy.label && toSignal(menuItemProxy.label, {requireSync: true}),
            icon: menuItemProxy.icon && toSignal(menuItemProxy.icon, {requireSync: true}),
            checked: menuItemProxy.checked && toSignal(menuItemProxy.checked, {requireSync: true}),
            tooltip: menuItemProxy.tooltip && toSignal(menuItemProxy.tooltip, {requireSync: true}),
            accelerator: menuItemProxy.accelerator,
            disabled: menuItemProxy.disabled && toSignal(menuItemProxy.disabled, {requireSync: true}),
            visible: menuItemProxy.visible && toSignal(menuItemProxy.visible, {requireSync: true}),
            cssClass: menuItemProxy.cssClass,
            attributes: {...menuItemProxy.attributes, 'data-app': metadata.appSymbolicName},
            onSelect: menuItemProxy.select,
          });
        }
        // Add toolbar split button.
        else if (menuItemProxy.select && menuItemProxy.menu) {
          toolbar.addToolbarSplitButton({
            name: menuItemProxy.name,
            label: menuItemProxy.label && toSignal(menuItemProxy.label, {requireSync: true}),
            icon: menuItemProxy.icon && toSignal(menuItemProxy.icon, {requireSync: true}),
            checked: menuItemProxy.checked && toSignal(menuItemProxy.checked, {requireSync: true}),
            tooltip: menuItemProxy.tooltip && toSignal(menuItemProxy.tooltip, {requireSync: true}),
            accelerator: menuItemProxy.accelerator,
            disabled: menuItemProxy.disabled && toSignal(menuItemProxy.disabled, {requireSync: true}),
            visible: menuItemProxy.visible && toSignal(menuItemProxy.visible, {requireSync: true}),
            cssClass: menuItemProxy.cssClass,
            attributes: {...menuItemProxy.attributes, 'data-app': metadata.appSymbolicName},
            onSelect: menuItemProxy.select,
            menu: {
              name: menuItemProxy.menu.name,
              width: menuItemProxy.menu.width,
              minWidth: menuItemProxy.menu.minWidth,
              maxWidth: menuItemProxy.menu.maxWidth,
              maxHeight: menuItemProxy.menu.maxHeight,
              filter: menuItemProxy.menu.filter && {
                placeholder: menuItemProxy.menu.filter.placeholder && toSignal(menuItemProxy.menu.filter.placeholder, {requireSync: true}),
                notFoundMessage: menuItemProxy.menu.filter.notFoundMessage && toSignal(menuItemProxy.menu.filter.notFoundMessage, {requireSync: true}),
                focus: menuItemProxy.menu.filter.focus,
              } as RequireOne<SciMenuFilterConfig>,
            },
          }, menu => populateMenu(menu, menuItemProxy.menu!.children, metadata));
        }
        // Add toolbar menu button.
        else if (menuItemProxy.menu) {
          toolbar.addToolbarMenu({
            name: menuItemProxy.name,
            label: menuItemProxy.label && toSignal(menuItemProxy.label, {requireSync: true}),
            icon: menuItemProxy.icon && toSignal(menuItemProxy.icon, {requireSync: true}),
            tooltip: menuItemProxy.tooltip && toSignal(menuItemProxy.tooltip, {requireSync: true}),
            disabled: menuItemProxy.disabled && toSignal(menuItemProxy.disabled, {requireSync: true}),
            visible: menuItemProxy.visible && toSignal(menuItemProxy.visible, {requireSync: true}),
            visualMenuIndicator: menuItemProxy.visualMenuIndicator,
            cssClass: menuItemProxy.cssClass,
            attributes: {...menuItemProxy.attributes, 'data-app': metadata.appSymbolicName},
            menu: {
              name: menuItemProxy.menu.name,
              width: menuItemProxy.menu.width,
              minWidth: menuItemProxy.menu.minWidth,
              maxWidth: menuItemProxy.menu.maxWidth,
              maxHeight: menuItemProxy.menu.maxHeight,
              filter: menuItemProxy.menu.filter && {
                placeholder: menuItemProxy.menu.filter.placeholder && toSignal(menuItemProxy.menu.filter.placeholder, {requireSync: true}),
                notFoundMessage: menuItemProxy.menu.filter.notFoundMessage && toSignal(menuItemProxy.menu.filter.notFoundMessage, {requireSync: true}),
                focus: menuItemProxy.menu.filter.focus,
              } as RequireOne<SciMenuFilterConfig>,
            },
          }, menu => populateMenu(menu, menuItemProxy.menu!.children, metadata));
        }
        break;
      }
      case 'group': {
        toolbar.addGroup({
          name: menuItemProxy.name as `toolbar:${string}`,
          disabled: menuItemProxy.disabled && toSignal(menuItemProxy.disabled, {requireSync: true}),
          visible: menuItemProxy.visible && toSignal(menuItemProxy.visible, {requireSync: true}),
          cssClass: menuItemProxy.cssClass,
        }, group => populateToolbar(group, menuItemProxy.children, metadata));
        break;
      }
    }
  }
}

/**
 * Populates the given menubar with passed menu items.
 */
function populateMenubar(menubar: SciMenubarFactory, menuItemProxies: WorkbenchMenuItemProxyLike[], metadata: {appSymbolicName: string}): void {
  for (const menuItemProxy of menuItemProxies) {
    switch (menuItemProxy.type) {
      case 'menu-item': {
        menubar.addMenu({
          name: menuItemProxy.name,
          label: toSignal(menuItemProxy.label!, {requireSync: true}),
          visible: menuItemProxy.visible && toSignal(menuItemProxy.visible, {requireSync: true}),
          cssClass: menuItemProxy.cssClass,
          attributes: {...menuItemProxy.attributes, 'data-app': metadata.appSymbolicName},
          menu: {
            name: menuItemProxy.menu!.name,
            width: menuItemProxy.menu!.width,
            minWidth: menuItemProxy.menu!.minWidth,
            maxWidth: menuItemProxy.menu!.maxWidth,
            maxHeight: menuItemProxy.menu!.maxHeight,
            filter: menuItemProxy.menu!.filter && {
              placeholder: menuItemProxy.menu!.filter.placeholder && toSignal(menuItemProxy.menu!.filter.placeholder, {requireSync: true}),
              notFoundMessage: menuItemProxy.menu!.filter.notFoundMessage && toSignal(menuItemProxy.menu!.filter.notFoundMessage, {requireSync: true}),
              focus: menuItemProxy.menu!.filter.focus,
            } as RequireOne<SciMenuFilterConfig>,
          },
        }, menu => populateMenu(menu, menuItemProxy.menu!.children, metadata));
        break;
      }
    }
  }
}

/**
 * Parses the scope from given location. One of `menu`, `toolbar`,`menubar`.
 */
function parseMenuLocationScope(location: `menu:${string}` | `toolbar:${string}` | `menubar:${string}`): 'menu' | 'toolbar' | 'menubar' {
  const regex = /^(?<scope>(menu|toolbar|menubar)):(?<name>.+)$/;
  return regex.exec(location)!.groups!['scope'] as 'menu' | 'toolbar' | 'menubar';
}

class WorkbenchClientMenuItemsCache {

  private readonly _cache = new Array<{context: Map<string, unknown>; menuItems: Signal<WorkbenchMenuItemProxyLike[]>}>();

  public computeIfAbsent(context: Map<string, unknown>, computeFn: () => Signal<WorkbenchMenuItemProxyLike[]>): Signal<WorkbenchMenuItemProxyLike[]> {
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

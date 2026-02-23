import {DestroyRef, DOCUMENT, EnvironmentProviders, inject, Injector, makeEnvironmentProviders, Signal, untracked} from '@angular/core';
import {mapToBody, MessageClient} from '@scion/microfrontend-platform';
import {takeUntilDestroyed, toObservable, toSignal} from '@angular/core/rxjs-interop';
import {WorkbenchMenuItemProxyLike, WorkbenchMenuItems, WorkbenchMenuItemTransferableLike, ɵWorkbenchMenuContributionConstructCommand, ɵWorkbenchMenuContributionRegisterCommand, ɵWorkbenchMenuItemLookupCommand, ɵWorkbenchMenuOpenCommand} from '@scion/workbench-client';
import {SciMenubarFactory, SciMenuContributionLocationLike, SciMenuFactory, SciMenuItem, SciMenuOptions, SciToolbarFactory, ɵSciMenuService} from '@scion/components/menu';
import {finalize, map} from 'rxjs/operators';
import {Objects, prune} from '@scion/toolkit/util';
import {createDestroyableInjector, MaybeSignal} from '@scion/components/common';
import {fromEvent, Observable, switchMap} from 'rxjs';
import {createInvocationContext} from '../../invocation-context/invocation-context';
import {MicrofrontendPlatformStartupPhase, provideMicrofrontendPlatformInitializer} from '../microfrontend-platform-initializer';
import {SciMenuItems} from './workbench-client-menu-transform';
import {parseMenuLocation} from './workbench-menu-location-parser';
import {RequireOne} from '@scion/toolkit/types';
import {Translatable} from '@scion/components/text';

function installMenuContributionHandler(): void {
  const menuService = inject(ɵSciMenuService);
  const messageClient = inject(MessageClient);
  const injector = inject(Injector);

  messageClient.onMessage<ɵWorkbenchMenuContributionRegisterCommand>('workbench/menu/contribution/:contributionId/register', message => {
    const contributionId = message.params!.get('contributionId')!;
    const {location, position, requiredContext, metadata, contributionInstant} = message.body!;
    const {scope} = parseMenuLocation(location);

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
            populateMenu(factory as SciMenuFactory, menuItems);
            break;
          }
          case 'toolbar': {
            populateToolbar(factory as SciToolbarFactory, menuItems);
            break;
          }
          case 'menubar': {
            populateMenubar(factory as SciMenubarFactory, menuItems);
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
    const menuRef = menuService.open(menu!.name ?? menu!.children, prune<SciMenuOptions>({
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
    }));

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
function populateMenu(menu: SciMenuFactory, menuItemProxies: WorkbenchMenuItemProxyLike[]): void {
  for (const menuItemProxy of menuItemProxies) {
    switch (menuItemProxy.type) {
      case 'menu-item': {
        if (menuItemProxy.menu) {
          menu.addMenu({
            name: menuItemProxy.name,
            label: toSignal(menuItemProxy.label!, {requireSync: true}),
            icon: menuItemProxy.icon && toSignal(menuItemProxy.icon, {requireSync: true}),
            disabled: menuItemProxy.disabled && toSignal(menuItemProxy.disabled, {requireSync: true}),
            cssClass: menuItemProxy.cssClass,
            attributes: menuItemProxy.attributes,
            menu: {
              name: menuItemProxy.menu.name,
              width: menuItemProxy.menu.width,
              minWidth: menuItemProxy.menu.minWidth,
              maxWidth: menuItemProxy.menu.maxWidth,
              maxHeight: menuItemProxy.menu.maxHeight,
              filter: menuItemProxy.menu.filter && {
                placeholder: menuItemProxy.menu.filter.placeholder && toSignal(menuItemProxy.menu.filter.placeholder, {requireSync: true}),
                notFoundText: menuItemProxy.menu.filter.notFoundText && toSignal(menuItemProxy.menu.filter.notFoundText, {requireSync: true}),
                focus: menuItemProxy.menu.filter.focus,
              } as RequireOne<{placeholder?: MaybeSignal<Translatable>; notFoundText?: MaybeSignal<Translatable>; focus?: boolean}>,
            },
          }, menu => populateMenu(menu, menuItemProxy.menu!.children));
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
            actions: actions => populateToolbar(actions, menuItemProxy.actions),
            cssClass: menuItemProxy.cssClass,
            attributes: menuItemProxy.attributes,
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
          actions: actions => populateToolbar(actions, menuItemProxy.actions),
          cssClass: menuItemProxy.cssClass,
        }, group => populateMenu(group, menuItemProxy.children));
        break;
      }
    }
  }
}

/**
 * Populates given toolbar with passed menu items.
 */
function populateToolbar(toolbar: SciToolbarFactory, menuItemProxies: WorkbenchMenuItemProxyLike[]): void {
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
            cssClass: menuItemProxy.cssClass,
            attributes: menuItemProxy.attributes,
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
            cssClass: menuItemProxy.cssClass,
            attributes: menuItemProxy.attributes,
            onSelect: menuItemProxy.select,
            menu: {
              name: menuItemProxy.menu.name,
              width: menuItemProxy.menu.width,
              minWidth: menuItemProxy.menu.minWidth,
              maxWidth: menuItemProxy.menu.maxWidth,
              maxHeight: menuItemProxy.menu.maxHeight,
              filter: menuItemProxy.menu.filter && {
                placeholder: menuItemProxy.menu.filter.placeholder && toSignal(menuItemProxy.menu.filter.placeholder, {requireSync: true}),
                notFoundText: menuItemProxy.menu.filter.notFoundText && toSignal(menuItemProxy.menu.filter.notFoundText, {requireSync: true}),
                focus: menuItemProxy.menu.filter.focus,
              } as RequireOne<{placeholder?: MaybeSignal<Translatable>; notFoundText?: MaybeSignal<Translatable>; focus?: boolean}>,
            },
          }, menu => populateMenu(menu, menuItemProxy.menu!.children));
        }
        // Add toolbar menu button.
        else if (menuItemProxy.menu) {
          toolbar.addToolbarMenu({
            name: menuItemProxy.name,
            label: menuItemProxy.label && toSignal(menuItemProxy.label, {requireSync: true}),
            icon: menuItemProxy.icon && toSignal(menuItemProxy.icon, {requireSync: true}),
            tooltip: menuItemProxy.tooltip && toSignal(menuItemProxy.tooltip, {requireSync: true}),
            disabled: menuItemProxy.disabled && toSignal(menuItemProxy.disabled, {requireSync: true}),
            visualMenuHint: menuItemProxy.visualMenuHint,
            cssClass: menuItemProxy.cssClass,
            attributes: menuItemProxy.attributes,
            menu: {
              name: menuItemProxy.menu.name,
              width: menuItemProxy.menu.width,
              minWidth: menuItemProxy.menu.minWidth,
              maxWidth: menuItemProxy.menu.maxWidth,
              maxHeight: menuItemProxy.menu.maxHeight,
              filter: menuItemProxy.menu.filter && {
                placeholder: menuItemProxy.menu.filter.placeholder && toSignal(menuItemProxy.menu.filter.placeholder, {requireSync: true}),
                notFoundText: menuItemProxy.menu.filter.notFoundText && toSignal(menuItemProxy.menu.filter.notFoundText, {requireSync: true}),
                focus: menuItemProxy.menu.filter.focus,
              } as RequireOne<{placeholder?: MaybeSignal<Translatable>; notFoundText?: MaybeSignal<Translatable>; focus?: boolean}>,
            },
          }, menu => populateMenu(menu, menuItemProxy.menu!.children));
        }
        break;
      }
      case 'group': {
        toolbar.addGroup({
          name: menuItemProxy.name as `toolbar:${string}`,
          disabled: menuItemProxy.disabled && toSignal(menuItemProxy.disabled, {requireSync: true}),
          cssClass: menuItemProxy.cssClass,
        }, group => populateToolbar(group, menuItemProxy.children));
        break;
      }
    }
  }
}

/**
 * Populates given menubar with passed menu items.
 */
function populateMenubar(menubar: SciMenubarFactory, menuItemProxies: WorkbenchMenuItemProxyLike[]): void {
  for (const menuItemProxy of menuItemProxies) {
    switch (menuItemProxy.type) {
      case 'menu-item': {
        menubar.addMenu({
          name: menuItemProxy.name,
          label: toSignal(menuItemProxy.label!, {requireSync: true}),
          cssClass: menuItemProxy.cssClass,
          attributes: menuItemProxy.attributes,
          menu: {
            name: menuItemProxy.menu!.name,
            width: menuItemProxy.menu!.width,
            minWidth: menuItemProxy.menu!.minWidth,
            maxWidth: menuItemProxy.menu!.maxWidth,
            maxHeight: menuItemProxy.menu!.maxHeight,
            filter: menuItemProxy.menu!.filter && {
              placeholder: menuItemProxy.menu!.filter.placeholder && toSignal(menuItemProxy.menu!.filter.placeholder, {requireSync: true}),
              notFoundText: menuItemProxy.menu!.filter.notFoundText && toSignal(menuItemProxy.menu!.filter.notFoundText, {requireSync: true}),
              focus: menuItemProxy.menu!.filter.focus,
            } as RequireOne<{placeholder?: MaybeSignal<Translatable>; notFoundText?: MaybeSignal<Translatable>; focus?: boolean}>,
          },
        }, menu => populateMenu(menu, menuItemProxy.menu!.children));
        break;
      }
    }
  }
}

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

import {DestroyRef, DOCUMENT, EnvironmentProviders, inject, Injector, makeEnvironmentProviders, signal, Signal, untracked} from '@angular/core';
import {mapToBody, MessageClient} from '@scion/microfrontend-platform';
import {takeUntilDestroyed, toObservable, toSignal} from '@angular/core/rxjs-interop';
import {WorkbenchMenuItemProxyLike, WorkbenchMenuItems, WorkbenchMenuItemTransferableLike, ɵWorkbenchClientMenuContributionCreateCommand, ɵWorkbenchClientMenuContributionRegisterCommand, ɵWorkbenchClientMenuItemLookupCommand, ɵWorkbenchClientMenuOpenCommand} from '@scion/workbench-client';
import {SciMenuAdapter, SciMenuContributionPosition, SciMenuDescriptor, SciMenuFactory, SciMenuGroupDescriptor, SciMenuOptions, SciToolbarFactory, SciToolbarGroupDescriptor, SciToolbarMenuDescriptor} from '@scion/sci-components/menu';
import {finalize, map} from 'rxjs/operators';
import {Objects} from '@scion/toolkit/util';
import {createDestroyableInjector} from '../../common/injector.util';
import {prune} from '../../common/prune.util';
import {fromEvent, Observable, switchMap} from 'rxjs';
import {createInvocationContext} from '../../invocation-context/invocation-context';
import {MicrofrontendPlatformStartupPhase, provideMicrofrontendPlatformInitializer} from '../microfrontend-platform-initializer';
import {SciMenuItems} from './workbench-client-menu-transform';

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
          const menuItems$ = messageClient.request$<WorkbenchMenuItemTransferableLike[]>(`workbench/menu/contribution/${contributionId}/create`, command)
            .pipe(
              mapToBody(),
              map(menuItems => WorkbenchMenuItems.fromTransferable(menuItems)),
            );
          return toSignal(menuItems$, {initialValue: []});
        }))();

        untracked(() => {
          // Populate menu or toolbar.
          if (contribution.scope === 'menu') {
            populateMenu(factory as SciMenuFactory, menuItems);
          }
          else if (contribution.scope === 'toolbar') {
            populateToolbar(factory as SciToolbarFactory, menuItems);
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
  const rootInjector = inject(Injector);
  const messageClient = inject(MessageClient);
  const menuAdapter = inject(SciMenuAdapter);

  messageClient.onMessage<ɵWorkbenchClientMenuItemLookupCommand, WorkbenchMenuItemTransferableLike[]>('workbench/menu/items', request => {
    const {location, context} = request.body!;
    const injector = createDestroyableInjector({parent: rootInjector});

    console.log('>>> lookup for location', location);
    const menuItems = menuAdapter.menuContributions(signal(location), signal(context), {injector});
    return toObservable(menuItems, {injector})
      .pipe(
        switchMap(menuItems => WorkbenchMenuItems.toTransferable$(SciMenuItems.toWorkbenchMenuItems(menuItems, {injector}))),
        finalize(() => injector.destroy()),
      );
  });
}

function installMenuOpenHandler(): void {
  const rootInjector = inject(Injector);
  const messageClient = inject(MessageClient);
  const menuAdapter = inject(SciMenuAdapter);

  messageClient.onMessage<ɵWorkbenchClientMenuOpenCommand, void>('workbench/menu/open', request => {
    const command = request.body!;
    const injector = createDestroyableInjector({parent: rootInjector});
    const invocationContext = createInvocationContext(command.workbenchElementId, {injector});
    const menu = Array.isArray(command.menu) ? SciMenuItems.fromWorkbenchMenuItemProxies(WorkbenchMenuItems.fromTransferable(command.menu), {injector}) : command.menu

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

    // Wait until closing the menu.
    return new Observable<never>(observer => {
      menuRef.onClose(() => observer.complete());
      return () => {
        injector.destroy()
        menuRef.close();
      }
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
        menu.addMenuItem({
          name: menuItemProxy.name,
          label: toSignal(menuItemProxy.label!, {requireSync: true}),
          icon: menuItemProxy.icon && toSignal(menuItemProxy.icon, {requireSync: true}),
          checked: menuItemProxy.checked && toSignal(menuItemProxy.checked, {requireSync: true}),
          tooltip: menuItemProxy.tooltip && toSignal(menuItemProxy.tooltip, {requireSync: true}),
          accelerator: menuItemProxy.accelerator,
          disabled: toSignal(menuItemProxy.disabled, {requireSync: true}),
          actions: actions => populateToolbar(actions, menuItemProxy.actions),
          // onFilter?: (filter: string) => boolean;
          cssClass: menuItemProxy.cssClass,
          onSelect: () => menuItemProxy.select(),
        });
        break;
      }
      case 'menu': {
        const menuDescriptor: SciMenuDescriptor = {
          name: menuItemProxy.name,
          label: toSignal(menuItemProxy.label!, {requireSync: true}),
          icon: menuItemProxy.icon && toSignal(menuItemProxy.icon, {requireSync: true}),
          tooltip: menuItemProxy.tooltip && toSignal(menuItemProxy.tooltip, {requireSync: true}),
          disabled: toSignal(menuItemProxy.disabled, {requireSync: true}),
          menu: {
            width: menuItemProxy.menu.width,
            minWidth: menuItemProxy.menu.minWidth,
            maxWidth: menuItemProxy.menu.maxWidth,
            maxHeight: menuItemProxy.menu.maxHeight,
            filter: menuItemProxy.menu.filter,
          },
          cssClass: menuItemProxy.cssClass,
        };
        menu.addMenu(menuDescriptor, menu => populateMenu(menu, menuItemProxy.children));
        break;
      }
      case 'group': {
        const groupDescriptor: SciMenuGroupDescriptor = {
          name: menuItemProxy.name,
          label: menuItemProxy.label && toSignal(menuItemProxy.label, {requireSync: true}),
          collapsible: menuItemProxy.collapsible,
          disabled: toSignal(menuItemProxy.disabled, {requireSync: true}),
          cssClass: menuItemProxy.cssClass,
        };
        menu.addGroup(groupDescriptor, group => populateMenu(group, menuItemProxy.children));
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
        toolbar.addToolbarItem({
          name: menuItemProxy.name,
          label: menuItemProxy.label && toSignal(menuItemProxy.label, {requireSync: true}),
          icon: toSignal(menuItemProxy.icon!, {requireSync: true}),
          checked: menuItemProxy.checked && toSignal(menuItemProxy.checked, {requireSync: true}),
          tooltip: menuItemProxy.tooltip && toSignal(menuItemProxy.tooltip, {requireSync: true}),
          accelerator: menuItemProxy.accelerator,
          disabled: toSignal(menuItemProxy.disabled, {requireSync: true}),
          cssClass: menuItemProxy.cssClass,
          onSelect: () => menuItemProxy.select(),
        });
        break;
      }
      case 'menu': {
        const menuDescriptor: SciToolbarMenuDescriptor = {
          name: menuItemProxy.name,
          label: menuItemProxy.label && toSignal(menuItemProxy.label, {requireSync: true}),
          icon: menuItemProxy.icon && toSignal(menuItemProxy.icon, {requireSync: true}),
          tooltip: menuItemProxy.tooltip && toSignal(menuItemProxy.tooltip, {requireSync: true}),
          disabled: toSignal(menuItemProxy.disabled, {requireSync: true}),
          visualMenuHint: menuItemProxy.visualMenuHint,
          menu: {
            width: menuItemProxy.menu.width,
            minWidth: menuItemProxy.menu.minWidth,
            maxWidth: menuItemProxy.menu.maxWidth,
            maxHeight: menuItemProxy.menu.maxHeight,
            filter: menuItemProxy.menu.filter,
          },
          cssClass: menuItemProxy.cssClass,
        };
        toolbar.addMenu(menuDescriptor, menu => populateMenu(menu, menuItemProxy.children));
        break;
      }
      case 'group': {
        const groupDescriptor: SciToolbarGroupDescriptor = {
          name: menuItemProxy.name,
          disabled: toSignal(menuItemProxy.disabled, {requireSync: true}),
          cssClass: menuItemProxy.cssClass,
        };
        toolbar.addGroup(groupDescriptor, group => populateToolbar(group, menuItemProxy.children));
        break;
      }
    }
  }
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

function coerceFilter(filter: ɵWorkbenchClientMenuOpenCommand['options']['filter'] | undefined): SciMenuOptions['filter'] | undefined {
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

  private readonly _cache = new Array<{context: Map<string, unknown>, menuItems: Signal<WorkbenchMenuItemProxyLike[]>}>;

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

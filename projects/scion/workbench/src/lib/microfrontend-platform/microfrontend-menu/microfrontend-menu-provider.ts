import {DestroyRef, DOCUMENT, EnvironmentProviders, inject, Injector, makeEnvironmentProviders, signal, Signal, untracked} from '@angular/core';
import {mapToBody, MessageClient} from '@scion/microfrontend-platform';
import {takeUntilDestroyed, toObservable, toSignal} from '@angular/core/rxjs-interop';
import {WorkbenchMenuItemLike, WorkbenchMenuItems, WorkbenchMenuItemTransferableLike, WorkbenchMenuOpenOptions, ɵWorkbenchClientMenuContributionCreateCommand, ɵWorkbenchClientMenuContributionRegisterCommand, ɵWorkbenchClientMenuItemLookupCommand, ɵWorkbenchClientMenuOpenCommand} from '@scion/workbench-client';
import {SciMenuAdapter, SciMenuContributionPosition, SciMenuDescriptor, SciMenuFactory, SciMenuGroupDescriptor, SciMenuOptions, SciToolbarFactory, SciToolbarGroupDescriptor, SciToolbarMenuDescriptor} from '@scion/sci-components/menu';
import {finalize, map} from 'rxjs/operators';
import {Objects} from '@scion/toolkit/util';
import {createDestroyableInjector} from '../../common/injector.util';
import {prune} from '../../common/prune.util';
import {fromEvent, Observable, switchMap} from 'rxjs';
import {createInvocationContext} from '../../invocation-context/invocation-context';
import {MicrofrontendPlatformStartupPhase, provideMicrofrontendPlatformInitializer} from '../microfrontend-platform-initializer';
import {SciMenuModel} from './workbench-client-menu-transform';

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
        switchMap(menuItems => WorkbenchMenuItems.toTransferable$(SciMenuModel.transformToWorkbenchMenuModel(menuItems, {injector}))),
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
    const menu = Array.isArray(command.menu) ? SciMenuModel.transformToSciMenuModel(WorkbenchMenuItems.fromTransferable(command.menu), {injector}) : command.menu

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
function populateMenu(menu: SciMenuFactory, menuItems: WorkbenchMenuItemLike[]): void {
  for (const menuItem of menuItems) {
    switch (menuItem.type) {
      case 'menu-item': {
        menu.addMenuItem({
          name: menuItem.name,
          label: toSignal(menuItem.label!, {requireSync: true}),
          icon: menuItem.icon && toSignal(menuItem.icon, {requireSync: true}),
          checked: menuItem.checked && toSignal(menuItem.checked, {requireSync: true}),
          tooltip: menuItem.tooltip && toSignal(menuItem.tooltip, {requireSync: true}),
          accelerator: menuItem.accelerator,
          disabled: toSignal(menuItem.disabled, {requireSync: true}),
          actions: actions => populateToolbar(actions, menuItem.actions),
          // onFilter?: (filter: string) => boolean;
          cssClass: menuItem.cssClass,
          onSelect: () => menuItem.select(),
        });
        break;
      }
      case 'menu': {
        const menuDescriptor: SciMenuDescriptor = {
          name: menuItem.name,
          label: toSignal(menuItem.label!, {requireSync: true}),
          icon: menuItem.icon && toSignal(menuItem.icon, {requireSync: true}),
          tooltip: menuItem.tooltip && toSignal(menuItem.tooltip, {requireSync: true}),
          disabled: toSignal(menuItem.disabled, {requireSync: true}),
          menu: {
            width: menuItem.menu.width,
            minWidth: menuItem.menu.minWidth,
            maxWidth: menuItem.menu.maxWidth,
            maxHeight: menuItem.menu.maxHeight,
            filter: menuItem.menu.filter,
          },
          cssClass: menuItem.cssClass,
        };
        menu.addMenu(menuDescriptor, menu => populateMenu(menu, menuItem.children));
        break;
      }
      case 'group': {
        const groupDescriptor: SciMenuGroupDescriptor = {
          name: menuItem.name,
          label: menuItem.label && toSignal(menuItem.label, {requireSync: true}),
          collapsible: menuItem.collapsible,
          disabled: toSignal(menuItem.disabled, {requireSync: true}),
          cssClass: menuItem.cssClass,
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
function populateToolbar(toolbar: SciToolbarFactory, menuItems: WorkbenchMenuItemLike[]): void {
  for (const menuItem of menuItems) {
    switch (menuItem.type) {
      case 'menu-item': {
        toolbar.addToolbarItem({
          name: menuItem.name,
          label: menuItem.label && toSignal(menuItem.label, {requireSync: true}),
          icon: toSignal(menuItem.icon!, {requireSync: true}),
          checked: menuItem.checked && toSignal(menuItem.checked, {requireSync: true}),
          tooltip: menuItem.tooltip && toSignal(menuItem.tooltip, {requireSync: true}),
          accelerator: menuItem.accelerator,
          disabled: toSignal(menuItem.disabled, {requireSync: true}),
          cssClass: menuItem.cssClass,
          onSelect: () => menuItem.select(),
        });
        break;
      }
      case 'menu': {
        const menuDescriptor: SciToolbarMenuDescriptor = {
          name: menuItem.name,
          label: menuItem.label && toSignal(menuItem.label, {requireSync: true}),
          icon: menuItem.icon && toSignal(menuItem.icon, {requireSync: true}),
          tooltip: menuItem.tooltip && toSignal(menuItem.tooltip, {requireSync: true}),
          disabled: toSignal(menuItem.disabled, {requireSync: true}),
          visualMenuHint: menuItem.visualMenuHint,
          menu: {
            width: menuItem.menu.width,
            minWidth: menuItem.menu.minWidth,
            maxWidth: menuItem.menu.maxWidth,
            maxHeight: menuItem.menu.maxHeight,
            filter: menuItem.menu.filter,
          },
          cssClass: menuItem.cssClass,
        };
        toolbar.addMenu(menuDescriptor, menu => populateMenu(menu, menuItem.children));
        break;
      }
      case 'group': {
        const groupDescriptor: SciToolbarGroupDescriptor = {
          name: menuItem.name,
          disabled: toSignal(menuItem.disabled, {requireSync: true}),
          cssClass: menuItem.cssClass,
        };
        toolbar.addGroup(groupDescriptor, group => populateToolbar(group, menuItem.children));
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

function coerceFilter(filter: WorkbenchMenuOpenOptions['filter'] | undefined): SciMenuOptions['filter'] | undefined {
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

  private readonly _cache = new Array<{context: Map<string, unknown>, menuItems: Signal<WorkbenchMenuItemLike[]>}>;

  public computeIfAbsent(context: Map<string, unknown>, computeFn: () => Signal<WorkbenchMenuItemLike[]>): Signal<WorkbenchMenuItemLike[]> {
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

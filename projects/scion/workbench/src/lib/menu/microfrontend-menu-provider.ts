import {EnvironmentInjector, EnvironmentProviders, inject, Injector, makeEnvironmentProviders, runInInjectionContext, Signal, untracked} from '@angular/core';
import {mapToBody, MessageClient} from '@scion/microfrontend-platform';
import {takeUntilDestroyed, toObservable, toSignal} from '@angular/core/rxjs-interop';
import {MicrofrontendPlatformStartupPhase, provideMicrofrontendPlatformInitializer} from '@scion/workbench';
import {WorkbenchClientMenuContributionFactoryCommand, WorkbenchClientMenuContributionRegisterCommand, WorkbenchClientMenuItemLike, WorkbenchClientMenuItemListCommand} from '@scion/workbench-client';
import {contributeMenu, SciMenuDescriptor, SciMenuFactory, SciMenuGroupDescriptor, SciMenuItemLike, SciMenuService, SciToolbarFactory, SciToolbarGroupDescriptor, SciToolbarMenuDescriptor} from '@scion/sci-components/menu';
import {finalize, map} from 'rxjs/operators';
import {fromRemoteSignal, toRemoteSignal} from './remote-signal';
import {UUID} from '@scion/toolkit/uuid';
import {Objects} from '@scion/toolkit/util';
import {createDestroyableInjector} from '../common/injector.util';

function installMenuRegistrator(): void {
  const environmentInjector = inject(EnvironmentInjector);
  const messageClient = inject(MessageClient);

  messageClient.onMessage<WorkbenchClientMenuContributionRegisterCommand>('workbench/menu/contribution/:contributionId/register', message => {
    const contributionId = message.params!.get('contributionId') as string;
    const contribution = message.body!;

    const injector = createDestroyableInjector({parent: environmentInjector});
    runInInjectionContext(injector, () => {
      // Destroy injector when unregistering the contribution.
      messageClient.observe$<void>(`workbench/menu/contribution/${contributionId}/unregister`)
        .pipe(takeUntilDestroyed())
        .subscribe(() => injector.destroy());

      // TODO [marc] beautify
      const menuItemCache = new Array<{context: Map<string, unknown>, menuItems: Signal<WorkbenchClientMenuItemLike[]>}>;

      contributeMenu(contribution.location, (factory: SciMenuFactory | SciToolbarFactory, context: Map<string, unknown>) => {
        let _remoteMenuItems = menuItemCache.find(it => Objects.isEqual(it.context, context))?.menuItems;
        untracked(() => {
          if (!_remoteMenuItems) {
            const request$ = messageClient.request$<WorkbenchClientMenuItemLike[]>(`workbench/menu/contribution/${contributionId}/create`, {context} satisfies WorkbenchClientMenuContributionFactoryCommand).pipe(mapToBody());
            _remoteMenuItems = toSignal(request$, {initialValue: []});
            menuItemCache.push({context, menuItems: _remoteMenuItems});
          }
        });
        const remoteMenuItems = _remoteMenuItems!();

        untracked(() => {
          // Track "remote" menu items constructed via the contributor's menu factory.
          // Since called in a reactive context, constructs the menu each time when menu items change.
          const menuItems = transformToSignalMenuModel(remoteMenuItems, {injector});

          // Populate menu or toolbar.
          if (contribution.scope === 'menu') {
            populateMenu(factory as SciMenuFactory, menuItems);
          }
          else if (contribution.scope === 'toolbar') {
            populateToolbar(factory as SciToolbarFactory, menuItems);
          }
        });
      });
    });
  });
}

function installMenuItemsReplier(): void {
  const environmentInjector = inject(EnvironmentInjector);
  const messageClient = inject(MessageClient);
  const menuService = inject(SciMenuService);

  messageClient.onMessage<WorkbenchClientMenuItemListCommand>('workbench/menu/items', request => {
    const {location, context} = request.body!;
    const injector = createDestroyableInjector({parent: environmentInjector});
    const menuItems = menuService.menuContributions(location, context, {injector});

    return toObservable(menuItems, {injector})
      .pipe(
        map(menuItems => transformToWorkbenchClientModel(menuItems, {injector})),
        finalize(() => injector.destroy()),
      );
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
 * Registers a set of DI providers to set up workbench menus.
 */
export function provideWorkbenchClientMenu(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideMicrofrontendPlatformInitializer(() => {
      installMenuRegistrator();
      installMenuItemsReplier();
    }, {phase: MicrofrontendPlatformStartupPhase.PostStartup}),
  ]);
}

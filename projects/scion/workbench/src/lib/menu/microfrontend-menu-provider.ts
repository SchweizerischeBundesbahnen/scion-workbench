import {EnvironmentProviders, inject, Injector, makeEnvironmentProviders, runInInjectionContext, Signal, untracked} from '@angular/core';
import {Beans} from '@scion/toolkit/bean-manager';
import {mapToBody, MessageClient} from '@scion/microfrontend-platform';
import {toObservable, toSignal} from '@angular/core/rxjs-interop';
import {MicrofrontendPlatformStartupPhase, provideMicrofrontendPlatformInitializer} from '@scion/workbench';
import {WorkbenchClientMenuContributionFactoryCommand, WorkbenchClientMenuContributionRegisterCommand, WorkbenchClientMenuItemLike, WorkbenchClientMenuItemListCommand} from '@scion/workbench-client';
import {contributeMenu, SciMenuDescriptor, SciMenuFactory, SciMenuGroupDescriptor, SciMenuItemLike, SciMenuService, SciToolbarFactory, SciToolbarGroupDescriptor, SciToolbarMenuDescriptor} from '@scion/sci-components/menu';
import {distinctUntilChanged, finalize, map, take} from 'rxjs/operators';
import {Subject, switchMap} from 'rxjs';
import {fromRemoteSignal, toRemoteSignal} from './remote-signal';
import {UUID} from '@scion/toolkit/uuid';

function installMenuRegistrator(): void {
  const parentInjector = inject(Injector);
  const messageClient = inject(MessageClient);

  messageClient.onMessage<WorkbenchClientMenuContributionRegisterCommand>('workbench/menu/contribution/:contributionId/register', message => {
    const contributionId = message.params!.get('contributionId') as string;
    const contribution = message.body!;

    // Create injector to bind resources which should be destroyed when unregistering the contribution.
    const injector = Injector.create({parent: parentInjector, providers: []});

    // Destroy injector when unregistering the contribution.
    messageClient.observe$<void>(`workbench/menu/contribution/${contributionId}/unregister`)
      .pipe(take(1))
      .subscribe(() => injector.destroy());

    runInInjectionContext(injector, () => {
      const context$ = new Subject<Map<string, unknown>>();
      const remoteMenuItems = toSignal(context$
        .pipe(
          distinctUntilChanged(),
          switchMap(context => messageClient.request$<WorkbenchClientMenuItemLike[]>(`workbench/menu/contribution/${contributionId}/create`, {context} satisfies WorkbenchClientMenuContributionFactoryCommand)),
          mapToBody(),
        ), {initialValue: []});

      contributeMenu(contribution.location, (factory: SciMenuFactory | SciToolbarFactory, context: Map<string, unknown>) => {
        // Set context, triggering "remote construction" in contributor's menu factory.
        untracked(() => context$.next(context));

        // Track "remote" menu items constructed via the contributor's menu factory.
        // Since called in a reactive context, constructs the menu each time when menu items change.
        const menuItems = transformToSignalMenuModel(remoteMenuItems(), {injector});

        untracked(() => {
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

function installMenuItemListReplier(): void {
  const parentInjector = inject(Injector);
  const messageClient = inject(MessageClient);
  const menuService = inject(SciMenuService);

  messageClient.onMessage<WorkbenchClientMenuItemListCommand>('workbench/menu/items', request => {
    const {location, context} = request.body!;
    // Create injector to bind resources which should be destroyed when unregistering the contribution.
    const injector = Injector.create({parent: parentInjector, providers: []});

    const menuItems = menuService.menuContributions(location, context);

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
          label: menuItem.label as Signal<string>,
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
          label: menuItem.label as Signal<string>,
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
          label: menuItem.label as Signal<string>,
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
          label: menuItem.label as Signal<string>,
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
          label: menuItem.label as Signal<string>,
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
          label: toRemoteSignal(`label-${menuItem.id}`, menuItem.label, {injector}),
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
          data: menuItem.data,
        };
      }
      case 'menu': {
        return {
          type: menuItem.type,
          name: menuItem.name,
          label: toRemoteSignal(`label-${menuItem.id}`, menuItem.label, {injector}),
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
          data: menuItem.data,
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
          data: menuItem.data,
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
        if (typeof menuItem.label === 'function') {
          throw Error('[MenuDefinitionError] Component not supported for label');
        }

        return {
          id: menuItemId,
          type: menuItem.type,
          name: menuItem.name,
          label: fromRemoteSignal(`label-${menuItemId}`, menuItem.label, {injector}),
          icon: fromRemoteSignal(`icon-${menuItemId}`, menuItem.icon, {injector}),
          tooltip: fromRemoteSignal(`tooltip-${menuItemId}`, menuItem.tooltip, {injector}),
          accelerator: menuItem.accelerator,
          disabled: fromRemoteSignal(`disabled-${menuItemId}`, menuItem.disabled, {injector}),
          checked: fromRemoteSignal(`checked-${menuItemId}`, menuItem.checked, {injector}),
          actions: transformToWorkbenchClientModel(menuItem.actions, {injector}),
          cssClass: menuItem.cssClass,
          position: menuItem.position,
          data: menuItem.data,
        };
      }
      case 'menu': {
        if (typeof menuItem.label === 'function') {
          throw Error('[MenuDefinitionError] Component not supported for label');
        }

        return {
          id: menuItemId,
          type: menuItem.type,
          name: menuItem.name,
          label: fromRemoteSignal(`label-${menuItemId}`, menuItem.label, {injector}),
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
          data: menuItem.data,
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
          data: menuItem.data,
        };
      }
    }
  });
}

// function installMenu(): void {
//   const injector = inject(EnvironmentInjector);
//   const menuService = inject(SciMenuService);
//   const messageClient = Beans.get(MessageClient);
//
//   const contributions = new Map<`menu:${string}` | `toolbar:${string}` | `group:${string}`, Observable<WorkbenchMenuCommands>>;
//
//   messageClient.onMessage<ɵWorkbenchMenuContributionCommand>(ɵWorkbenchCommands.menuContributionRegisterTopic(':menuContributionId'), message => {
//     const menuContributionId = message.params!.get('menuContributionId') as string;
//     const disposables = new Array<Disposable>();
//     const {location, contributions, context} = message.body!;
//
//     const environmentInjector = createEnvironmentInjector([], injector);
//
//     runInInjectionContext(environmentInjector, () => {
//       if (location.startsWith('menu:') || location.startsWith('group(menu):')) {
//         disposables.push(contributeToMenu(location as `menu:${string}` | `group(menu):${string}`, contributions, context));
//       }
//       else if (location.startsWith('toolbar:') || location.startsWith('group(toolbar):')) {
//         disposables.push(contributeToToolbar(location as `toolbar:${string}` | `group(toolbar):${string}`, contributions, context));
//       }
//     });
//
//     messageClient.onMessage(ɵWorkbenchCommands.menuContributionUnregisterTopic(menuContributionId), () => {
//       environmentInjector.destroy();
//       console.log('>>> dispose menu microfrontend-support');
//       disposables.forEach(disposable => disposable.dispose());
//     });
//   });
//
//   messageClient.onMessage<ɵWorkbenchMenuContributionRequestCommand, WorkbenchMenuCommands>(ɵWorkbenchCommands.menuContributionTopic, message => {
//     const {location, context} = message.body!;
//
//     if (!contributions.has(location)) {
//       const contributions$: Observable<WorkbenchMenuCommands> = toObservable(menuService.menuContributions([location], context), {injector}).pipe(mapArray(contribution => {
//         switch (contribution.type) {
//           case 'menu': {
//             return {
//               type: 'menu',
//               id: contribution.data?.[ɵMENU_ID_KEY] as string,
//               name: contribution.name,
//               label: (() => {
//                 if (!contribution.label) {
//                   return undefined;
//                 }
//                 const label = contribution.label();
//                 if (typeof label !== 'string') {
//                   return undefined;
//                 }
//                 return label;
//               })(),
//               icon: contribution.icon?.(),
//               tooltip: contribution.tooltip?.(),
//               disabled: contribution.disabled(),
//               visualMenuHint: contribution.visualMenuHint,
//               position: contribution.position,
//               menu: contribution.menu,
//               cssClass: contribution.cssClass,
//             } satisfies WorkbenchMenuCommand;
//           }
//           case 'menu-item': {
//             return {
//               type: 'menu-item',
//               id: contribution.data?.[ɵMENU_ID_KEY] as string,
//               name: contribution.name,
//               label: (() => {
//                 if (!contribution.label) {
//                   return undefined;
//                 }
//                 const label = contribution.label();
//                 if (typeof label !== 'string') {
//                   return undefined;
//                 }
//                 return label;
//               })(),
//               icon: contribution.icon?.(),
//               tooltip: contribution.tooltip?.(),
//               accelerator: contribution.accelerator,
//               disabled: contribution.disabled(),
//               checked: contribution.checked?.(),
//               actionToolbarName: contribution.actionToolbarName?.(),
//               position: contribution.position,
//               cssClass: contribution.cssClass,
//             } satisfies WorkbenchMenuItemCommand;
//           }
//           case 'group': {
//             return {
//               type: 'group',
//               id: contribution.data?.[ɵMENU_ID_KEY] as string,
//               name: contribution.name,
//               label: contribution.label?.(),
//               collapsible: contribution.collapsible,
//               position: contribution.position,
//               disabled: contribution.disabled ? contribution.disabled() : false,
//             } satisfies WorkbenchMenuGroupCommand;
//           }
//         }
//       }));
//       contributions.set(location, contributions$)
//     }
//
//     return contributions.get(location);
//   });
// }
//
// function contributeToMenu(location: `menu:${string}` | `group(menu):${string}`, contributions: WorkbenchMenuCommands, context: Map<string, unknown>): Disposable {
//   const messageClient = Beans.get(MessageClient);
//   const injector = inject(Injector);
//
//   return contributeMenu({location, context}, (menu: SciMenu | SciMenuGroup) => {
//     for (const contribution of contributions) {
//       switch (contribution.type) {
//         case 'menu':
//           menu.addMenu({
//             name: contribution.name,
//             label: observeProperty(ɵWorkbenchCommands.menuLabelTopic(contribution.id), {injector, initialValue: contribution.label ?? ''}),
//             icon: contribution.icon !== undefined ? observeProperty(ɵWorkbenchCommands.menuIconTopic(contribution.id), {injector, initialValue: contribution.icon ?? ''}) : undefined,
//             tooltip: contribution.tooltip !== undefined ? observeProperty(ɵWorkbenchCommands.menuTooltipTopic(contribution.id), {injector, initialValue: contribution.label ?? ''}) : undefined,
//             disabled: observeProperty(ɵWorkbenchCommands.menuDisabledTopic(contribution.id), {injector, initialValue: contribution.disabled ?? false}),
//             menu: contribution.menu,
//             data: {[ɵMENU_ID_KEY]: contribution.id},
//           }, menu => menu);
//           break;
//         case 'menu-item':
//           menu.addMenuItem({
//             name: contribution.name,
//             label: contribution.label !== undefined ? observeProperty(ɵWorkbenchCommands.menuLabelTopic(contribution.id), {injector, initialValue: contribution.label ?? ''}) : '',
//             tooltip: contribution.tooltip !== undefined ? observeProperty(ɵWorkbenchCommands.menuTooltipTopic(contribution.id), {injector, initialValue: contribution.label ?? ''}) : undefined,
//             icon: contribution.icon !== undefined ? observeProperty(ɵWorkbenchCommands.menuIconTopic(contribution.id), {injector, initialValue: contribution.icon ?? ''}) : undefined,
//             checked: contribution.checked !== undefined ? observeProperty(ɵWorkbenchCommands.menuCheckedTopic(contribution.id), {injector, initialValue: contribution.checked ?? false}) : undefined,
//             disabled: observeProperty(ɵWorkbenchCommands.menuDisabledTopic(contribution.id), {injector, initialValue: contribution.disabled ?? false}),
//             accelerator: contribution.accelerator,
//             data: {[ɵMENU_ID_KEY]: contribution.id},
//           }, () => void messageClient.publish<WorkbenchSelectCommand>(ɵWorkbenchCommands.menuSelectTopic(contribution.id), {context}));
//           break;
//         case 'group':
//           menu.addGroup({
//             name: contribution.name,
//             label: contribution.label !== undefined ? observeProperty(ɵWorkbenchCommands.menuLabelTopic(contribution.id), {injector, initialValue: contribution.label ?? ''}) : undefined,
//             disabled: observeProperty(ɵWorkbenchCommands.menuDisabledTopic(contribution.id), {injector, initialValue: contribution.disabled ?? false}),
//             collapsible: contribution.collapsible,
//             data: {[ɵMENU_ID_KEY]: contribution.id},
//           });
//           break;
//       }
//     }
//     return menu;
//   }, {injector});
// }
//
// function contributeToToolbar(location: `toolbar:${string}` | `group(toolbar):${string}`, contributions: WorkbenchMenuCommands, context: Map<string, unknown>): Disposable {
//   const messageClient = Beans.get(MessageClient);
//   const injector = inject(Injector);
//
//   return contributeMenu({location, context}, (toolbar: SciToolbar | SciToolbarGroup) => {
//     for (const contribution of contributions) {
//       switch (contribution.type) {
//         case 'menu':
//           toolbar.addMenu({
//             name: contribution.name,
//             label: contribution.label !== undefined ? observeProperty(ɵWorkbenchCommands.menuLabelTopic(contribution.id), {injector, initialValue: contribution.label ?? ''}) : undefined,
//             tooltip: contribution.tooltip !== undefined ? observeProperty(ɵWorkbenchCommands.menuTooltipTopic(contribution.id), {injector, initialValue: contribution.label ?? ''}) : undefined,
//             menu: contribution.menu,
//             data: {[ɵMENU_ID_KEY]: contribution.id},
//           }, menu => menu);
//           break;
//         case 'menu-item':
//           toolbar.addToolbarItem({
//             name: contribution.name,
//             label: contribution.label !== undefined ? observeProperty(ɵWorkbenchCommands.menuLabelTopic(contribution.id), {injector, initialValue: contribution.label ?? ''}) : undefined,
//             tooltip: contribution.tooltip !== undefined ? observeProperty(ɵWorkbenchCommands.menuTooltipTopic(contribution.id), {injector, initialValue: contribution.label ?? ''}) : undefined,
//             icon: contribution.icon !== undefined ? observeProperty(ɵWorkbenchCommands.menuIconTopic(contribution.id), {injector, initialValue: contribution.icon ?? ''}) : undefined,
//             checked: contribution.checked !== undefined ? observeProperty(ɵWorkbenchCommands.menuCheckedTopic(contribution.id), {injector, initialValue: contribution.checked ?? false}) : undefined,
//             data: {[ɵMENU_ID_KEY]: contribution.id},
//           }, () => void messageClient.publish<WorkbenchSelectCommand>(ɵWorkbenchCommands.menuSelectTopic(contribution.id), {context}));
//           break;
//         case 'group':
//           toolbar.addGroup({
//             name: contribution.name,
//             data: {[ɵMENU_ID_KEY]: contribution.id},
//           });
//           break;
//       }
//     }
//     return toolbar;
//   }, {injector});
// }

function observeProperty<T>(topic: string, options: {injector: Injector, initialValue: T}): Signal<T> {
  const messageClient = Beans.get(MessageClient);
  return toSignal(messageClient.observe$<T>(topic).pipe(mapToBody()), {injector: options.injector, initialValue: options.initialValue});
}

/**
 * Registers a set of DI providers to set up workbench menus.
 */
export function provideWorkbenchMenu(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideMicrofrontendPlatformInitializer(() => {
      installMenuRegistrator();
      installMenuItemListReplier();
    }, {phase: MicrofrontendPlatformStartupPhase.PostStartup}),
  ]);
}

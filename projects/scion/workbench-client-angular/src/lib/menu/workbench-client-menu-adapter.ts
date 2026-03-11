import {Disposable, SciMenuAdapter, SciMenuContribution, SciMenuItemLike, SciToolbarContribution, ɵcreateSciMenu, ɵcreateSciToolbar} from '@scion/sci-components/menu';
import {assertInInjectionContext, DestroyRef, inject, Injector, runInInjectionContext, Signal, untracked} from '@angular/core';
import {UUID} from '@scion/toolkit/uuid';
import {mapToBody, MessageClient} from '@scion/microfrontend-platform';
import {WorkbenchClientMenuContributionFactoryCommand, WorkbenchClientMenuContributionRegisterCommand, WorkbenchClientMenuItemLike, WorkbenchClientMenuItemListCommand} from '@scion/workbench-client';
import {fromRemoteSignal, toRemoteSignal} from './remote-signal';
import {map} from 'rxjs';
import {toSignal} from '@angular/core/rxjs-interop';

export class WorkbenchClientMenuAdapter implements SciMenuAdapter {

  private readonly _messageClient = inject(MessageClient);
  private readonly _injector = inject(Injector);

  public contributeMenu(location: `menu:${string}` | `toolbar:${string}` | `group:${string}`, contribution: SciMenuContribution | SciToolbarContribution, next: SciMenuAdapter): Disposable {
    assertInInjectionContext(this.contributeMenu);

    const contributionId = UUID.randomUUID();
    // Create injector to bind resources which should be destroyed when unregistering the contribution.
    const injector = Injector.create({parent: inject(Injector), providers: []});

    void this._messageClient.publish<WorkbenchClientMenuContributionRegisterCommand>(`workbench/menu/contribution/${contributionId}/register`, {
      location,
      scope: contribution.scope,
      requiredContext: contribution.requiredContext,
      position: contribution.position,
    });

    const subscription = this._messageClient.onMessage<WorkbenchClientMenuContributionFactoryCommand, WorkbenchClientMenuItemLike[]>(`workbench/menu/contribution/${contributionId}/create`, request => {
      const {context} = request.body!;

      if (contribution.scope === 'menu') {
        const menuItems = ɵcreateSciMenu(contribution.factory, context);
        return runInInjectionContext(injector, () => transformToWorkbenchClientModel(menuItems));
      }
      if (contribution.scope === 'toolbar') {
        const menuItems = ɵcreateSciToolbar(contribution.factory, context);
        return runInInjectionContext(injector, () => transformToWorkbenchClientModel(menuItems));
      }
      return [];
    });

    injector.get(DestroyRef).onDestroy(() => {
      subscription.unsubscribe();
      void this._messageClient.publish(`workbench/menu/contribution/${contributionId}/unregister`);
    });

    return {
      dispose: () => injector.destroy(),
    }
  }

  public menuContributions(location: `menu:${string}` | `toolbar:${string}` | `group:${string}`, context: Map<string, unknown>, next: SciMenuAdapter): Signal<SciMenuItemLike[]> {
    return untracked(() => { // untracked because invoked in a reactive context.

      const command: WorkbenchClientMenuItemListCommand = {location, context};
      return toSignal(this._messageClient.request$<WorkbenchClientMenuItemLike[]>('workbench/menu/items', command)
        .pipe(
          mapToBody(),
          map(menuItems => transformToSignalMenuModel(menuItems, {injector: this._injector})),
        ), {initialValue: [], injector: this._injector});
    });
  }
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

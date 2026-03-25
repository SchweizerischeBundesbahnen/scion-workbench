import {inject, Injector} from '@angular/core';
import {WorkbenchMenu, WorkbenchMenuGroup, WorkbenchMenuItem, WorkbenchMenuItemLike, WorkbenchMenuItemProxyLike} from '@scion/workbench-client';
import {SciMenu, SciMenuGroup, SciMenuItem, SciMenuItemLike} from '@scion/sci-components/menu';
import {toSignal} from '@angular/core/rxjs-interop';
import {UUID} from '@scion/toolkit/uuid';
import {toLazyObservable} from '../common/lazy-observable.util';

/**
 * Provides transformations between {@link SciMenuItemLike} of `@scion/components` and {@link WorkbenchMenuItemLike} of `@scion/workbench-client` menu models.
 *
 * Equivalent to `workbench-client-menu-transform.ts` in `@scion/workbench`.
 */
export namespace SciMenuItems {

  export function fromWorkbenchMenuItemProxies(menuItemProxies: WorkbenchMenuItemProxyLike[], options?: {injector?: Injector}): SciMenuItemLike[] {
    const injector = options?.injector ?? inject(Injector);

    return menuItemProxies.map((menuItemProxy: WorkbenchMenuItemProxyLike): SciMenuItemLike => {
      switch (menuItemProxy.type) {
        case 'menu-item': {
          return {
            type: menuItemProxy.type,
            name: menuItemProxy.name,
            label: menuItemProxy.label && {text: toSignal(menuItemProxy.label, {injector, requireSync: true})},
            icon: menuItemProxy.icon && toSignal(menuItemProxy.icon, {injector, requireSync: true}),
            tooltip: menuItemProxy.tooltip && toSignal(menuItemProxy.tooltip, {injector, requireSync: true}),
            accelerator: menuItemProxy.accelerator,
            disabled: toSignal(menuItemProxy.disabled, {injector, requireSync: true}),
            checked: menuItemProxy.checked && toSignal(menuItemProxy.checked, {injector, requireSync: true}),
            actions: SciMenuItems.fromWorkbenchMenuItemProxies(menuItemProxy.actions, {injector}),
            // matchesFilter: (filter: string) => true; // TODO
            cssClass: menuItemProxy.cssClass,
            position: menuItemProxy.position,
            onSelect: () => menuItemProxy.select(),
          } satisfies SciMenuItem;
        }
        case 'menu': {
          return {
            type: menuItemProxy.type,
            name: menuItemProxy.name,
            label: menuItemProxy.label && {text: toSignal(menuItemProxy.label, {injector, requireSync: true})},
            icon: menuItemProxy.icon && toSignal(menuItemProxy.icon, {injector, requireSync: true}),
            tooltip: menuItemProxy.tooltip && toSignal(menuItemProxy.tooltip, {injector, requireSync: true}),
            disabled: toSignal(menuItemProxy.disabled, {injector, requireSync: true}),
            visualMenuHint: menuItemProxy.visualMenuHint,
            position: menuItemProxy.position,
            menu: {
              width: menuItemProxy.menu.width,
              minWidth: menuItemProxy.menu.minWidth,
              maxWidth: menuItemProxy.menu.maxWidth,
              maxHeight: menuItemProxy.menu.maxHeight,
              filter: menuItemProxy.menu.filter,
            },
            cssClass: menuItemProxy.cssClass,
            children: SciMenuItems.fromWorkbenchMenuItemProxies(menuItemProxy.children, {injector}),
          } satisfies SciMenu;
        }
        case 'group': {
          return {
            type: menuItemProxy.type,
            name: menuItemProxy.name,
            label: menuItemProxy.label && toSignal(menuItemProxy.label, {injector, requireSync: true}),
            collapsible: menuItemProxy.collapsible,
            position: menuItemProxy.position,
            disabled: toSignal(menuItemProxy.disabled, {injector, requireSync: true}),
            cssClass: menuItemProxy.cssClass,
            children: SciMenuItems.fromWorkbenchMenuItemProxies(menuItemProxy.children, {injector}),
          } satisfies SciMenuGroup;
        }
      }
    });
  }

  export function toWorkbenchMenuItems(menuItems: SciMenuItemLike[], options?: {injector?: Injector}): WorkbenchMenuItemLike[] {
    const injector = options?.injector ?? inject(Injector);

    return menuItems.map((menuItem: SciMenuItemLike): WorkbenchMenuItemLike => {
      const menuItemId = UUID.randomUUID();

      switch (menuItem.type) {
        case 'menu-item': {
          if (menuItem.label?.component) {
            throw Error('[MenuDefinitionError] Component not supported as menu label.');
          }

          return new WorkbenchMenuItem({
            id: menuItemId,
            name: menuItem.name,
            label: toLazyObservable(menuItem.label?.text, {injector}),
            icon: toLazyObservable(menuItem.icon, {injector}),
            tooltip: toLazyObservable(menuItem.tooltip, {injector}),
            accelerator: menuItem.accelerator,
            disabled: toLazyObservable(menuItem.disabled, {injector}),
            checked: toLazyObservable(menuItem.checked, {injector}),
            actions: SciMenuItems.toWorkbenchMenuItems(menuItem.actions, {injector}),
            cssClass: menuItem.cssClass,
            position: menuItem.position,
            // matchesFilter: filter => menuItem?.matchesFilter(filter),
            onSelect: menuItem.onSelect,
          });
        }
        case 'menu': {
          if (menuItem.label?.component) {
            throw Error('[MenuDefinitionError] Component not supported as menu label.');
          }

          return new WorkbenchMenu({
            id: menuItemId,
            name: menuItem.name,
            label: toLazyObservable(menuItem.label?.text, {injector}),
            icon: toLazyObservable(menuItem.icon, {injector}),
            tooltip: toLazyObservable(menuItem.tooltip, {injector}),
            disabled: toLazyObservable(menuItem.disabled, {injector}),
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
            children: SciMenuItems.toWorkbenchMenuItems(menuItem.children, {injector}),
          });
        }
        case 'group': {
          return new WorkbenchMenuGroup({
            id: menuItemId,
            name: menuItem.name,
            label: toLazyObservable(menuItem.label, {injector}),
            disabled: toLazyObservable(menuItem.disabled, {injector}),
            collapsible: menuItem.collapsible,
            position: menuItem.position,
            cssClass: menuItem.cssClass,
            children: SciMenuItems.toWorkbenchMenuItems(menuItem.children, {injector}),
          });
        }
      }
    });
  }
}

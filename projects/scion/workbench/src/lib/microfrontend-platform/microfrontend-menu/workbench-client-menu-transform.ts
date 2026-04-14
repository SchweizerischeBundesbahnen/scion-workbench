import {inject, Injector} from '@angular/core';
import {WorkbenchMenu, WorkbenchMenuGroup, WorkbenchMenuItem, WorkbenchMenuItemLike, WorkbenchMenuItemProxyLike} from '@scion/workbench-client';
import {SciMenu, SciMenuGroup, SciMenuItem, SciMenuItemLike} from '@scion/sci-components/menu';
import {toSignal} from '@angular/core/rxjs-interop';
import {UUID} from '@scion/toolkit/uuid';
import {toLazyObservable} from '../common/lazy-observable.util';

/**
 * Provides transformations between {@link SciMenuItemLike} of `@scion/components` and {@link WorkbenchMenuItemLike} of `@scion/workbench-client` menu models.
 *
 * Equivalent to `workbench-client-menu-transform.ts` in `@scion/workbench-client-angular`.
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
            labelText: menuItemProxy.label && toSignal(menuItemProxy.label, {injector, requireSync: true}),
            iconLigature: menuItemProxy.icon && toSignal(menuItemProxy.icon, {injector, requireSync: true}),
            tooltip: menuItemProxy.tooltip && toSignal(menuItemProxy.tooltip, {injector, requireSync: true}),
            accelerator: menuItemProxy.accelerator,
            disabled: menuItemProxy.disabled && toSignal(menuItemProxy.disabled, {injector, requireSync: true}),
            checked: menuItemProxy.checked && toSignal(menuItemProxy.checked, {injector, requireSync: true}),
            actions: SciMenuItems.fromWorkbenchMenuItemProxies(menuItemProxy.actions, {injector}),
            // matchesFilter: (filter: string) => true; // TODO [menu]
            cssClass: menuItemProxy.cssClass,
            attributes: menuItemProxy.attributes,
            position: menuItemProxy.position,
            onSelect: () => menuItemProxy.select(),
          } satisfies SciMenuItem;
        }
        case 'menu': {
          return {
            type: menuItemProxy.type,
            name: menuItemProxy.name,
            labelText: menuItemProxy.label && toSignal(menuItemProxy.label, {injector, requireSync: true}),
            iconLigature: menuItemProxy.icon && toSignal(menuItemProxy.icon, {injector, requireSync: true}),
            tooltip: menuItemProxy.tooltip && toSignal(menuItemProxy.tooltip, {injector, requireSync: true}),
            disabled: menuItemProxy.disabled && toSignal(menuItemProxy.disabled, {injector, requireSync: true}),
            visualMenuHint: menuItemProxy.visualMenuHint,
            position: menuItemProxy.position,
            menu: {
              width: menuItemProxy.menu.width,
              minWidth: menuItemProxy.menu.minWidth,
              maxWidth: menuItemProxy.menu.maxWidth,
              maxHeight: menuItemProxy.menu.maxHeight,
              filter: menuItemProxy.menu.filter && {
                placeholder: menuItemProxy.menu.filter.placeholder && toSignal(menuItemProxy.menu.filter.placeholder, {injector, requireSync: true}),
                notFoundText: menuItemProxy.menu.filter.notFoundText && toSignal(menuItemProxy.menu.filter.notFoundText, {injector, requireSync: true}),
              },
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
            disabled: menuItemProxy.disabled && toSignal(menuItemProxy.disabled, {injector, requireSync: true}),
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
          if (menuItem.labelComponent) {
            throw Error('[MenuDefinitionError] Component not supported as label in microfrontend menu.');
          }
          if (menuItem.iconComponent) {
            throw Error('[MenuDefinitionError] Component not supported as icon in microfrontend menu.');
          }
          if (menuItem.control) {
            throw Error('[MenuDefinitionError] Control not supported in microfrontend toolbar.');
          }

          return new WorkbenchMenuItem({
            id: menuItemId,
            name: menuItem.name,
            label: toLazyObservable(menuItem.labelText, {injector}),
            icon: toLazyObservable(menuItem.iconLigature, {injector}),
            tooltip: toLazyObservable(menuItem.tooltip, {injector}),
            accelerator: menuItem.accelerator,
            disabled: toLazyObservable(menuItem.disabled, {injector}),
            checked: toLazyObservable(menuItem.checked, {injector}),
            actions: SciMenuItems.toWorkbenchMenuItems(menuItem.actions ?? [], {injector}),
            cssClass: menuItem.cssClass,
            attributes: menuItem.attributes,
            position: menuItem.position,
            // matchesFilter: filter => menuItem?.matchesFilter(filter),
            onSelect: menuItem.onSelect,
          });
        }
        case 'menu': {
          if (menuItem.labelComponent) {
            throw Error('[MenuDefinitionError] Component not supported as label in microfrontend menu.');
          }
          if (menuItem.iconComponent) {
            throw Error('[MenuDefinitionError] Component not supported as icon in microfrontend menu.');
          }

          return new WorkbenchMenu({
            id: menuItemId,
            name: menuItem.name,
            label: toLazyObservable(menuItem.labelText, {injector}),
            icon: toLazyObservable(menuItem.iconLigature, {injector}),
            tooltip: toLazyObservable(menuItem.tooltip, {injector}),
            disabled: toLazyObservable(menuItem.disabled, {injector}),
            visualMenuHint: menuItem.visualMenuHint,
            position: menuItem.position,
            menu: {
              width: menuItem.menu.width,
              minWidth: menuItem.menu.minWidth,
              maxWidth: menuItem.menu.maxWidth,
              maxHeight: menuItem.menu.maxHeight,
              filter: menuItem.menu.filter && {
                placeholder: toLazyObservable(menuItem.menu.filter.placeholder, {injector}),
                notFoundText: toLazyObservable(menuItem.menu.filter.notFoundText, {injector}),
              },
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

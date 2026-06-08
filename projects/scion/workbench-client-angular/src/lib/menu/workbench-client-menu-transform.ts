/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {inject, Injector} from '@angular/core';
import {WorkbenchMenuGroup, WorkbenchMenuItem, WorkbenchMenuItemLike, WorkbenchMenuItemProxyLike} from '@scion/workbench-client';
import {SciMenuGroup, SciMenuItem, SciMenuItemLike} from '@scion/components/menu';
import {toSignal} from '@angular/core/rxjs-interop';
import {UUID} from '@scion/toolkit/uuid';
import {toLazyObservable} from '@scion/components/common';

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
            labelText: menuItemProxy.label && toSignal(menuItemProxy.label, {injector, requireSync: true}),
            iconLigature: menuItemProxy.icon && toSignal(menuItemProxy.icon, {injector, requireSync: true}),
            tooltip: menuItemProxy.tooltip && toSignal(menuItemProxy.tooltip, {injector, requireSync: true}),
            accelerator: menuItemProxy.accelerator,
            disabled: menuItemProxy.disabled && toSignal(menuItemProxy.disabled, {injector, requireSync: true}),
            visible: menuItemProxy.visible && toSignal(menuItemProxy.visible, {injector, requireSync: true}),
            checked: menuItemProxy.checked && toSignal(menuItemProxy.checked, {injector, requireSync: true}),
            active: menuItemProxy.active && toSignal(menuItemProxy.active, {injector, requireSync: true}),
            actions: SciMenuItems.fromWorkbenchMenuItemProxies(menuItemProxy.actions, {injector}),
            position: menuItemProxy.position,
            visualMenuIndicator: menuItemProxy.visualMenuIndicator,
            cssClass: menuItemProxy.cssClass,
            attributes: menuItemProxy.attributes,
            onSelect: menuItemProxy.select,
            menu: menuItemProxy.menu && {
              name: menuItemProxy.menu.name,
              width: menuItemProxy.menu.width,
              minWidth: menuItemProxy.menu.minWidth,
              maxWidth: menuItemProxy.menu.maxWidth,
              maxHeight: menuItemProxy.menu.maxHeight,
              filter: menuItemProxy.menu.filter && {
                placeholder: menuItemProxy.menu.filter.placeholder && toSignal(menuItemProxy.menu.filter.placeholder, {injector, requireSync: true}),
                notFoundMessage: menuItemProxy.menu.filter.notFoundMessage && toSignal(menuItemProxy.menu.filter.notFoundMessage, {injector, requireSync: true}),
                focus: menuItemProxy.menu.filter.focus,
              },
              children: SciMenuItems.fromWorkbenchMenuItemProxies(menuItemProxy.menu.children, {injector}),
            },
          } satisfies SciMenuItem;
        }
        case 'group': {
          return {
            type: menuItemProxy.type,
            name: menuItemProxy.name,
            label: menuItemProxy.label && toSignal(menuItemProxy.label, {injector, requireSync: true}),
            collapsible: menuItemProxy.collapsible,
            glyphArea: menuItemProxy.glyphArea,
            disabled: menuItemProxy.disabled && toSignal(menuItemProxy.disabled, {injector, requireSync: true}),
            visible: menuItemProxy.visible && toSignal(menuItemProxy.visible, {injector, requireSync: true}),
            position: menuItemProxy.position,
            actions: SciMenuItems.fromWorkbenchMenuItemProxies(menuItemProxy.actions, {injector}),
            children: SciMenuItems.fromWorkbenchMenuItemProxies(menuItemProxy.children, {injector}),
            cssClass: menuItemProxy.cssClass,
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
            visible: toLazyObservable(menuItem.visible, {injector}),
            checked: toLazyObservable(menuItem.checked, {injector}),
            active: toLazyObservable(menuItem.active, {injector}),
            actions: SciMenuItems.toWorkbenchMenuItems(menuItem.actions ?? [], {injector}),
            position: menuItem.position,
            visualMenuIndicator: menuItem.visualMenuIndicator,
            cssClass: menuItem.cssClass,
            attributes: menuItem.attributes,
            onSelect: menuItem.onSelect,
            menu: menuItem.menu && {
              name: menuItem.menu.name,
              width: menuItem.menu.width,
              minWidth: menuItem.menu.minWidth,
              maxWidth: menuItem.menu.maxWidth,
              maxHeight: menuItem.menu.maxHeight,
              filter: menuItem.menu.filter && {
                placeholder: toLazyObservable(menuItem.menu.filter.placeholder, {injector}),
                notFoundMessage: toLazyObservable(menuItem.menu.filter.notFoundMessage, {injector}),
                focus: menuItem.menu.filter.focus,
              },
              children: SciMenuItems.toWorkbenchMenuItems(menuItem.menu.children, {injector}),
            },
          });
        }
        case 'group': {
          return new WorkbenchMenuGroup({
            id: menuItemId,
            name: menuItem.name,
            label: toLazyObservable(menuItem.label, {injector}),
            collapsible: menuItem.collapsible,
            glyphArea: menuItem.glyphArea,
            disabled: toLazyObservable(menuItem.disabled, {injector}),
            visible: toLazyObservable(menuItem.visible, {injector}),
            position: menuItem.position,
            actions: SciMenuItems.toWorkbenchMenuItems(menuItem.actions ?? [], {injector}),
            children: SciMenuItems.toWorkbenchMenuItems(menuItem.children, {injector}),
            cssClass: menuItem.cssClass,
          });
        }
      }
    });
  }
}

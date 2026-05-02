/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Disposable, MaybeArray} from '@scion/toolkit/types';
import {Beans} from '@scion/toolkit/bean-manager';
import {ɵWorkbenchMenuService} from './ɵworkbench-menu.service';
import {Arrays} from '@scion/toolkit/util';
import {WorkbenchMenuItemProxy, WorkbenchMenuItemProxyLike} from './workbench-client-menu.model';
import {combineLatest, EMPTY, fromEvent, merge, MonoTypeOperatorFunction, of, pipe} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {filterArray, mapArray} from '@scion/toolkit/operators';
import {provideMenuEnvironmentContext} from './workbench-menu-environment-provider';

export function installMenuAccelerators(location: `menu:${string}`, options?: WorkbenchMenuAcceleratorOptions): Disposable {
  const context = new Map<string, unknown>([...provideMenuEnvironmentContext(), ...options?.context ?? new Map()]);
  const acceleratorTargets = Arrays.coerce(options?.target ?? document);

  const subscription = Beans.get(ɵWorkbenchMenuService).menuItems$(location, context, {metadata: options?.metadata})
    .pipe(
      filterDisabledMenuItems(),
      map(menuItems => collectAccelerators(menuItems)),
      switchMap(menuItems => menuItems.length ? merge(...acceleratorTargets.map(target => fromEvent<KeyboardEvent>(target, 'keydown'))).pipe(map(event => ({event, menuItems}))) : EMPTY),
    )
    .subscribe(({event, menuItems}) => {
      // Skip if only pressing a modifier key.
      switch (event.key) {
        case 'Control':
        case 'Shift':
        case 'Alt':
        case 'AltGraph':
          return;
        // UNDOCUMENTED: `event.key` can be `undefined`, for example, when selecting an option from an input element's datalist.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        case undefined:
          return;
      }

      // Skip if not pressing a modifier key. Accelerators must have a modifier key.
      if (!event.ctrlKey && !event.altKey && !event.shiftKey && !event.metaKey && !allowedSingleKeys.has(event.key.toLowerCase())) {
        return;
      }

      const matchingMenuItems = menuItems.filter(menuItem => matchesAccelerator(menuItem.accelerator!, event));
      if (!matchingMenuItems.length) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      // Execute action.
      matchingMenuItems.forEach(menuItem => void menuItem.select());
    });

  return {
    dispose: () => subscription.unsubscribe(),
  };
}

/**
 * Removes disabled menu items.
 */
function filterDisabledMenuItems(): MonoTypeOperatorFunction<WorkbenchMenuItemProxyLike[]> {
  return pipe(
    switchMap(menuItems => menuItems.length ? combineLatest(menuItems.map(menuItem => menuItem.disabled !== undefined ? menuItem.disabled.pipe(map(disabled => ({menuItem, disabled}))) : of({menuItem, disabled: false}))) : of([])),
    filterArray(menuItem => !menuItem.disabled),
    mapArray(({menuItem}) => menuItem),
  );
}

/**
 * Returns a flat list of all menu items that have an accelerator.
 */
function collectAccelerators(menuItemLikes: WorkbenchMenuItemProxyLike[]): WorkbenchMenuItemProxy[] {
  return menuItemLikes.reduce((menuItems, menuItemLike) => {
    switch (menuItemLike.type) {
      case 'menu-item': {
        return menuItems.concat(collectAccelerators(menuItemLike.actions)).concat(menuItemLike.accelerator ? menuItemLike : []);
      }
      case 'menu':
        return menuItems.concat(collectAccelerators(menuItemLike.children));
      case 'group': {
        return menuItems.concat(collectAccelerators(menuItemLike.children)).concat(collectAccelerators(menuItemLike.actions));
      }
    }
  }, new Array<WorkbenchMenuItemProxy>());
}

/**
 * Tests if given accelerator matches given keystroke.
 */
function matchesAccelerator(accelerator: WorkbenchKeyboardAccelerator, event: KeyboardEvent): boolean {
  if (accelerator.key.toLowerCase() !== event.key.toLowerCase()) {
    return false;
  }
  if ((accelerator.ctrl ?? false) !== event.ctrlKey) {
    return false;
  }
  if ((accelerator.shift ?? false) !== event.shiftKey) {
    return false;
  }
  if ((accelerator.alt ?? false) !== event.altKey) {
    return false;
  }
  if ((accelerator.meta ?? false) !== event.metaKey) {
    return false;
  }
  if (accelerator.location === 'left' && event.location !== 1) {
    return false;
  }
  if (accelerator.location === 'right' && event.location !== 2) {
    return false;
  }
  if (accelerator.location === 'numpad' && event.location !== 3) {
    return false;
  }
  return true;
}

export interface WorkbenchMenuAcceleratorOptions {
  target?: MaybeArray<Element>;
  context?: Map<string, unknown>;
  metadata?: {[key: string]: unknown};
}

export interface WorkbenchKeyboardAccelerator {
  key: string;
  /**
   * Specifies if the Control key is required.
   */
  ctrl?: boolean;
  /**
   * Specifies if the Shift key is required.
   */
  shift?: boolean;
  /**
   * Specifies if the Alt key is required.
   */
  alt?: boolean;
  /**
   * Specifies if the Command (Mac) or Windows key is required.
   */
  meta?: boolean;
  /**
   * Defines the specific physical location of the key.
   *
   * - `numpad`: Keys on the number pad.
   * - `left`: Use only the left-side version of the key.
   * - `right`: Use only the right-side version of the key.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/location
   */
  location?: 'numpad' | 'left' | 'right';
}

/**
 * Keys that can be used without a modifier (ctrl, alt, shift).
 */
const allowedSingleKeys = new Set<string>([
  ...Array.from(Array(20).keys()).map(i => `f${i + 1}`), // F1 - F20
  'delete',
]);

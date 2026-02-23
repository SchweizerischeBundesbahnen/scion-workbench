/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {computed, DOCUMENT, effect, ElementRef, inject, Injector, NgZone, runInInjectionContext, Signal, signal, untracked} from '@angular/core';
import {SciMenuItem, SciMenuItemLike} from './menu.model';
import {Disposable} from './common/disposable';
import {fromEvent, merge} from 'rxjs';
import {subscribeIn} from '@scion/toolkit/operators';
import {Arrays} from '@scion/toolkit/util';
import {createDestroyableInjector} from './common/injector.util';
import {ɵSciMenuService} from './ɵmenu.service';
import {MaybeArray} from '@scion/sci-components/common';
import {coerceElement} from '@angular/cdk/coercion';
import {SciMenuEnvironmentProviders} from './environment/menu-environment-providers';

/**
 * INPUTS FOR DOCUMENTING THIS FUNCTION:
 *
 * Installs accelerator keys of specified menu items on specified element.
 *
 * Accelerators are strings that can be used to represent keyboard shortcuts throughout your Electron. These strings can contain multiple modifier keys and a single key code joined by the + character.
 *
 * Represents a keyboard shortcut (or accelerator) that lets a user perform an action using the keyboard instead of navigating the app UI (directly or through access keys).
 *
 * An accelerator key can be a single key, such as F1 - F12 and Esc, or a combination of keys (Ctrl + Shift + B, or Ctrl C) that invoke a command. They differ from access keys (mnemonics), which are typically modified with the Alt key and simply activate a command or control.
 *
 * Unsubscribes from keyboard events when the injection context is destroyed.
 */
export function installMenuAccelerators(location: `menu:${string}` | `toolbar:${string}` | `menubar:${string}`, options?: SciMenuAcceleratorOptions): Disposable {
  const injector = createDestroyableInjector({parent: options?.injector ?? inject(Injector)});

  return runInInjectionContext(injector, () => {
    const zone = inject(NgZone);

    const context = inject(SciMenuEnvironmentProviders).provideContext(options?.context);
    const menuItems = inject(ɵSciMenuService).menuItems(location, context, {metadata: options?.metadata});
    const acceleratorTargets = computeAcceleratorTargets(options);

    effect(onCleanup => {
      const accelerators = collectAccelerators(menuItems());
      if (!accelerators.length) {
        return;
      }
      const targets = acceleratorTargets();

      untracked(() => {
        const subscription = merge(...targets.map(target => fromEvent<KeyboardEvent>(target, 'keydown')))
          .pipe(subscribeIn(fn => zone.runOutsideAngular(fn)))
          .subscribe(event => {
            // Skip if only pressing a modifier key.
            switch (event.key) {
              case 'Control':
              case 'Shift':
              case 'Alt':
              case 'AltGraph':
              case undefined: // UNDOCUMENTED: `event.key` can be `undefined`, for example, when selecting an option from an input element's datalist.
                return;
            }

            // Skip if not pressing a modifier key. Accelerators must have a modifier key.
            if (!event.ctrlKey && !event.altKey && !event.shiftKey && !event.metaKey && !allowedSingleKeys.has(event.key.toLowerCase())) {
              return;
            }

            const matchingMenuItems = accelerators.filter(menuItem => {
              return !menuItem.disabled?.() && matchesAccelerator(menuItem.accelerator!, event)
            });
            if (!matchingMenuItems.length) {
              return;
            }

            event.preventDefault();
            event.stopPropagation();

            // Execute action.
            zone.run(() => matchingMenuItems.forEach(menuItem => menuItem.onSelect()));
          });

        onCleanup(() => subscription.unsubscribe());
      });
    });

    return {
      dispose: () => injector.destroy(),
    }
  });
}

function computeAcceleratorTargets(options?: SciMenuAcceleratorOptions): Signal<Array<Element | Document>> {
  const acceleratorTargets = Arrays.coerce(options?.target).map(coerceElement);
  if (acceleratorTargets.length) {
    return signal(acceleratorTargets);
  }

  const environmentAcceleratorTargets = inject(SciMenuEnvironmentProviders).provideAcceleratorTargets();
  const document = inject(DOCUMENT);
  return computed(() => environmentAcceleratorTargets().length ? environmentAcceleratorTargets() : [document]);
}

/**
 * Returns a flat list of all menu items that have an accelerator.
 */
export function collectAccelerators(menuItemLikes: SciMenuItemLike[]): SciMenuItem[] {
  return menuItemLikes.reduce((menuItems, menuItemLike) => {
    switch (menuItemLike.type) {
      case 'menu-item': {
        return menuItemLike.accelerator ? menuItems.concat(menuItemLike) : menuItems;
      }
      case 'menu':
      case 'group': {
        return menuItems.concat(collectAccelerators(menuItemLike.children));
      }
    }
  }, new Array<SciMenuItem>());
}

/**
 * Validates the passed menu accelerator to have a modifier, unless a function key, 'Delete', or 'Escape'.
 */
export function validateMenuAccelerator(accelerator: SciKeyboardAccelerator | undefined): SciKeyboardAccelerator | undefined {
  if (!accelerator) {
    return undefined;
  }

  if (!accelerator.ctrl && !accelerator.alt && !accelerator.shift && !accelerator.meta && !allowedSingleKeys.has(accelerator.key.toLowerCase())) {
    console.warn(`[MenuDefinitionError] Illegal menu accelerator. The key '${accelerator.key}' requires a modifier such as 'Ctrl', 'Shift', or 'Alt'. Only function keys F1-F12 and 'Delete' are allowed without a modifier. Examples: ['ctrl', 's'], ['F5'].`);
    return undefined;
  }
  return accelerator;
}

/**
 * Tests if given accelerator matches given keystroke.
 */
function matchesAccelerator(accelerator: SciKeyboardAccelerator, event: KeyboardEvent): boolean {
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
    return false
  }
  if (accelerator.location === 'right' && event.location !== 2) {
    return false
  }
  if (accelerator.location === 'numpad' && event.location !== 3) {
    return false
  }
  return true;
}

export interface SciMenuAcceleratorOptions {
  target?: MaybeArray<Element | ElementRef<Element>>;
  context?: Map<string, unknown>;
  injector?: Injector;
  metadata?: {[key: string]: unknown};
}

/**
 * Single key (A, Delete, F2, Spacebar, Esc, Multimedia Key) accelerators and multi-key accelerators (Ctrl+Shift+M) are supported.
 */
export interface SciKeyboardAccelerator {
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

/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {computed, DOCUMENT, effect, inject, Injector, NgZone, runInInjectionContext, untracked} from '@angular/core';
import {SciMenuItem, SciMenuItemLike} from './menu.model';
import {Disposable} from './common/disposable';
import {fromEvent} from 'rxjs';
import {subscribeIn} from '@scion/toolkit/operators';
import {Objects} from '@scion/toolkit/util';
import {SciMenuContextProvider} from './menu-context-provider';
import {createDestroyableInjector} from './common/injector.util';
import {ɵSciMenuService} from './ɵmenu.service';
import {SciMenuAcceleratorTargetProvider} from './menu-accelerator-target-provider';
import {coerceSignal} from '@scion/sci-components/common';

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
 */
export function installMenuAccelerators(location: `menu:${string}` | `toolbar:${string}`, options?: SciMenuAcceleratorOptions): Disposable {
  const injector = createDestroyableInjector({parent: options?.injector});
  return runInInjectionContext(injector, () => {
    const menuService = inject(ɵSciMenuService);
    const menuContextProvider = inject(SciMenuContextProvider, {optional: true});
    const menuAcceleratorTargetProvider = inject(SciMenuAcceleratorTargetProvider, {optional: true});
    const zone = inject(NgZone);
    const document = inject(DOCUMENT);

    const environmentContext = coerceSignal(menuContextProvider?.provideContext?.());
    const context = computed(() => new Map<string, unknown>([...environmentContext?.() ?? new Map(), ...options?.context ?? new Map()]));
    const menuItems = menuService.menuItems(location, context, {metadata: options?.metadata});

    const target = menuAcceleratorTargetProvider?.provideTarget();
    const contextualAcceleratorTarget = coerceSignal(target);

    effect(onCleanup => {
      const acceleratedMenuItems = collectMenuItemsWithAccelerator(menuItems());
      const target = options?.target ?? contextualAcceleratorTarget?.() ?? document;
      if (!acceleratedMenuItems.length) {
        return;
      }

      untracked(() => {
        const subscription = fromEvent<KeyboardEvent>(target, 'keydown')
          .pipe(subscribeIn(fn => zone.runOutsideAngular(fn)))
          .subscribe(event => {
            const key = (event.key as string | undefined)?.toLowerCase() ?? ''; // `event.key` can be `undefined`, for example, when selecting an option from an input element's datalist.
            const modifiers = getModifierState(event);

            const matchingMenuItems = acceleratedMenuItems.filter(menuItem => matchesMenuItemAccelerator(menuItem, {key, modifiers}));
            if (!matchingMenuItems.length) {
              return;
            }

            event.preventDefault();
            event.stopPropagation();

            // Execute action.
            runInInjectionContext(injector, () => zone.run(() => {
              matchingMenuItems.forEach(menuItem => menuItem.onSelect());
            }));
          });

        onCleanup(() => subscription.unsubscribe());
      });
    });

    return {
      dispose: () => injector.destroy(),
    }
  });
}

function collectMenuItemsWithAccelerator(menuContributions: SciMenuItemLike[]): SciMenuItem[] {
  return menuContributions.reduce((menuItems, menuContribution) => {
    switch (menuContribution.type) {
      case 'menu-item': {
        return menuItems.concat(menuContribution.accelerator?.length ? menuContribution : []);
      }
      case 'menu':
      case 'group': {
        return menuItems.concat(collectMenuItemsWithAccelerator(menuContribution.children));
      }
    }
  }, new Array<SciMenuItem>());
}

/**
 * Tests if the accelerator of given menu item matches given keystroke.
 */
function matchesMenuItemAccelerator(menuItem: SciMenuItem, keystroke: {key: string; modifiers: string[]}): boolean {
  if (menuItem.disabled?.()) { // TODO [menu] also visible check
    return false;
  }

  const accelerator = menuItem.accelerator!.map(accelerator => accelerator.toLocaleLowerCase());
  const key = accelerator.at(-1)!;
  const modifierKeys = accelerator.slice(0, -1);
  return key === keystroke.key && Objects.isEqual(modifierKeys, keystroke.modifiers, {ignoreArrayOrder: true});
}

/**
 * Returns the pressed modifier keys (ctrl, shift, alt, meta) as array items.
 */
function getModifierState(event: KeyboardEvent): string[] {
  const modifierState: string[] = [];
  if (event.ctrlKey) {
    modifierState.push('ctrl');
  }
  if (event.shiftKey) {
    modifierState.push('shift');
  }
  if (event.altKey) {
    modifierState.push('alt');
  }
  if (event.metaKey) {
    modifierState.push('meta');
  }
  return modifierState;
}

export interface SciMenuAcceleratorOptions {
  target?: Element;
  context?: Map<string, unknown>;
  injector?: Injector;
  metadata?: {[key: string]: unknown};
}

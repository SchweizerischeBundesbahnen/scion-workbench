/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import CustomMatcherResult = jasmine.CustomMatcherResult;
import CustomAsyncMatcher = jasmine.CustomAsyncMatcher;
import {MenuGroupPO, MenuItemPO, MenuPO} from './menu.po';
import {Arrays} from '@scion/toolkit/util';
import {retryOnError} from './testing.util';
import {ExpectedSciMenu, ExpectedSciMenuGroup, ExpectedSciMenuItem, ExpectedSciMenuItemLike} from './expected-menu.model';
import {assertToolbarItems} from './to-equal-toolbar.matcher';

/**
 * Provides the implementation of {@link CustomAsyncMatcherFactories#toEqualMenu}.
 */
export const toEqualMenuCustomMatcher: jasmine.CustomAsyncMatcherFactories = {
  toEqualMenu: (): CustomAsyncMatcher => {
    return {
      async compare(actual: MenuPO, expected: ExpectedSciMenuItemLike[], failOutput: string | undefined): Promise<CustomMatcherResult> {
        try {
          await retryOnError(() => {
            assertMenu(expected, actual);
          });

          return pass();
        }
        catch (error) {
          return fail(error instanceof Error ? error.message : `${error}`);
        }

        function pass(): CustomMatcherResult {
          return {pass: true};
        }

        function fail(message: string): CustomMatcherResult {
          return {pass: false, message: message.concat(failOutput ? ` (${failOutput})` : '')};
        }
      },
    };
  },
};

function assertMenu(expected: ExpectedSciMenuItemLike[], actual: MenuPO): void {
  assertMenuItems(expected, actual.items());
}

function assertMenuItems(expected: ExpectedSciMenuItemLike[], items: Array<MenuItemPO | MenuGroupPO>): void {
  if (items.length !== expected.length) {
    throw Error(`[DOMAssertError] Expected menu item count to be ${expected.length}, but was ${items.length}`);
  }

  expected.forEach((item, index) => {
    const actual = items[index]!;
    switch (item.type) {
      case 'menu-item':
        assertMenuItem(item, actual as MenuItemPO);
        return;
      case 'menu':
        assertSubMenu(item, actual as MenuItemPO);
        return;
      case 'group':
        assertMenuGroup(item, actual as MenuGroupPO);
        return;
    }
  });
}

function assertMenuItem(expected: ExpectedSciMenuItem, actual: MenuItemPO): void {
  if (expected.icon !== undefined) {
    if (actual.icon !== expected.icon) {
      throw Error(`[DOMAssertError] Expected icon of menu item to be ${expected.icon}, but was ${actual.icon}`);
    }
  }

  if (expected.iconComponent !== undefined) {
    if (!actual.iconComponent(expected.iconComponent.selector)) {
      throw Error(`[DOMAssertError] Expected icon component to be present in the DOM, but is not. [selector=${expected.iconComponent.selector}]`);
    }
  }

  if (expected.label !== undefined) {
    if (actual.label !== expected.label) {
      throw Error(`[DOMAssertError] Expected label of menu item to be ${expected.label}, but was ${actual.label}`);
    }
  }

  if (expected.labelComponent !== undefined) {
    if (!actual.labelComponent(expected.labelComponent.selector)) {
      throw Error(`[DOMAssertError] Expected label component to be present in the DOM, but is not. [selector=${expected.labelComponent.selector}]`);
    }
  }

  if (expected.tooltip !== undefined) {
    if (actual.nativeElement.title !== expected.tooltip) {
      throw Error(`[DOMAssertError] Expected tooltip of menu item to be ${expected.tooltip}, but was ${actual.nativeElement.title}`);
    }
  }

  if (expected.disabled !== undefined) {
    if (actual.nativeElement.disabled !== expected.disabled) {
      throw Error(`[DOMAssertError] Expected disabled state of menu item to be ${expected.disabled}, but was ${actual.nativeElement.disabled}`);
    }
  }

  if (expected.checked !== undefined) {
    if (actual.checked !== expected.checked) {
      throw Error(`[DOMAssertError] Expected checked state of menu item to be ${expected.checked}, but was ${actual.checked}`);
    }
  }

  if (expected.active !== undefined) {
    if (actual.active !== expected.active) {
      throw Error(`[DOMAssertError] Expected active state of menu item to be ${expected.active}, but was ${actual.active}`);
    }
  }

  if (expected.actions !== undefined) {
    assertToolbarItems(expected.actions, actual.actions.items());
  }

  if (expected.attributes !== undefined) {
    Object.entries(expected.attributes).forEach(([key, value]) => {
      if (actual.debugElement.attributes[key] !== value) {
        throw Error(`[DOMAssertError] Attributes of menu item do not not match [expected={key=${key}, value=${value}}, actual=${[Object.entries(actual.debugElement.attributes).map((key, value) => `${key}=${value}`).join(' ')]}]`);
      }
    });
  }

  if (expected.cssClass !== undefined) {
    Arrays.coerce(expected.cssClass).forEach(cssClass => {
      if (!actual.nativeElement.classList.contains(cssClass)) {
        throw Error(`[DOMAssertError] Css classes of menu item do not not match [expected=${expected.cssClass}, actual=${actual.nativeElement.classList}]`);
      }
    });
  }
}

function assertSubMenu(expected: ExpectedSciMenu, actual: MenuItemPO): void {
  if (expected.icon !== undefined) {
    if (actual.icon !== expected.icon) {
      throw Error(`[DOMAssertError] Expected icon of menu item to be ${expected.icon}, but was ${actual.icon}`);
    }
  }

  if (expected.iconComponent !== undefined) {
    if (!actual.iconComponent(expected.iconComponent.selector)) {
      throw Error(`[DOMAssertError] Expected icon component to be present in the DOM, but is not. [selector=${expected.iconComponent.selector}]`);
    }
  }

  if (expected.label !== undefined) {
    if (actual.label !== expected.label) {
      throw Error(`[DOMAssertError] Expected label of menu item to be ${expected.label}, but was ${actual.label}`);
    }
  }

  if (expected.labelComponent !== undefined) {
    if (!actual.labelComponent(expected.labelComponent.selector)) {
      throw Error(`[DOMAssertError] Expected label component to be present in the DOM, but is not. [selector=${expected.labelComponent.selector}]`);
    }
  }

  if (expected.tooltip !== undefined) {
    if (actual.nativeElement.title !== expected.tooltip) {
      throw Error(`[DOMAssertError] Expected tooltip of menu item to be ${expected.tooltip}, but was ${actual.nativeElement.title}`);
    }
  }

  if (expected.disabled !== undefined) {
    if (actual.nativeElement.disabled !== expected.disabled) {
      throw Error(`[DOMAssertError] Expected disabled state of menu item to be ${expected.disabled}, but was ${actual.nativeElement.disabled}`);
    }
  }

  if (expected.cssClass !== undefined) {
    Arrays.coerce(expected.cssClass).forEach(cssClass => {
      if (!actual.nativeElement.classList.contains(cssClass)) {
        throw Error(`[DOMAssertError] Css classes of menu item do not not match [expected=${expected.cssClass}, actual=${actual.nativeElement.classList}]`);
      }
    });
  }

  expected.children && assertMenuItems(expected.children, actual.subMenu.items());
}

function assertMenuGroup(expected: ExpectedSciMenuGroup, actual: MenuGroupPO): void {
  if (expected.label !== undefined) {
    if (actual.label !== expected.label) {
      throw Error(`[DOMAssertError] Expected label of group to be ${expected.label}, but was ${actual.label}`);
    }
  }

  if (expected.collapsible !== undefined) {
    if (actual.collapsed !== expected.collapsible.collapsed) {
      throw Error(`[DOMAssertError] Expected collapsed state of group to be ${expected.collapsible.collapsed}, but was ${actual.collapsed}`);
    }
  }

  if (expected.actions !== undefined) {
    assertToolbarItems(expected.actions, actual.actions.items());
  }

  if (expected.cssClass !== undefined) {
    Arrays.coerce(expected.cssClass).forEach(cssClass => {
      if (!actual.nativeElement.classList.contains(cssClass)) {
        throw Error(`[DOMAssertError] Css classes of menu group do not not match [expected=${expected.cssClass}, actual=${actual.nativeElement.classList}]`);
      }
    });
  }

  expected.children && assertMenuItems(expected.children, actual.items());
}

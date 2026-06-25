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
import {ToolbarButtonPO, ToolbarControlPO, ToolbarGroupPO, ToolbarPO, ToolbarSplitButtonPO} from './toolbar.po';
import {Arrays} from '@scion/toolkit/util';
import {retryOnError} from './testing.util';
import {ExpectedSciMenu, ExpectedSciMenuGroup, ExpectedSciMenuItem, ExpectedSciMenuItemLike} from './expected-menu.model';

/**
 * Provides the implementation of {@link CustomAsyncMatcherFactories#toEqualToolbar}.
 */
export const toEqualToolbarCustomMatcher: jasmine.CustomAsyncMatcherFactories = {
  toEqualToolbar: (): CustomAsyncMatcher => {
    return {
      async compare(actual: ToolbarPO, expected: ExpectedSciMenuItemLike[], failOutput: string | undefined): Promise<CustomMatcherResult> {
        try {
          await retryOnError(() => {
            assertToolbar(expected, actual);
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

export function assertToolbar(expected: ExpectedSciMenuItemLike[], toolbar: ToolbarPO): void {
  assertToolbarItems(expected, toolbar.items());
}

export function assertToolbarItems(expected: ExpectedSciMenuItemLike[] | undefined, items: Array<ToolbarButtonPO | ToolbarSplitButtonPO | ToolbarControlPO | ToolbarGroupPO>): void {
  if (expected === undefined) {
    return;
  }

  if (items.length !== expected.length) {
    throw Error(`[DOMAssertError] Expected toolbar item count to be ${expected.length}, but was ${items.length}`);
  }

  expected.forEach((item, index) => {
    const actual = items[index]!;
    switch (item.type) {
      case 'menu-item':
        assertToolbarItem(item, actual as ToolbarButtonPO | ToolbarSplitButtonPO | ToolbarControlPO);
        return;
      case 'menu':
        assertToolbarMenuButton(item, actual as ToolbarButtonPO);
        return;
      case 'group':
        assertToolbarGroup(item, actual as ToolbarGroupPO);
        return;
    }
  });
}

function assertToolbarItem(expected: ExpectedSciMenuItem, actual: ToolbarButtonPO | ToolbarSplitButtonPO | ToolbarControlPO): void {
  actual = actual instanceof ToolbarSplitButtonPO ? actual.primaryButton : actual;

  if (actual instanceof ToolbarButtonPO) {
    if (expected.icon !== undefined) {
      if (actual.icon !== expected.icon) {
        throw Error(`[DOMAssertError] Expected icon of toolbar item to be ${expected.icon}, but was ${actual.icon}`);
      }
    }

    if (expected.iconComponent !== undefined) {
      if (!actual.iconComponent(expected.iconComponent.selector)) {
        throw Error(`[DOMAssertError] Expected icon component to be present in the DOM, but is not. [selector=${expected.iconComponent.selector}]`);
      }
    }

    if (expected.label !== undefined) {
      if (actual.label !== expected.label) {
        throw Error(`[DOMAssertError] Expected label of toolbar item to be ${expected.label}, but was ${actual.label}`);
      }
    }

    if (expected.labelComponent !== undefined) {
      if (!actual.labelComponent(expected.labelComponent.selector)) {
        throw Error(`[DOMAssertError] Expected label component to be present in the DOM, but is not. [selector=${expected.labelComponent.selector}]`);
      }
    }

    if (expected.checked !== undefined) {
      if (actual.checked !== expected.checked) {
        throw Error(`[DOMAssertError] Expected checked state of toolbar item to be ${expected.checked}, but was ${actual.checked}`);
      }
    }
  }

  if (expected.tooltip !== undefined) {
    if (actual.nativeElement.title !== expected.tooltip) {
      throw Error(`[DOMAssertError] Expected tooltip of toolbar item to be ${expected.tooltip}, but was ${actual.nativeElement.title}`);
    }
  }

  if (expected.cssClass !== undefined) {
    Arrays.coerce(expected.cssClass).forEach(cssClass => {
      if (!actual.nativeElement.classList.contains(cssClass)) {
        throw Error(`[DOMAssertError] Css classes of toolbar item do not not match [expected=${expected.cssClass}, actual=${actual.nativeElement.classList}]`);
      }
    });
  }

  if (expected.attributes !== undefined) {
    Object.entries(expected.attributes).forEach(([key, value]) => {
      if (actual.debugElement.attributes[key] !== value) {
        throw Error(`[DOMAssertError] Attributes of toolbar item do not not match [expected={key=${key}, value=${value}}, actual=${[Object.entries(actual.debugElement.attributes).map((key, value) => `${key}="${value}"`).join(' ')]}]`);
      }
    });
  }

  if (actual instanceof ToolbarControlPO) {
    if (expected.control !== undefined) {
      if (!actual.component(expected.control.selector)) {
        throw Error(`[DOMAssertError] Expected toolbar control to be ${expected.control.selector} but was not.`);
      }
    }
  }

  if (actual.nativeElement instanceof HTMLButtonElement) {
    if (expected.disabled !== undefined) {
      if (actual.nativeElement.disabled !== expected.disabled) {
        throw Error(`[DOMAssertError] Expected disabled state of toolbar item to be ${expected.disabled}, but was ${actual.nativeElement.disabled}`);
      }
    }
  }
}

function assertToolbarMenuButton(expected: ExpectedSciMenu, actual: ToolbarButtonPO): void {
  if (expected.icon !== undefined) {
    if (actual.icon !== expected.icon) {
      throw Error(`[DOMAssertError] Icon of menu item does not match [expected=${expected.icon}, actual=${actual.icon}]`);
    }
  }

  if (expected.iconComponent !== undefined) {
    if (!actual.iconComponent(expected.iconComponent.selector)) {
      throw Error(`[DOMAssertError] Expected icon component to be present in the DOM, but is not. [selector=${expected.iconComponent.selector}]`);
    }
  }

  if (expected.label !== undefined) {
    if (actual.label !== expected.label) {
      throw Error(`[DOMAssertError] Expected label text to match, but did not. [expected=${expected.label}, actual=${(actual.label)}]`);
    }
  }

  if (expected.labelComponent !== undefined) {
    if (!actual.labelComponent(expected.labelComponent.selector)) {
      throw Error(`[DOMAssertError] Expected label component to be present in the DOM, but is not. [selector=${expected.labelComponent.selector}]`);
    }
  }

  if (expected.tooltip !== undefined) {
    if (actual.nativeElement.title !== expected.tooltip) {
      throw Error(`[DOMAssertError] Expected tooltip of toolbar item to be ${expected.tooltip}, but was ${actual.nativeElement.title}`);
    }
  }

  if (expected.disabled !== undefined) {
    if (actual.nativeElement.disabled !== expected.disabled) {
      throw Error(`[DOMAssertError] Expected disabled state of toolbar item to be ${expected.disabled}, but was ${actual.nativeElement.disabled}`);
    }
  }

  if (expected.visualMenuIndicator !== undefined) {
    if (actual.visualMenuIndicator !== expected.visualMenuIndicator) {
      throw Error(`[DOMAssertError] Expected visual menu indicator of toolbar to be ${expected.visualMenuIndicator}, but was ${actual.visualMenuIndicator}`);
    }
  }

  if (expected.cssClass !== undefined) {
    Arrays.coerce(expected.cssClass).forEach(cssClass => {
      if (!actual.nativeElement.classList.contains(cssClass)) {
        throw Error(`[DOMAssertError] Css classes of toolbar item do not not match [expected=${expected.cssClass}, actual=${actual.nativeElement.classList}]`);
      }
    });
  }

  if (expected.attributes !== undefined) {
    Object.entries(expected.attributes).forEach(([key, value]) => {
      if (actual.debugElement.attributes[key] !== value) {
        throw Error(`[DOMAssertError] Attributes of toolbar item do not not match [expected={key=${key}, value=${value}}, actual=${[Object.entries(actual.debugElement.attributes).map((key, value) => `${key}="${value}"`).join(' ')]}]`);
      }
    });
  }
}

function assertToolbarGroup(expected: ExpectedSciMenuGroup, actual: ToolbarGroupPO): void {
  if (expected.cssClass !== undefined) {
    Arrays.coerce(expected.cssClass).forEach(cssClass => {
      if (!actual.nativeElement?.classList.contains(cssClass)) {
        throw Error(`[DOMAssertError] Css classes of toolbar item do not not match [expected=${expected.cssClass}, actual=${actual.nativeElement!.classList}]`);
      }
    });
  }

  assertToolbarItems(expected.children, actual.items());
}

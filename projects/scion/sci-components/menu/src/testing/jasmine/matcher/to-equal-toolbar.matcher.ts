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
import {By} from '@angular/platform-browser';
import {ExpectedSciMenu, ExpectedSciMenuGroup, ExpectedSciMenuItem, ExpectedSciMenuItemLike} from './to-equal-menu.matcher';
import {retryOnError} from '../../../../../common/src/testing/testing.util';
import {MenuGroupPO, MenuItemPO, ToolbarPO} from '../../../toolbar/toolbar.po';

/**
 * Provides the implementation of {@link CustomAsyncMatchers#toEqualToolbar}.
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
  expectToolbarItems(expected, toolbar.items);
}

function expectToolbarItems(expected: ExpectedSciMenuItemLike[] | undefined, items: Array<MenuItemPO | MenuGroupPO>): void {
  if (expected === undefined) {
    return;
  }

  if (items.length !== expected.length) {
    throw Error(`[DOMAssertError] Toolbar item count does not match expected [expected=${expected.length}, actual=${items.length}]`);
  }

  expected.forEach((item, index) => {
    const actual = items[index]!;
    switch (item.type) {
      case 'menu-item':
        assertMenuItem(item, actual as MenuItemPO);
        return;
      case 'menu':
        assertMenu(item, actual as MenuItemPO);
        return;
      case 'group':
        assertMenuGroup(item, actual as MenuGroupPO);
        return;
    }
  });
}

function assertMenuItem(item: ExpectedSciMenuItem, actual: MenuItemPO): void {
  const debugElement = actual.debugElement;
  const nativeElement = actual.nativeElement;

  if (item.iconLigature !== undefined) {
    const iconHtmlElement = debugElement.query(By.css('sci-icon')).nativeElement;
    if (iconHtmlElement.textContent !== item.iconLigature) {
      throw Error(`[DOMAssertError] Icon of toolbar item does not match [expected=${item.iconLigature}, actual=${iconHtmlElement.textContent}]`);
    }
  }

  if (item.iconComponent !== undefined) {
    const iconComponentDebugElement = debugElement.query(By.css('span.icon')).query(By.css(item.iconComponent.selector));
    if (!iconComponentDebugElement) {
      throw Error(`[DOMAssertError] Expected icon component to be present in the DOM, but is not. [selector=${item.iconComponent.selector}]`);
    }
  }

  if (item.labelText !== undefined) {
    const labelHtmlElement = debugElement.query(By.css('span.label')).nativeElement;
    if (labelHtmlElement.innerText != item.labelText) {
      throw Error(`[DOMAssertError] Expected label text to match, but did not. [expected=${item.labelText}, actual=${labelHtmlElement.innerText}]`);
    }
  }

  if (item.labelComponent !== undefined) {
    const labelComponentDebugElement = debugElement.query(By.css('span.label')).query(By.css(item.labelComponent.selector));
    if (!labelComponentDebugElement) {
      throw Error(`[DOMAssertError] Expected label component to be present in the DOM, but is not. [selector=${item.labelComponent.selector}]`);
    }
  }

  if (item.tooltip !== undefined) {
    if (nativeElement.title !== item.tooltip) {
      throw Error(`[DOMAssertError] Tooltip of toolbar item does not match [expected=${item.tooltip}, actual=${nativeElement.title}]`);
    }
  }

  if (item.disabled !== undefined) {
    if (nativeElement.disabled !== item.disabled) {
      throw Error(`[DOMAssertError] Disabled state of toolbar item does not match [expected=${item.disabled}, actual=${nativeElement.disabled}]`);
    }
  }

  if (item.checked !== undefined) {
    const actualChecked = nativeElement.classList.contains('checked');
    if (actualChecked !== item.checked) {
      throw Error(`[DOMAssertError] Checked state of toolbar item does not match [expected=${item.checked}, actual=${actualChecked}]`);
    }
  }

  if (item.attributes !== undefined) {
    Object.entries(item.attributes).forEach(([key, value]) => {
      if (debugElement.attributes[key] !== value) {
        throw Error(`[DOMAssertError] Attributes of toolbar item do not not match [expected={key=${key}, value=${value}}, actual=${[...Object.entries(debugElement.attributes).map((key, value) => `${key}="${value}"`).join(' ')]}]`);
      }
    })
  }

  if (item.cssClass !== undefined) {
    item.cssClass.forEach(cssClass => {
      if (!nativeElement.classList.contains(cssClass)) {
        throw Error(`[DOMAssertError] Css classes of toolbar item do not not match [expected=${item.cssClass}, actual=${nativeElement.classList}]`);
      }
    });
  }
}

function assertMenu(item: ExpectedSciMenu, actual: MenuItemPO): void {
  const debugElement = actual.debugElement;
  const nativeElement = actual.nativeElement;

  if (item.iconLigature !== undefined) {
    const iconHtmlElement = debugElement.query(By.css('sci-icon')).nativeElement;
    if (iconHtmlElement.textContent !== item.iconLigature) {
      throw Error(`[DOMAssertError] Icon of toolbar item does not match [expected=${item.iconLigature}, actual=${iconHtmlElement.textContent}]`);
    }
  }

  if (item.iconComponent !== undefined) {
    const iconComponentDebugElement = debugElement.query(By.css('span.icon')).query(By.css(item.iconComponent.selector));
    if (!iconComponentDebugElement) {
      throw Error(`[DOMAssertError] Expected icon component to be present in the DOM, but is not. [selector=${item.iconComponent.selector}]`);
    }
  }

  if (item.labelText !== undefined) {
    const labelHtmlElement = debugElement.query(By.css('span.label')).nativeElement;
    if (labelHtmlElement.innerText != item.labelText) {
      throw Error(`[DOMAssertError] Label text of toolbar item does not match. [expected=${item.labelText}, actual=${labelHtmlElement.innerText}]`);
    }
  }

  if (item.labelComponent !== undefined) {
    const labelComponentDebugElement = debugElement.query(By.css('span.label')).query(By.css(item.labelComponent.selector));
    if (!labelComponentDebugElement) {
      throw Error(`[DOMAssertError] Expected label component to be present in the DOM, but is not. [selector=${item.labelComponent.selector}]`);
    }
  }

  if (item.tooltip !== undefined) {
    if (nativeElement.title !== item.tooltip) {
      throw Error(`[DOMAssertError] Tooltip of toolbar item does not match [expected=${item.tooltip}, actual=${nativeElement.title}]`);
    }
  }

  if (item.disabled !== undefined) {
    if (nativeElement.disabled !== item.disabled) {
      throw Error(`[DOMAssertError] Disabled state of toolbar item does not match [expected=${item.disabled}, actual=${nativeElement.disabled}]`);
    }
  }

  if (item.visualMenuHint !== undefined) {
    const actualVisualMenuHint = nativeElement.classList.contains('visual-menu-hint');
    if (actualVisualMenuHint !== item.visualMenuHint) {
      throw Error(`[DOMAssertError] Visual menu hint of toolbar item does not match. [expected=${item.visualMenuHint}, actual=${actualVisualMenuHint}]`);
    }
  }

  if (item.cssClass !== undefined) {
    item.cssClass.forEach(cssClass => {
      if (!nativeElement.classList.contains(cssClass)) {
        throw Error(`[DOMAssertError] Css classes of toolbar item do not not match [expected=${item.cssClass}, actual=${nativeElement.classList}]`);
      }
    });
  }
}

function assertMenuGroup(item: ExpectedSciMenuGroup, actual: MenuGroupPO): void {
  const nativeElement = actual.nativeElement;

  if (item.cssClass !== undefined) {
    item.cssClass.forEach(cssClass => {
      if (!nativeElement.classList.contains(cssClass)) {
        throw Error(`[DOMAssertError] Css classes of toolbar item do not not match [expected=${item.cssClass}, actual=${nativeElement.classList}]`);
      }
    });
  }

  expectToolbarItems(item.children, actual.items);
}

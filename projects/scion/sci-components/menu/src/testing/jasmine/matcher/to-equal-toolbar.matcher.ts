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
import {DebugElement} from '@angular/core';
import {ComponentFixture} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {ExpectedSciMenu, ExpectedSciMenuGroup, ExpectedSciMenuItem, ExpectedSciMenuItemLike} from './to-equal-menu.matcher';
import {retryOnError} from '../../../../../common/src/testing/testing.util';

/**
 * Provides the implementation of {@link CustomAsyncMatchers#toEqualToolbar}.
 */
export const toEqualToolbarCustomMatcher: jasmine.CustomAsyncMatcherFactories = {
  toEqualToolbar: (): CustomAsyncMatcher => {
    return {
      async compare(actual: ComponentFixture<unknown> | DebugElement | unknown, expected: ExpectedSciMenuItemLike[], failOutput: string | undefined): Promise<CustomMatcherResult> {
        try {
          // Expect actual to be of the expected type.
          if (!(actual instanceof ComponentFixture) && !(actual instanceof DebugElement)) {
            return fail(`Expected actual to be of type 'ComponentFixture', or 'DebugElement', but was '${actual?.constructor?.name}'`);
          }

          const debugElement = actual instanceof ComponentFixture ? actual.debugElement : actual;

          await retryOnError(() => {
            assertToolbar(expected, debugElement);
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

export function assertToolbar(expected: ExpectedSciMenuItemLike[], debugElement: DebugElement): void {
  const groupDebugElement = debugElement.query(By.css('sci-toolbar-group'));
  expectToolbarGroup(expected, groupDebugElement);
}

function expectToolbarGroup(expected: ExpectedSciMenuItemLike[] | undefined, debugElement: DebugElement): void {
  if (expected === undefined) {
    return;
  }

  // Find direct children.
  const childrenDebugElements = debugElement.children;

  // Assert toolbar item count.
  if (childrenDebugElements.length !== expected.length) {
    throw Error(`[DOMAssertError] Toolbar item count does not match expected [expected=${expected.length}, actual=${childrenDebugElements.length}]`);
  }

  expected.forEach((item, index) => {
    const actual = childrenDebugElements[index]!;
    switch (item.type) {
      case 'menu-item':
        assertMenuItem(item, actual);
        return;
      case 'menu':
        assertMenu(item, actual);
        return;
      case 'group':
        assertMenuGroup(item, actual);
        return;
    }
  });
}

function assertMenuItem(item: ExpectedSciMenuItem, actual: DebugElement): void {
  const toolbarItemNativeElement = actual.nativeElement as HTMLButtonElement;

  if (item.iconLigature !== undefined) {
    const iconHtmlElement = actual.query(By.css('sci-icon')).nativeElement;
    if (iconHtmlElement.textContent !== item.iconLigature) {
      throw Error(`[DOMAssertError] Icon of toolbar item does not match [expected=${item.iconLigature}, actual=${iconHtmlElement.textContent}]`);
    }
  }

  if (item.iconComponent !== undefined) {
    const iconComponentDebugElement = actual.query(By.css('span.icon')).query(By.css(item.iconComponent.selector));
    if (!iconComponentDebugElement) {
      throw Error(`[DOMAssertError] Expected icon component to be present in the DOM, but is not. [selector=${item.iconComponent.selector}]`);
    }
  }

  if (item.labelText !== undefined) {
    const labelHtmlElement = actual.query(By.css('span.label')).nativeElement;
    if (labelHtmlElement.innerText != item.labelText) {
      throw Error(`[DOMAssertError] Expected label text to match, but did not. [expected=${item.labelText}, actual=${labelHtmlElement.innerText}]`);
    }
  }

  if (item.labelComponent !== undefined) {
    const labelComponentDebugElement = actual.query(By.css('span.label')).query(By.css(item.labelComponent.selector));
    if (!labelComponentDebugElement) {
      throw Error(`[DOMAssertError] Expected label component to be present in the DOM, but is not. [selector=${item.labelComponent.selector}]`);
    }
  }

  if (item.tooltip !== undefined) {
    if (toolbarItemNativeElement.title !== item.tooltip) {
      throw Error(`[DOMAssertError] Tooltip of toolbar item does not match [expected=${item.tooltip}, actual=${toolbarItemNativeElement.title}]`);
    }
  }

  if (item.disabled !== undefined) {
    if (toolbarItemNativeElement.disabled !== item.disabled) {
      throw Error(`[DOMAssertError] Disabled state of toolbar item does not match [expected=${item.disabled}, actual=${toolbarItemNativeElement.disabled}]`);
    }
  }

  if (item.checked !== undefined) {
    const actualChecked = toolbarItemNativeElement.classList.contains('checked');
    if (actualChecked !== item.checked) {
      throw Error(`[DOMAssertError] Checked state of toolbar item does not match [expected=${item.checked}, actual=${actualChecked}]`);
    }
  }

  if (item.attributes !== undefined) {
    Object.entries(item.attributes).forEach(([key, value]) => {
      if (actual.attributes[key] !== value) {
        throw Error(`[DOMAssertError] Attributes of toolbar item do not not match [expected={key=${key}, value=${value}}, actual=${[...Object.entries(actual.attributes).map((key, value) => `${key}="${value}"`).join(' ')]}]`);
      }
    })
  }

  if (item.cssClass !== undefined) {
    item.cssClass.forEach(cssClass => {
      if (!toolbarItemNativeElement.classList.contains(cssClass)) {
        throw Error(`[DOMAssertError] Css classes of toolbar item do not not match [expected=${item.cssClass}, actual=${toolbarItemNativeElement.classList}]`);
      }
    });
  }
}

function assertMenu(item: ExpectedSciMenu, actual: DebugElement): void {
  const toolbarItemNativeElement = actual.nativeElement as HTMLButtonElement;

  if (item.iconLigature !== undefined) {
    const iconHtmlElement = actual.query(By.css('sci-icon')).nativeElement;
    if (iconHtmlElement.textContent !== item.iconLigature) {
      throw Error(`[DOMAssertError] Icon of toolbar item does not match [expected=${item.iconLigature}, actual=${iconHtmlElement.textContent}]`);
    }
  }

  if (item.iconComponent !== undefined) {
    const iconComponentDebugElement = actual.query(By.css('span.icon')).query(By.css(item.iconComponent.selector));
    if (!iconComponentDebugElement) {
      throw Error(`[DOMAssertError] Expected icon component to be present in the DOM, but is not. [selector=${item.iconComponent.selector}]`);
    }
  }

  if (item.labelText !== undefined) {
    const labelHtmlElement = actual.query(By.css('span.label')).nativeElement;
    if (labelHtmlElement.innerText != item.labelText) {
      throw Error(`[DOMAssertError] Label text of toolbar item does not match. [expected=${item.labelText}, actual=${labelHtmlElement.innerText}]`);
    }
  }

  if (item.labelComponent !== undefined) {
    const labelComponentDebugElement = actual.query(By.css('span.label')).query(By.css(item.labelComponent.selector));
    if (!labelComponentDebugElement) {
      throw Error(`[DOMAssertError] Expected label component to be present in the DOM, but is not. [selector=${item.labelComponent.selector}]`);
    }
  }

  if (item.tooltip !== undefined) {
    if (toolbarItemNativeElement.title !== item.tooltip) {
      throw Error(`[DOMAssertError] Tooltip of toolbar item does not match [expected=${item.tooltip}, actual=${toolbarItemNativeElement.title}]`);
    }
  }

  if (item.disabled !== undefined) {
    if (toolbarItemNativeElement.disabled !== item.disabled) {
      throw Error(`[DOMAssertError] Disabled state of toolbar item does not match [expected=${item.disabled}, actual=${toolbarItemNativeElement.disabled}]`);
    }
  }

  if (item.visualMenuHint !== undefined) {
    const actualVisualMenuHint = toolbarItemNativeElement.classList.contains('visual-menu-hint');
    if (actualVisualMenuHint !== item.visualMenuHint) {
      throw Error(`[DOMAssertError] Visual menu hint of toolbar item does not match. [expected=${item.visualMenuHint}, actual=${actualVisualMenuHint}]`);
    }
  }

  if (item.cssClass !== undefined) {
    item.cssClass.forEach(cssClass => {
      if (!toolbarItemNativeElement.classList.contains(cssClass)) {
        throw Error(`[DOMAssertError] Css classes of toolbar item do not not match [expected=${item.cssClass}, actual=${toolbarItemNativeElement.classList}]`);
      }
    });
  }
}

function assertMenuGroup(item: ExpectedSciMenuGroup, actual: DebugElement): void {
  const groupNativeElement = actual.nativeElement;

  if (item.cssClass !== undefined) {
    item.cssClass.forEach(cssClass => {
      if (!groupNativeElement.classList.contains(cssClass)) {
        throw Error(`[DOMAssertError] Css classes of toolbar item do not not match [expected=${item.cssClass}, actual=${groupNativeElement.classList}]`);
      }
    });
  }

  expectToolbarGroup(item.children, actual);
}

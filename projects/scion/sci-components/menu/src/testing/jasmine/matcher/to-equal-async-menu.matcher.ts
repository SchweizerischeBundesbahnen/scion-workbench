/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import CustomMatcherResult = jasmine.CustomMatcherResult;
import CustomAsyncMatcher = jasmine.CustomAsyncMatcher;
import {Binding, DebugElement} from '@angular/core';
import {ComponentFixture} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {SciMenuContributionPositionLike} from '@scion/sci-components/menu';
import {Translatable} from '@scion/sci-components/text';

/**
 * Provides the implementation of {@link CustomMatchers#toEqualMenu}.
 */
export const toEqualAsyncMenuCustomMatcher: jasmine.CustomAsyncMatcherFactories = {
  toEqualMenu: (): CustomAsyncMatcher => {
    return {
      async compare(actual: ComponentFixture<unknown> | unknown, expected: ExpectedSciMenuItemLike[], failOutput: string | undefined): Promise<CustomMatcherResult> {
        // Expect actual to be of the expected type.
        if (!(actual instanceof ComponentFixture)) {
          return fail(`Expected actual to be of type 'ComponentFixture' but was '${actual?.constructor?.name}'`);
        }

        const debugElement = actual.debugElement;

        const timeout = 1000;
        const interval = 10;
        const start = performance.now();

        let lastError = 'Unknown failure';

        while (performance.now() - start < timeout) {
          try {
            // actual.detectChanges();

            assertMenu(expected, debugElement);

            return pass();
          }
          catch (error) {
            lastError = error instanceof Error ? error.message : String(error);
          }

          await delay(interval);
        }

        return fail(`${lastError} (timed out after ${timeout}ms)`);

        function pass(): CustomMatcherResult {
          return {pass: true};
        }

        function fail(message: string): CustomMatcherResult {
          return {pass: false, message: message.concat(failOutput ? ` (${failOutput})` : '')};
        }

        function delay(ms: number): Promise<void> {
          return new Promise(resolve => setTimeout(resolve, ms));
        }
      },
    };
  },
};

function assertMenu(expected: ExpectedSciMenuItemLike[], debugElement: DebugElement): void {
  const menuDebugElement = debugElement.parent!.query(By.css('sci-menu'));
  expectSubMenu(expected, menuDebugElement);
}

function expectSubMenu(expected: ExpectedSciMenuItemLike[] | undefined, debugElement: DebugElement): void {
  if (expected === undefined) {
    return;
  }

  // Find direct children.
  const childrenDebugElements = debugElement.children.filter(child => child.nativeElement.classList.contains('e2e-menu-item'));
  // const childrenDebugElements = debugElement.children
  //   .filter(child => child.nativeElement.tagName.toLowerCase() !== 'sci-menu') // Exclude sci-menu because node is on the same level but not relevant for assertion.
  //   .filter(child => child.nativeElement.tagName.toLowerCase() !== 'header' && !child.nativeElement.classList.contains('group-header'));

  if (expected.length === 0) {
    const noItemsDebugElement = debugElement.query(By.css('div.message.no-items'));
    if (!noItemsDebugElement) {
      throw Error(`[DOMAssertError] Expected "No items found." to show, but did not.`);
    }
  }
  else if (childrenDebugElements.length !== expected.length) {
    throw Error(`[DOMAssertError] Menu item count does not match expected [expected=${expected.length}, actual=${childrenDebugElements.length}]`);
  }

  expected.forEach((item, index) => {
    const actual = childrenDebugElements[index]!;
    switch (item.type) {
      case 'menu-item':
        assertMenuItem(item, actual);
        return;
      case 'menu':
        assertSubMenu(item, actual);
        return;
      case 'group':
        assertMenuGroup(item, actual);
        return;
    }
  });
}

function assertMenuItem(item: ExpectedSciMenuItem, actual: DebugElement): void {
  const menuItemNativeElement = actual.nativeElement;

  if (item.iconLigature !== undefined) {
    const iconHtmlElement = actual.query(By.css('sci-icon')).nativeElement;
    if (iconHtmlElement.innerText !== item.iconLigature) {
      throw Error(`[DOMAssertError] Icon of menu item does not match [expected=${item.iconLigature}, actual=${iconHtmlElement.innerText}]`);
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
    if (menuItemNativeElement.title !== item.tooltip) {
      throw Error(`[DOMAssertError] Tooltip of menu item does not match [expected=${item.tooltip}, actual=${menuItemNativeElement.title}]`);
    }
  }

  if (item.disabled !== undefined) {
    if (menuItemNativeElement.disabled !== item.disabled) {
      throw Error(`[DOMAssertError] Disabled state of menu item does not match [expected=${item.disabled}, actual=${menuItemNativeElement.disabled}]`);
    }
  }

  if (item.checked !== undefined) {
    const actualChecked = menuItemNativeElement.classList.contains('checked');
    if (actualChecked !== item.checked) {
      throw Error(`[DOMAssertError] Checked state of menu item does not match [expected=${item.checked}, actual=${actualChecked}]`);
    }
  }

  if (item.attributes !== undefined) {
    Object.entries(item.attributes).forEach(([key, value]) => {
      if (actual.attributes[key] !== value) {
        throw Error(`[DOMAssertError] Attributes of menu item do not not match [expected={key=${key}, value=${value}}, actual=${[...Object.entries(actual.attributes).map((key, value) => `${key}="${value}"`).join(' ')]}]`);
      }
    })
  }

  if (item.cssClass !== undefined) {
    item.cssClass.forEach(cssClass => {
      if (!menuItemNativeElement.classList.contains(cssClass)) {
        throw Error(`[DOMAssertError] Css classes of menu item do not not match [expected=${item.cssClass}, actual=${menuItemNativeElement.classList}]`);
      }
    });
  }
}

function assertSubMenu(item: ExpectedSciMenu, actual: DebugElement): void {
  const menuItemNativeElement = actual.nativeElement as HTMLButtonElement;

  if (item.iconLigature !== undefined) {
    const iconHtmlElement = actual.query(By.css('sci-icon')).nativeElement;
    if (iconHtmlElement.innerText !== item.iconLigature) {
      throw Error(`[DOMAssertError] Icon of menu item does not match [expected=${item.iconLigature}, actual=${iconHtmlElement.innerText}]`);
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
    if (menuItemNativeElement.title !== item.tooltip) {
      throw Error(`[DOMAssertError] Tooltip of menu item does not match [expected=${item.tooltip}, actual=${menuItemNativeElement.title}]`);
    }
  }

  if (item.disabled !== undefined) {
    if (menuItemNativeElement.disabled !== item.disabled) {
      throw Error(`[DOMAssertError] Disabled state of menu item does not match [expected=${item.disabled}, actual=${menuItemNativeElement.disabled}]`);
    }
  }

  if (item.cssClass !== undefined) {
    item.cssClass.forEach(cssClass => {
      if (!menuItemNativeElement.classList.contains(cssClass)) {
        throw Error(`[DOMAssertError] Css classes of menu item do not not match [expected=${item.cssClass}, actual=${menuItemNativeElement.classList}]`);
      }
    });
  }

  const submenu = actual.parent!.query(By.css('sci-menu'));
  expectSubMenu(item.children, submenu);
}

function assertMenuGroup(item: ExpectedSciMenuGroup, actual: DebugElement): void {
  if (item.label !== undefined) {
    const labelHtmlElement = actual.query(By.css('header.group-header'))?.nativeElement ?? actual.query(By.css('button.group-header')).query(By.css('span.label')).nativeElement;
    if (labelHtmlElement.innerText != item.label) {
      throw Error(`[DOMAssertError] Expected label text to match, but did not. [expected=${item.label}, actual=${labelHtmlElement.innerText}]`);
    }
  }

  expectSubMenu(item.children, actual);
}

export interface ExpectedSciMenuItem {
  type: 'menu-item'
  name?: `menuitem:${string}`;
  labelText?: string;
  labelComponent?: ExpectedSciComponentDescriptor;
  iconLigature?: string;
  iconComponent?: ExpectedSciComponentDescriptor;
  control?: ExpectedSciComponentDescriptor; // only in toolbar, not menu
  tooltip?: string;
  accelerator?: string[];
  disabled?: boolean; // Consider renaming to enabled; https://www.electronjs.org/docs/latest/api/menu-item
  checked?: boolean;
  actions?: ExpectedSciMenuItemLike[];
  matchesFilter?: (filter: string) => boolean;
  cssClass?: string[];
  attributes?: {[name: string]: string};
  position?: SciMenuContributionPositionLike;
  onSelect?: () => Promise<boolean>;
}

export interface ExpectedSciMenu {
  type: 'menu'
  name?: `menu:${string}`;
  labelText?: string;
  labelComponent?: ExpectedSciComponentDescriptor;
  iconLigature?: string;
  iconComponent?: ExpectedSciComponentDescriptor;
  tooltip?: string;
  disabled?: boolean; // Consider renaming to enabled; https://www.electronjs.org/docs/latest/api/menu-item
  visualMenuHint?: boolean;
  position?: SciMenuContributionPositionLike;
  menu?: {
    width?: string;
    minWidth?: string;
    maxWidth?: string;
    maxHeight?: string;
    filter?: {placeholder?: Translatable; notFoundText?: Translatable};
  };
  cssClass?: string[];
  children?: ExpectedSciMenuItemLike[];
}

export interface ExpectedSciMenuGroup {
  type: 'group'
  name?: `menu:${string}` | `toolbar:${string}`;
  label?: string;
  collapsible?: {collapsed: boolean};
  position?: SciMenuContributionPositionLike;
  // disabled?: boolean; // Consider renaming to enabled; https://www.electronjs.org/docs/latest/api/menu-item should be asserted on children
  children?: ExpectedSciMenuItemLike[];
  cssClass?: string[];
}

export type ExpectedSciMenuItemLike = ExpectedSciMenuItem | ExpectedSciMenu | ExpectedSciMenuGroup;

interface ExpectedSciComponentDescriptor {
  selector: string;
  bindings?: Binding[];
  cssClass?: string | string[];
  attributes?: {[name: string]: string | undefined};
}

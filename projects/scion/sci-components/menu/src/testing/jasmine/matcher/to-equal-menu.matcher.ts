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
import {SciMenuContributionPositionLike} from '@scion/sci-components/menu';
import {Translatable} from '@scion/sci-components/text';
import {retryOnError} from '../../../../../common/src/testing/testing.util';
import {MenuGroupPO, MenuItemPO, MenuPO} from '../../../menu/menu.po';

/**
 * Provides the implementation of {@link CustomAsyncMatchers#toEqualMenu}.
 */
export const toEqualMenuCustomMatcher: jasmine.CustomAsyncMatcherFactories = {
  toEqualMenu: (): CustomAsyncMatcher => {
    return {
      async compare(actual: MenuPO, expected: ExpectedSciMenuItemLike[] | ExpectedSciMenuObject, failOutput: string | undefined): Promise<CustomMatcherResult> {
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
  notToBeAttached: (): CustomAsyncMatcher => {
    return {
      async compare(actual: MenuPO, failOutput: string | undefined): Promise<CustomMatcherResult> {
        try {
          await retryOnError(() => {
            if (actual.debugElement) {
              throw Error('[DOMAssertError Expected menu not to be attached, but was.');
            }
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

function assertMenu(expected: ExpectedSciMenuItemLike[] | ExpectedSciMenuObject, menu: MenuPO): void {
  const debugElement = menu.debugElement;

  if (!Array.isArray(expected)) {
    if (expected.notFoundText !== undefined) {
      const noItemsHtmlElement = debugElement.query(By.css('div.e2e-no-items')).nativeElement as HTMLElement;
      if (noItemsHtmlElement.textContent !== expected.notFoundText) {
        throw Error(`[DOMAssertError] Expected not found text to be '${expected.notFoundText}' but was ${noItemsHtmlElement.textContent}`);
      }
    }

    if (expected.filter !== undefined) {
      const filterHtmlElement = debugElement!.query(By.css('div.e2e-filter'))?.nativeElement;
      if (expected.filter === true) {
        if (!filterHtmlElement) {
          throw Error(`[DOMAssertError] Expected menu filter to be present in the DOM, but is not.`);
        }
      }
      else if (expected.filter === false) {
        if (filterHtmlElement) {
          throw Error(`[DOMAssertError] Expected menu filter not to be present in the DOM, but is.`);
        }
      }

      if (typeof expected.filter === 'object') {
        if (expected.filter.placeholder !== undefined) {
          const inputFilterHtmlElement = debugElement!.query(By.css('input.e2e-menu-filter-input'))!.nativeElement as HTMLInputElement;
          if (inputFilterHtmlElement.placeholder !== expected.filter.placeholder) {
            throw Error(`[DOMAssertError] Expected menu filter placeholder to be '${expected.filter.placeholder}' but was ${inputFilterHtmlElement.placeholder}`);
          }
        }
      }
    }

    if (expected.width !== undefined) {
      const menuWidth = (debugElement.nativeElement as HTMLElement).getBoundingClientRect().width;
      if (menuWidth !== expected.width) {
        throw Error(`[DOMAssertError] Menu width expected to be '${expected.width}' but was '${menuWidth}'`);
      }
    }

    if (expected.height !== undefined) {
      const menuHeight = (debugElement.nativeElement as HTMLElement).getBoundingClientRect().height;
      const viewportHeight = (debugElement.query(By.css('sci-viewport')).nativeElement as HTMLElement).getBoundingClientRect().height;
      if (viewportHeight !== expected.height) {
        throw Error(`[DOMAssertError] Menu viewport height expected to be '${expected.height}' but was '${viewportHeight}'`);
      }
      if (menuHeight < viewportHeight) {
        throw Error(`[DOMAssertError] Menu height expected to be greater than or equal to viewport height '${viewportHeight}' but was '${menuHeight}'`);
      }
    }
    return;
  }

  expectItems(expected, menu.items);
}

function expectItems(expected: ExpectedSciMenuItemLike[], items: Array<MenuItemPO | MenuGroupPO>): void {
  if (items.length !== expected.length) {
    throw Error(`[DOMAssertError] Menu item count does not match expected [expected=${expected.length}, actual=${items.length}]`);
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

function assertMenuItem(item: ExpectedSciMenuItem, actual: MenuItemPO): void {
  const debugElement = actual.debugElement;
  const nativeElement = actual.nativeElement;

  if (item.iconLigature !== undefined) {
    if (actual.iconLigature !== item.iconLigature) {
      throw Error(`[DOMAssertError] Icon of menu item does not match [expected=${item.iconLigature}, actual=${actual.iconLigature}]`);
    }
  }

  if (item.iconComponent !== undefined) {
    if (!actual.iconComponent(item.iconComponent.selector)) {
      throw Error(`[DOMAssertError] Expected icon component to be present in the DOM, but is not. [selector=${item.iconComponent.selector}]`);
    }
  }

  if (item.labelText !== undefined) {
    if (actual.labelText !== item.labelText) {
      throw Error(`[DOMAssertError] Expected label text to match, but did not. [expected=${item.labelText}, actual=${(actual.labelText)}]`);
    }
  }

  if (item.labelComponent !== undefined) {
    if (!actual.labelComponent(item.labelComponent.selector)) {
      throw Error(`[DOMAssertError] Expected label component to be present in the DOM, but is not. [selector=${item.labelComponent.selector}]`);
    }
  }

  if (item.tooltip !== undefined) {
    if (nativeElement.title !== item.tooltip) {
      throw Error(`[DOMAssertError] Tooltip of menu item does not match [expected=${item.tooltip}, actual=${nativeElement.title}]`);
    }
  }

  if (item.disabled !== undefined) {
    if (nativeElement.disabled !== item.disabled) {
      throw Error(`[DOMAssertError] Disabled state of menu item does not match [expected=${item.disabled}, actual=${nativeElement.disabled}]`);
    }
  }

  if (item.checked !== undefined) {
    if (actual.checked !== item.checked) {
      throw Error(`[DOMAssertError] Checked state of menu item does not match [expected=${item.checked}, actual=${actual.checked}]`);
    }
  }

  if (item.active !== undefined) {
    if (actual.active !== item.active) {
      throw Error(`[DOMAssertError] Active state of menu item does not match [expected=${item.checked}, actual=${actual.active}]`);
    }
  }

  if (item.actions !== undefined) {
    // assertToolbar(item.actions, actual);
  }

  if (item.attributes !== undefined) {
    Object.entries(item.attributes).forEach(([key, value]) => {
      if (debugElement.attributes[key] !== value) {
        throw Error(`[DOMAssertError] Attributes of menu item do not not match [expected={key=${key}, value=${value}}, actual=${[...Object.entries(debugElement.attributes).map((key, value) => `${key}="${value}"`).join(' ')]}]`);
      }
    })
  }

  if (item.cssClass !== undefined) {
    item.cssClass.forEach(cssClass => {
      if (!nativeElement.classList.contains(cssClass)) {
        throw Error(`[DOMAssertError] Css classes of menu item do not not match [expected=${item.cssClass}, actual=${nativeElement.classList}]`);
      }
    });
  }
}

function assertSubMenu(item: ExpectedSciMenu, actual: MenuItemPO): void {
  const nativeElement = actual.nativeElement;

  if (item.iconLigature !== undefined) {
    if (actual.iconLigature !== item.iconLigature) {
      throw Error(`[DOMAssertError] Icon of menu item does not match [expected=${item.iconLigature}, actual=${actual.iconLigature}]`);
    }
  }

  if (item.iconComponent !== undefined) {
    if (!actual.iconComponent(item.iconComponent.selector)) {
      throw Error(`[DOMAssertError] Expected icon component to be present in the DOM, but is not. [selector=${item.iconComponent.selector}]`);
    }
  }

  if (item.labelText !== undefined) {
    if (actual.labelText !== item.labelText) {
      throw Error(`[DOMAssertError] Expected label text to match, but did not. [expected=${item.labelText}, actual=${(actual.labelText)}]`);
    }
  }

  if (item.labelComponent !== undefined) {
    if (!actual.labelComponent(item.labelComponent.selector)) {
      throw Error(`[DOMAssertError] Expected label component to be present in the DOM, but is not. [selector=${item.labelComponent.selector}]`);
    }
  }

  if (item.tooltip !== undefined) {
    if (nativeElement.title !== item.tooltip) {
      throw Error(`[DOMAssertError] Tooltip of menu item does not match [expected=${item.tooltip}, actual=${nativeElement.title}]`);
    }
  }

  if (item.disabled !== undefined) {
    if (nativeElement.disabled !== item.disabled) {
      throw Error(`[DOMAssertError] Disabled state of menu item does not match [expected=${item.disabled}, actual=${nativeElement.disabled}]`);
    }
  }

  if (item.cssClass !== undefined) {
    item.cssClass.forEach(cssClass => {
      if (!nativeElement.classList.contains(cssClass)) {
        throw Error(`[DOMAssertError] Css classes of menu item do not not match [expected=${item.cssClass}, actual=${nativeElement.classList}]`);
      }
    });
  }

  item.children && expectItems(item.children, actual.subMenu.items);
}

function assertMenuGroup(item: ExpectedSciMenuGroup, actual: MenuGroupPO): void {
  const debugElement = actual.debugElement;

  if (item.label !== undefined) {
    if (actual.label !== item.label) {
      throw Error(`[DOMAssertError] Expected label text to match, but did not. [expected=${item.label}, actual=${(actual.label)}]`);
    }
  }

  if (item.collapsible !== undefined) {
    const iconHtmlElement = debugElement.query(By.css('button.group-header')).query(By.css('sci-icon')).nativeElement;
    if (item.collapsible.collapsed) {
      if (iconHtmlElement.textContent !== 'chevron_right') {
        throw Error(`[DOMAssertError] Expected menu group to be collapsed, but is not.`);
      }
    }
    else {
      if (iconHtmlElement.textContent !== 'keyboard_arrow_down') {
        throw Error(`[DOMAssertError] Expected menu group not to be collapsed, but is.`);
      }
    }
  }

  if (item.actions !== undefined) {
    // assertToolbar(item.actions, actual);
  }

  item.children && expectItems(item.children, actual.items);
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
  active?: boolean;
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
  cssClass?: string[];
  children?: ExpectedSciMenuItemLike[];
}

export interface ExpectedSciMenuGroup {
  type: 'group'
  name?: `menu:${string}` | `toolbar:${string}`;
  label?: string;
  collapsible?: {collapsed: boolean};
  position?: SciMenuContributionPositionLike;
  actions?: ExpectedSciMenuItemLike[];
  children?: ExpectedSciMenuItemLike[];
  cssClass?: string[];
}

export type ExpectedSciMenuItemLike = ExpectedSciMenuItem | ExpectedSciMenu | ExpectedSciMenuGroup;

export interface ExpectedSciMenuObject {
  width?: number;
  height?: number;
  filter?: boolean | {placeholder?: Translatable};
  notFoundText?: Translatable;
}

export const NO_ITEMS_FOUND = 'No items found.';

interface ExpectedSciComponentDescriptor {
  selector: string;
}

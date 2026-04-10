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
import CustomMatcher = jasmine.CustomMatcher;
import {DebugElement} from '@angular/core';
import {ComponentFixture} from '@angular/core/testing';
import {By} from '@angular/platform-browser';

/**
 * Provides the implementation of {@link CustomMatchers#toHaveSubMenuPosition}.
 */
export const toHaveSubMenuPositionCustomMatcher: jasmine.CustomMatcherFactories = {
  toHaveSubMenuPosition: (): CustomMatcher => {
    return {
      compare(actual: ComponentFixture<unknown> | unknown, expected: ExpectedSubMenuPosition, failOutput: string | undefined): CustomMatcherResult {
        try {
          // Expect actual to be of the expected type.
          if (!(actual instanceof ComponentFixture) && !(actual instanceof DebugElement)) {
            return fail(`Expected actual to be of type 'ComponentFixture', or 'DebugElement', but was '${actual?.constructor?.name}'`);
          }

          const debugElement = actual instanceof ComponentFixture ? actual.debugElement : actual;

          assertSubMenuPosition(expected, debugElement);

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

function assertSubMenuPosition(expected: ExpectedSubMenuPosition, debugElement: DebugElement): void {
  const {alignment, cssClass} = expected;

  const menu = debugElement.parent!.query(By.css('sci-menu'));
  const menuItem = menu.query(By.css(`.e2e-menu-item.${cssClass}`));
  const subMenu = menu.parent!.query(By.css(`sci-menu.${cssClass}`));

  const subMenuRect = (subMenu.nativeElement as HTMLElement).getBoundingClientRect();
  const menuItemRect = (menuItem.nativeElement as HTMLElement).getBoundingClientRect()

  switch (alignment) {
    case 'right-bottom':
      if (subMenuRect.left < menuItemRect.right - MENU_ITEM_LABEL_PADDING) {
        throw Error(`[DOMAssertError] SubMenu's left position expected to greater than or equal to '${menuItemRect.right - MENU_ITEM_LABEL_PADDING}' but was '${subMenuRect.left}'`);
      }
      if (subMenuRect.top < menuItemRect.top - MENU_ITEM_LABEL_PADDING) {
        throw Error(`[DOMAssertError] SubMenu's top position expected to greater than or equal to '${menuItemRect.top - MENU_ITEM_LABEL_PADDING}' but was '${subMenuRect.top}'`);
      }
      return;
    case 'right-top':
      if (subMenuRect.left < menuItemRect.right - MENU_ITEM_LABEL_PADDING) {
        throw Error(`[DOMAssertError] SubMenu's left position expected to greater than or equal to '${menuItemRect.right - MENU_ITEM_LABEL_PADDING}' but was '${subMenuRect.left}'`);
      }
      if (subMenuRect.top >= menuItemRect.top - MENU_ITEM_LABEL_PADDING) {
        throw Error(`[DOMAssertError] SubMenu's top position expected to less than '${menuItemRect.top - MENU_ITEM_LABEL_PADDING}' but was '${subMenuRect.top}'`);
      }
      return;
    case 'left-bottom':
      if (subMenuRect.right < menuItemRect.left - MENU_ITEM_LABEL_PADDING) {
        throw Error(`[DOMAssertError] SubMenu's right position expected to greater than or equal to '${menuItemRect.left + MENU_ITEM_LABEL_PADDING}' but was '${subMenuRect.right}'`);
      }
      if (subMenuRect.top < menuItemRect.top - MENU_ITEM_LABEL_PADDING) {
        throw Error(`[DOMAssertError] SubMenu's top position expected to greater than or equal to '${menuItemRect.top - MENU_ITEM_LABEL_PADDING}' but was '${subMenuRect.top}'`);
      }
      return;
    case 'left-top':
      if (subMenuRect.right < menuItemRect.left - MENU_ITEM_LABEL_PADDING) {
        throw Error(`[DOMAssertError] SubMenu's right position expected to greater than or equal to '${menuItemRect.left + MENU_ITEM_LABEL_PADDING}' but was '${subMenuRect.right}'`);
      }
      if (subMenuRect.top >= menuItemRect.top - MENU_ITEM_LABEL_PADDING) {
        throw Error(`[DOMAssertError] SubMenu's top position expected to less than '${menuItemRect.top - MENU_ITEM_LABEL_PADDING}' but was '${subMenuRect.top}'`);
      }
      return;
  }
}

export interface ExpectedSubMenuPosition {
  alignment: 'right-top' | 'left-top' | 'right-bottom' | 'left-bottom';
  cssClass: string;
}

const MENU_OFFSET_VERTICAL = 1;
const MENU_ITEM_LABEL_PADDING = 7.5;

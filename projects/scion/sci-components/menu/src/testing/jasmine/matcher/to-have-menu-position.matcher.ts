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

/**
 * Provides the implementation of {@link CustomMatchers#toHaveMenuPosition}.
 */
export const toHaveMenuPositionCustomMatcher: jasmine.CustomMatcherFactories = {
  toHaveMenuPosition: (): CustomMatcher => {
    return {
      compare(actual: ComponentFixture<unknown> | unknown, anchor: Point, expected: ExpectedMenuPosition, failOutput: string | undefined): CustomMatcherResult {
        try {
          // Expect actual to be of the expected type.
          if (!(actual instanceof ComponentFixture) && !(actual instanceof DebugElement)) {
            return fail(`Expected actual to be of type 'ComponentFixture', or 'DebugElement', but was '${actual?.constructor?.name}'`);
          }

          const menu = actual instanceof ComponentFixture ? actual.debugElement : actual;

          assertMenuPosition(anchor, expected, menu);

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

function assertMenuPosition(anchor: Anchor, expected: ExpectedMenuPosition, menu: DebugElement): void {
  const menuRect = (menu.nativeElement as HTMLElement).getBoundingClientRect();

  const {menuX, menuY, originX, originY} = expected;
  const originXOffset = expected.originXOffset ?? 0;
  const originYOffset = expected.originYOffset ?? 0;

  if ('x' in anchor && 'y' in anchor) {
    if (menuX === 'left') {
      if (menuRect.left !== anchor.x) {
        throw Error(`[DOMAssertError] Menu's left position expected to be '${anchor.x}' but was '${menuRect.left}'`);
      }
    }

    if (menuX === 'right') {
      if (menuRect.right !== anchor.x) {
        throw Error(`[DOMAssertError] Menu's right position expected to be '${anchor.x}' but was '${menuRect.right}'`);
      }
    }

    if (menuY === 'top') {
      if (!isCloseTo(menuRect.top, anchor.y, MENU_OFFSET_VERTICAL_TOP)) {
        throw Error(`[DOMAssertError] Menu's top position expected to be close to '${anchor.y}' but was '${menuRect.top}' [tolerance=${MENU_OFFSET_VERTICAL_TOP}]`);
      }
    }

    if (menuY === 'bottom') {
      if (!isCloseTo(menuRect.bottom, anchor.y, MENU_OFFSET_VERTICAL_TOP)) {
        throw Error(`[DOMAssertError] Menu's bottom position expected to be close to '${anchor.y}' but was '${menuRect.bottom}' [tolerance=${MENU_OFFSET_VERTICAL_TOP}]`);
      }
    }
  }
  else {
    const elementRect = (anchor as HTMLElement).getBoundingClientRect();

    if (menuX === 'left') {
      if (originX === 'left') {
        if (!isCloseTo(menuRect.left, elementRect.left + originXOffset, MENU_OFFSET_HORIZONTAL_LEFT)) {
          throw Error(`[DOMAssertError] Menu's left position expected to be close to '${elementRect.left}' but was '${menuRect.left}' [tolerance=${MENU_OFFSET_HORIZONTAL_LEFT}]`);
        }
      }

      if (originX === 'right') {
        if (!isCloseTo(menuRect.left, elementRect.right + originXOffset, MENU_OFFSET_HORIZONTAL_LEFT)) {
          throw Error(`[DOMAssertError] Menu's left position expected to be close to '${elementRect.right}' but was '${menuRect.left}' [tolerance=${MENU_OFFSET_HORIZONTAL_LEFT}]`);
        }
      }
    }

    if (menuX === 'right') {
      if (originX === 'left') {
        if (!isCloseTo(menuRect.right, elementRect.left + originXOffset, MENU_OFFSET_HORIZONTAL_LEFT)) {
          throw Error(`[DOMAssertError] Menu's right position expected to be close to '${elementRect.left}' but was '${menuRect.right}' [tolerance=${MENU_OFFSET_HORIZONTAL_LEFT}]`);
        }
      }

      if (originX === 'right') {
        if (!isCloseTo(menuRect.right, elementRect.right + originXOffset, MENU_OFFSET_HORIZONTAL_LEFT)) {
          throw Error(`[DOMAssertError] Menu's right position expected to be '${elementRect.right}' but was '${menuRect.right}'`);
        }
      }
    }

    if (menuY === 'top') {
      if (originY === 'top') {
        if (!isCloseTo(menuRect.top, elementRect.top + originYOffset, MENU_OFFSET_HORIZONTAL_TOP)) {
          throw Error(`[DOMAssertError] Menu's top position expected to be close to '${elementRect.top}' but was '${menuRect.top}' [tolerance=${MENU_OFFSET_HORIZONTAL_TOP}]`);
        }
      }
      if (originY === 'bottom') {
        if (!isCloseTo(menuRect.top, elementRect.bottom + originYOffset, MENU_OFFSET_HORIZONTAL_TOP)) {
          throw Error(`[DOMAssertError] Menu's top position expected to be close to '${elementRect.bottom}' but was '${menuRect.top}' [tolerance=${MENU_OFFSET_HORIZONTAL_TOP}]`);
        }
      }
    }

    if (menuY === 'bottom') {
      if (originY === 'bottom') {
        if (!isCloseTo(menuRect.bottom, elementRect.bottom + originYOffset, MENU_OFFSET_HORIZONTAL_TOP)) {
          throw Error(`[DOMAssertError] Menu's bottom position expected to be close to '${elementRect.bottom}' but was '${menuRect.bottom}' [tolerance=${MENU_OFFSET_HORIZONTAL_TOP}]`);
        }
      }
      if (originY === 'top') {
        if (!isCloseTo(menuRect.bottom, elementRect.top + originYOffset, MENU_OFFSET_HORIZONTAL_TOP)) {
          throw Error(`[DOMAssertError] Menu's bottom position expected to be close to '${elementRect.top}' but was '${menuRect.bottom}' [tolerance=${MENU_OFFSET_HORIZONTAL_TOP}]`);
        }
      }
    }
  }
}

export interface ExpectedMenuPosition {
  originX?: 'left' | 'right';
  originY?: 'top' | 'bottom';
  originXOffset?: number;
  originYOffset?: number;

  menuX?: 'left' | 'right';
  menuY?: 'top' | 'bottom';
}

export type Anchor = Point | HTMLElement;

export interface Point {
  x: number;
  y: number;
}

const MENU_OFFSET_VERTICAL_TOP = 1;
const MENU_OFFSET_VERTICAL_LEFT = 0;

const MENU_OFFSET_HORIZONTAL_TOP = 4; // --ɵsci-menu-padding-block
const MENU_OFFSET_HORIZONTAL_LEFT = 1;

function isCloseTo(actual: number, expected: number, tolerance = 0): boolean {
  return Math.abs(actual - expected) <= tolerance;
}

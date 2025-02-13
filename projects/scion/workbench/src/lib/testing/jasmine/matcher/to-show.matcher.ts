/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import CustomMatcher = jasmine.CustomMatcher;
import CustomMatcherResult = jasmine.CustomMatcherResult;
import {ComponentFixture} from '@angular/core/testing';
import {DebugElement, Predicate, Type} from '@angular/core';
import {By} from '@angular/platform-browser';

/**
 * Provides the implementation of {@link CustomMatchers#toShow}.
 */
export const toShowCustomMatcher: jasmine.CustomMatcherFactories = {
  toShow: (): CustomMatcher => {
    return {
      compare(element: any, expected: Type<unknown> | Predicate<DebugElement>, failOutput: string | undefined): CustomMatcherResult {
        const predicate = isPredicate(expected) ? expected : By.directive(expected);
        const found = coerceDebugElement(element).query(predicate) as DebugElement | null !== null;
        return found ? pass() : fail(`Expected ${isPredicate(expected) ? `${expected}` : expected.name} to show`);

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

function isPredicate(expected: Type<unknown> | Predicate<DebugElement>): expected is Predicate<DebugElement> {
  return !expected.prototype;
}

function coerceDebugElement(element: unknown): DebugElement {
  if (element instanceof DebugElement) {
    return element;
  }
  if (element instanceof ComponentFixture) {
    return element.debugElement;
  }
  throw Error(`Expected actual to be of type 'ComponentFixture' or 'DebugElement', but was '${element?.constructor.name}'.`);
}

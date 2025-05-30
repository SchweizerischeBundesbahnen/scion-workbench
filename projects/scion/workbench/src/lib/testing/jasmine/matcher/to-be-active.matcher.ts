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
import {TestBed} from '@angular/core/testing';
import {DebugElement, DOCUMENT} from '@angular/core';

/**
 * Provides the implementation of {@link CustomMatchers#toBeActive}.
 */
export const toBeActiveCustomMatcher: jasmine.CustomMatcherFactories = {
  toBeActive: (): CustomMatcher => {
    return {
      compare(element: unknown): CustomMatcherResult {
        if (!(element instanceof DebugElement)) {
          throw Error(`Expected actual to be of type 'DebugElement', but was '${element?.constructor.name}'.`);
        }

        if (element.nativeElement === TestBed.inject(DOCUMENT).activeElement) {
          return {pass: true};
        }
        else {
          return {pass: false, message: `Expected element ${element.nativeElement} to be active, but was not.`};
        }
      },
    };
  },
};

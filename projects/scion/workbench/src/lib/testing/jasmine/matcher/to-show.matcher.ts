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
import {Type} from '@angular/core';
import {By} from '@angular/platform-browser';

/**
 * Provides the implementation of {@link CustomMatchers#toShow}.
 */
export const toShowCustomMatcher: jasmine.CustomMatcherFactories = {
  toShow: (): CustomMatcher => {
    return {
      compare(actualFixture: any, expectedComponentType: Type<any>, failOutput: string | undefined): CustomMatcherResult {
        if (!(actualFixture instanceof ComponentFixture)) {
          return fail(`Expected actual to be of type 'ComponentFixture' [actual=${actualFixture.constructor.name}]`);
        }

        const found = !!actualFixture.debugElement.query(By.directive(expectedComponentType));
        return found ? pass() : fail(`Expected ${expectedComponentType.name} to show`);

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

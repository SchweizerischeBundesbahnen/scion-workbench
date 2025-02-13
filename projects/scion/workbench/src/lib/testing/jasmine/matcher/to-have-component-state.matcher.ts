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
import {WORKBENCH_VIEW_REGISTRY} from '../../../view/workbench-view.registry';
import {ViewId} from '../../../view/workbench-view.model';

/**
 * Provides the implementation of {@link CustomMatchers#toHaveComponentState}.
 */
export const toHaveComponentStateCustomMatcher: jasmine.CustomMatcherFactories = {
  toHaveComponentState: (): CustomMatcher => {
    return {
      compare(viewId: ViewId, expected: string, failOutput: string | undefined): CustomMatcherResult {
        const viewComponent = TestBed.inject(WORKBENCH_VIEW_REGISTRY).get(viewId).portal.componentRef.location.nativeElement as HTMLElement;
        const actual = viewComponent.querySelector<HTMLOptionElement>('input.component-state')!.value;
        if (actual !== expected) {
          return fail(`Expected transient state '${actual}' of view '${viewId}' to equal '${expected}'. Maybe, the component was not detached but destroyed during layout change.`);
        }
        return pass();

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

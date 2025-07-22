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
import {WORKBENCH_PART_REGISTRY} from '../../../part/workbench-part.registry';
import {PartId, ViewId} from '../../../workbench.identifiers';

/**
 * Provides the implementation of {@link CustomMatchers#toBeRegistered}.
 */
export const toBeRegisteredCustomMatcher: jasmine.CustomMatcherFactories = {
  toBeRegistered: (): CustomMatcher => {
    return {
      compare(viewId: ViewId, expected: {partId: PartId; active: boolean}, failOutput: string | undefined): CustomMatcherResult {
        const view = TestBed.inject(WORKBENCH_VIEW_REGISTRY).get(viewId, {orElse: null});
        // Assert the view to be registered.
        if (!view) {
          return fail(`Expected view '${viewId}' to be registered in 'WorkbenchViewRegistry'.`);
        }
        // Assert the view to reference the expected part.
        if (view.part().id !== expected.partId) {
          return fail(`Expected view '${viewId}' to reference part '${expected.partId}', but instead referencing part '${view.part().id}'.`);
        }
        // Assert the view to be contained in the expected part.
        const views = TestBed.inject(WORKBENCH_PART_REGISTRY).get(expected.partId, {orElse: null})?.views() ?? [];
        if (!views.includes(view)) {
          return fail(`Expected view '${viewId}' to be contained in part '${expected.partId}'. But, part '${expected.partId}' contains the following views: '${views.map(view => view.id)}'.`);
        }
        // Assert the view's active state.
        if (expected.active) {
          if (!view.active()) {
            return fail(`Expected view '${viewId}' to be active.`);
          }
          if (view.part().activeView() !== view) {
            return fail(`Expected view '${viewId}' to be the active view in its part '${view.part().id}', But, view '${view.part().activeView()?.id}' is the active view.`);
          }
        }
        else {
          if (view.active()) {
            return fail(`Expected view '${viewId}' to be inactive.`);
          }
          if (view.part().activeView() === view) {
            return fail(`Expected view '${viewId}' to be inactive, but is the active view in its part '${view.part().id}'.`);
          }
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

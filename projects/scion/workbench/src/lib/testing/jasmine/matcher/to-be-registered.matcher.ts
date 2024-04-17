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
import {WorkbenchViewRegistry} from '../../../view/workbench-view.registry';
import {WorkbenchPartRegistry} from '../../../part/workbench-part.registry';
import {ViewId} from '../../../view/workbench-view.model';

/**
 * Provides the implementation of {@link CustomMatchers#toBeRegistered}.
 */
export const toBeRegisteredCustomMatcher: jasmine.CustomMatcherFactories = {
  toBeRegistered: (): CustomMatcher => {
    return {
      compare(viewId: ViewId, expected: {partId: string; active: boolean}, failOutput: string | undefined): CustomMatcherResult {
        const view = TestBed.inject(WorkbenchViewRegistry).get(viewId, {orElse: null});
        // Assert the view to be registered.
        if (!view) {
          return fail(`Expected view '${viewId}' to be registered in 'WorkbenchViewRegistry'.`);
        }
        // Assert the view to reference the expected part.
        if (view.part.id !== expected.partId) {
          return fail(`Expected view '${viewId}' to reference part '${expected.partId}', but instead referencing part '${view.part.id}'.`);
        }
        // Assert the view to be contained in the expected part.
        const viewIds = TestBed.inject(WorkbenchPartRegistry).get(expected.partId, {orElse: null})?.viewIds;
        if (!viewIds?.includes(viewId)) {
          return fail(`Expected view '${viewId}' to be contained in part '${expected.partId}'. But, part '${expected.partId}' contains the following views: '${viewIds}'.`);
        }
        // Assert the view's active state.
        if (expected.active) {
          if (!view.active) {
            return fail(`Expected view '${viewId}' to be active.`);
          }
          if (view.part.activeViewId !== view.id) {
            return fail(`Expected view '${viewId}' to be the active view in its part '${view.part.id}', But, view '${view.part.activeViewId}' is the active view.`);
          }
        }
        else {
          if (view.active) {
            return fail(`Expected view '${viewId}' to be inactive.`);
          }
          if (view.part.activeViewId === view.id) {
            return fail(`Expected view '${viewId}' to be inactive, but is the active view in its part '${view.part.id}'.`);
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


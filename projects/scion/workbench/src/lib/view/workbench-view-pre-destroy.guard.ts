/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {CanDeactivateFn} from '@angular/router';
import {WorkbenchViewPreDestroy} from '../workbench.model';
import {inject} from '@angular/core';
import {WorkbenchRouter} from '../routing/workbench-router.service';

/**
 * Invokes {@link WorkbenchViewPreDestroy#onWorkbenchViewPreDestroy} lifecycle hook if implemented by the component.
 */
export const canDeactivateWorkbenchView: CanDeactivateFn<unknown> = (component, currentRoute) => {
  // Depending on the route configuration, this guard can be called even if the component is not to be destroyed.
  // Therefore, we need to check if the view is actually being closed before invoking the `onWorkbenchViewPreDestroy`
  // lifecycle hook. For an example, see {@link provideMicrofrontendRoutes}.
  if (isViewToBeRemoved(currentRoute.outlet) && implementsWorkbenchViewPreDestroyHook(component)) {
    return component.onWorkbenchViewPreDestroy();
  }

  return true;
};

/**
 * Tests if given view is to be removed.
 */
function isViewToBeRemoved(currentViewId: string): boolean {
  return inject(WorkbenchRouter).getCurrentNavigationContext()?.layoutDiff.removedViews.includes(currentViewId) ?? false;
}

/**
 * Tests if given component implements {@link WorkbenchViewPreDestroy} interface.
 */
function implementsWorkbenchViewPreDestroyHook(component: unknown): component is WorkbenchViewPreDestroy {
  return typeof (component as WorkbenchViewPreDestroy)?.onWorkbenchViewPreDestroy === 'function';
}

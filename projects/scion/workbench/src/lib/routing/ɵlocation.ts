/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Location, LocationStrategy} from '@angular/common';
import {ApplicationRef, EnvironmentProviders, inject, Injectable, makeEnvironmentProviders} from '@angular/core';
import {Router} from '@angular/router';
import {WorkbenchNavigationalStates} from './workbench-navigational-states';

/**
 * Provides a set of DI providers to patch {@link Location} for the Angular router to always add workbench navigations
 * to the browsing history stack.
 *
 * @see ɵLocation
 */
export function provideLocationPatch(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: Location,
      useClass: ɵLocation,
    },
  ]);
}

/**
 * Patches {@link Location} for the Angular router to always add workbench navigations to the browsing history stack,
 * even if the URL does not change.
 *
 * Rationale:
 * If only the layout of the main grid is changed, the URL does not change because the layout is passed to the
 * navigation as state and not as a query parameter. By default, an unchanged URL does not create a new entry in the
 * browsing history stack, but replaces the current entry. See Angular router.ts#setBrowserUrl
 */
@Injectable(/* DO NOT provide via 'providedIn' metadata as registered under `Location` DI token. */)
class ɵLocation extends Location {

  private _appRef = inject(ApplicationRef);
  private _router: Router | undefined;

  constructor() {
    super(inject(LocationStrategy));
  }

  public override isCurrentPathEqualTo(path: string, query?: string): boolean {
    return super.isCurrentPathEqualTo(path, query) ? !this.isWorkbenchNavigation() : false;
  }

  /**
   * Indicates whether the current navigation is a workbench navigation performed through the workbench router.
   */
  private isWorkbenchNavigation(): boolean {
    const currentNavigation = this.router?.currentNavigation() ?? null;
    return currentNavigation !== null && WorkbenchNavigationalStates.fromNavigation(currentNavigation) !== null;
  }

  /**
   * Reference to the Angular router.
   */
  private get router(): Router | undefined {
    // Note that we cannot inject the `Router` in the constructor because the `Router` depends on `Location`,
    // which would cause a circular dependency at construction time. Instead, we inject the router lazy.
    // However, injecting the router will fail if the platform has already been destroyed, which happens
    // in tests that tear down before the initial navigation has finished. To avoid this error, we inject
    // the router only if the platform is still running.
    return (this._router ??= !this._appRef.destroyed ? this._appRef.injector.get(Router) : undefined);
  }
}

/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ApplicationRef, Directive, inject} from '@angular/core';
import {ChildrenOutletContexts} from '@angular/router';

/**
 * TODO [activity] Revsit description
 *
 * Pretends the router outlet to be a top-level router outlet, i.e., not nested in a router-outlet, enabling nested router outlets
 * be the target of top-level routes.
 *
 * Background:
 * The workbench registers auxiliary routes of all top-level routes, enabling routing on a per-part and per-view basis.
 *
 * Use for view and part outlets However, if the workbench is mounted in a router outlet, part and view outlets are no longer top-level outlets but nested outlets.
 */
@Directive({
  selector: 'router-outlet[wbRoot]',
  standalone: true,
  providers: [
    {provide: ChildrenOutletContexts, useFactory: () => inject(ApplicationRef).injector.get(ChildrenOutletContexts)},
  ],
})
export class RootRouterOutletDirective {
}

/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
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
 * Pretends the router outlet to be a top-level router outlet.
 *
 * Use this directive on nested router outlets to be the target of top-level routes, i.e., routes registered by the workbench for each part and view.
 */
@Directive({
  selector: 'router-outlet[wbRouterOutletRootContext]',
  providers: [
    {provide: ChildrenOutletContexts, useFactory: () => inject(ApplicationRef).injector.get(ChildrenOutletContexts)},
  ],
})
export class RouterOutletRootContextDirective {
}

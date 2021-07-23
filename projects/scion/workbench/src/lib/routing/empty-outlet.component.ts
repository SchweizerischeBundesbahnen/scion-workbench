/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import {Component} from '@angular/core';

/**
 * This component is an identical copy of the internal Angular component {ɵEmptyOutletComponent}.
 * It is required for lazy loading of aux routes. See 'router/src/utils/config.ts#standardizeConfig'
 * and Angular PR #23459.
 *
 * ---
 * ### Angular documentation of ɵEmptyOutletComponent in `empty_outlet.ts`:
 *
 * This component is used internally within the router to be a placeholder when an empty
 * router-outlet is needed. For example, with a config such as:
 *
 * `{path: 'parent', outlet: 'nav', children: [...]}`
 *
 * In order to render, there needs to be a component on this config, which will default
 * to this `EmptyOutletComponent`.
 * ---
 */
@Component({
  template: '<router-outlet></router-outlet>',
  styleUrls: ['./empty-outlet.component.scss'],
})
export class EmptyOutletComponent {
}

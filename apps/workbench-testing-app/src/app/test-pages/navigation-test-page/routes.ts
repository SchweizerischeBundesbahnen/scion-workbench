/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {NavigationTestPageComponent} from './navigation-test-page.component';
import {Routes} from '@angular/router';

export default [
  {path: '', component: NavigationTestPageComponent},
  {path: ':segment1', component: NavigationTestPageComponent},
  {path: ':segment1/:segment2', component: NavigationTestPageComponent},
] satisfies Routes;

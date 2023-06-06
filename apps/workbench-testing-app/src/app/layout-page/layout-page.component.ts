/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component} from '@angular/core';
import {SciTabbarModule} from '@scion/components.internal/tabbar';
import AddPartPageComponent from './add-part-page/add-part-page.component';
import AddViewPageComponent from './add-view-page/add-view-page.component';
import ActivateViewPageComponent from './activate-view-page/activate-view-page.component';
import RegisterPartActionPageComponent from './register-part-action-page/register-part-action-page.component';
import RegisterRoutePageComponent from './register-route-page/register-route-page.component';

@Component({
  selector: 'app-layout-page',
  templateUrl: './layout-page.component.html',
  styleUrls: ['./layout-page.component.scss'],
  standalone: true,
  imports: [
    SciTabbarModule,
    AddPartPageComponent,
    AddViewPageComponent,
    ActivateViewPageComponent,
    RegisterPartActionPageComponent,
    RegisterRoutePageComponent,
  ],
})
export default class LayoutPageComponent {
}

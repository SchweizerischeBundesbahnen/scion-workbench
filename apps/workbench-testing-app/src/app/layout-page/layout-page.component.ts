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
import RegisterPartActionPageComponent from './register-part-action-page/register-part-action-page.component';
import {SciTabbarComponent, SciTabDirective} from '@scion/components.internal/tabbar';
import ModifyLayoutPageComponent from './modify-layout-page/modify-layout-page.component';
import CreatePerspectivePageComponent from './create-perspective-page/create-perspective-page.component';

@Component({
  selector: 'app-layout-page',
  templateUrl: './layout-page.component.html',
  styleUrls: ['./layout-page.component.scss'],
  imports: [
    SciTabbarComponent,
    SciTabDirective,
    ModifyLayoutPageComponent,
    CreatePerspectivePageComponent,
    RegisterPartActionPageComponent,
  ],
})
export default class LayoutPageComponent {
}

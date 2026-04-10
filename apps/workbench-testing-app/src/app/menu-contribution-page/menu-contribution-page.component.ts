/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SciTabbarComponent, SciTabDirective} from '@scion/components.internal/tabbar';
import {ToolbarContributionPageComponent} from './toolbar-contribution-page/toolbar-contribution.page.component';
import {MenuContributionInternalPageComponent} from './menu-contribution-page/menu-contribution-internal.page.component';

@Component({
  selector: 'app-menu-contribution-page',
  templateUrl: './menu-contribution-page.component.html',
  styleUrls: ['./menu-contribution-page.component.scss'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    SciTabDirective,
    SciTabbarComponent,
    ToolbarContributionPageComponent,
    MenuContributionInternalPageComponent,
  ],
})
export default class MenuContributionPageComponent {
}

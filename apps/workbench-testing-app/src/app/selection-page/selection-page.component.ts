/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, inject} from '@angular/core';
import SelectionProviderPageComponent from './selection-provider-page/selection-provider-page.component';
import SelectionListenerPageComponent from './selection-listener-page/selection-listener-page.component';
import {SciTabbarComponent, SciTabDirective} from '@scion/components.internal/tabbar';
import {WorkbenchDialog, WorkbenchSelectionProvider, WorkbenchView} from '@scion/workbench';

@Component({
  selector: 'app-selection-page',
  templateUrl: './selection-page.component.html',
  styleUrls: ['./selection-page.component.scss'],
  standalone: true,
  imports: [
    SciTabbarComponent,
    SciTabDirective,
    SelectionProviderPageComponent,
    SelectionListenerPageComponent,
  ],
})
export default class SelectionPageComponent {

  constructor() {
    const view = inject(WorkbenchView, {optional: true});
    const dialog = inject(WorkbenchDialog, {optional: true});
    const selectionProvider = inject(WorkbenchSelectionProvider, {optional: true});
    console.log('>>> view', view);
    console.log('>>> dialog', dialog);
    console.log('>>> selectionProvider', selectionProvider);
  }
}

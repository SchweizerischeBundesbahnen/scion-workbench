/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, computed, inject, isDevMode} from '@angular/core';
import {WorkbenchView} from '../view/workbench-view.model';

@Component({
  selector: 'wb-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.scss'],
  standalone: true,
})
export default class PageNotFoundComponent {

  protected isDevMode = isDevMode();
  protected view = inject(WorkbenchView);
  protected urlSegments = computed(() => this.view.urlSegments().map(segment => `${segment}`).join('/'));
}

/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, computed, inject} from '@angular/core';
import {WorkbenchPartActionDirective} from '@scion/workbench';
import {SciMaterialIconDirective} from '@scion/components.internal/material-icon';
import {ActiveWorkbenchElementLogCollectorService} from './active-workbench-element-log-collector.service';

@Component({
  selector: 'app-active-workbench-element-log',
  templateUrl: './active-workbench-element-log.component.html',
  styleUrl: './active-workbench-element-log.component.scss',
  imports: [
    SciMaterialIconDirective,
    WorkbenchPartActionDirective,
  ],
})
export default class ActiveWorkbenchElementLogComponent {

  private readonly _collector = inject(ActiveWorkbenchElementLogCollectorService);

  protected readonly log = computed(() => this._collector.log().join('\n'));

  protected onClear(): void {
    this._collector.clear();
  }
}

/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ChangeDetectionStrategy, Component, computed, inject, signal, Signal} from '@angular/core';
import {WorkbenchDialog, WorkbenchNotification, WorkbenchPart, WorkbenchPopup, WorkbenchView} from '@scion/workbench';
import {SciKeyValueComponent} from '@scion/components.internal/key-value';
import {FormsModule} from '@angular/forms';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';

@Component({
  selector: 'app-workbench-handle-bounds-test-page',
  templateUrl: './workbench-handle-bounds-test-page.component.html',
  styleUrl: './workbench-handle-bounds-test-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SciKeyValueComponent,
    FormsModule,
    SciFormFieldComponent,
  ],
  host: {
    '[style.height]': 'contentSize.height()',
    '[style.width]': 'contentSize.width()',
  },
})
export default class WorkbenchHandleBoundsTestPageComponent {

  protected readonly bounds = computeHandleBounds();
  protected readonly dialog = inject(WorkbenchDialog, {optional: true});
  protected readonly notification = inject(WorkbenchNotification, {optional: true});

  protected readonly contentSize = {
    width: signal(''),
    height: signal(''),
  };
}

/**
 * Gets the bounds from the handle.
 */
function computeHandleBounds(): Signal<Record<string, string> | undefined> {
  const handle = inject(WorkbenchPart, {optional: true}) ?? inject(WorkbenchView, {optional: true}) ?? inject(WorkbenchDialog, {optional: true}) ?? inject(WorkbenchPopup, {optional: true}) ?? inject(WorkbenchNotification, {optional: true});
  return computed(() => handle?.bounds()?.toJSON() as Record<string, string> | undefined);
}

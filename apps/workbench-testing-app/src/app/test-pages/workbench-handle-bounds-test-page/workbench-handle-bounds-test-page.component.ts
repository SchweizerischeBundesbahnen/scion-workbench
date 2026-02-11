/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, computed, inject, Signal} from '@angular/core';
import {WorkbenchDialog, WorkbenchPart, WorkbenchPopup, WorkbenchView} from '@scion/workbench';
import {SciKeyValueComponent} from '@scion/components.internal/key-value';

@Component({
  selector: 'app-workbench-handle-bounds-test-page',
  templateUrl: './workbench-handle-bounds-test-page.component.html',
  styleUrl: './workbench-handle-bounds-test-page.component.scss',
  imports: [
    SciKeyValueComponent,
  ],
})
export default class WorkbenchHandleBoundsTestPageComponent {

  protected readonly bounds = computeHandleBounds();
}

/**
 * Gets the bounds from the handle.
 */
function computeHandleBounds(): Signal<Record<string, string> | undefined> {
  const handle = inject(WorkbenchPart, {optional: true}) ?? inject(WorkbenchView, {optional: true}) ?? inject(WorkbenchDialog, {optional: true}) ?? inject(WorkbenchPopup, {optional: true});
  return computed(() => handle?.bounds()?.toJSON() as Record<string, string> | undefined);
}

/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {effect, inject, Injectable, linkedSignal} from '@angular/core';
import {DialogId, PartId, PopupId, ViewId, NotificationId, WorkbenchElement, WorkbenchService} from '@scion/workbench';

/**
 * Collects activated workbench elements.
 */
@Injectable({providedIn: 'root'})
export class ActiveWorkbenchElementCollector {

  public readonly activeElements = linkedSignal<WorkbenchElement | null, Array<PartId | ViewId | DialogId | PopupId | NotificationId | undefined>>({
    source: inject(WorkbenchService).activeElement,
    computation: (activeElement, previous) => (previous?.value ?? []).concat(activeElement?.id),
  });

  constructor() {
    effect(() => this.activeElements()); // immediately start collecting logs
  }

  public clear(): void {
    this.activeElements.set([]);
  }
}

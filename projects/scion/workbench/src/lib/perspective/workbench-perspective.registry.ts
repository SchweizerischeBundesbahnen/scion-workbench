/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {WorkbenchElementRegistry} from '../registry/workbench-element-registry';
import {ɵWorkbenchPerspective} from './ɵworkbench-perspective.model';
import {Injectable} from '@angular/core';

/**
 * Registry for {@link ɵWorkbenchPerspective} elements.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchPerspectiveRegistry extends WorkbenchElementRegistry<string, ɵWorkbenchPerspective> {
  constructor() {
    super({
      nullElementErrorFn: perspectiveId => Error(`[NullPerspectiveError] Perspective '${perspectiveId}' not found.`),
      onUnregister: perspective => perspective.destroy(),
    });
  }
}

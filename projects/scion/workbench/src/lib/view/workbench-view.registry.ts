/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Injectable} from '@angular/core';
import {ɵWorkbenchView} from './ɵworkbench-view.model';
import {WorkbenchElementRegistry} from '../registry/workbench-element-registry';
import {ViewId} from '../workbench.identifiers';

/**
 * Registry for {@link WorkbenchView} elements.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchViewRegistry extends WorkbenchElementRegistry<ViewId, ɵWorkbenchView> {
  constructor() {
    super({
      nullElementErrorFn: viewId => Error(`[NullViewError] View '${viewId}' not found.`),
      onUnregister: view => view.destroy(),
    });
  }
}

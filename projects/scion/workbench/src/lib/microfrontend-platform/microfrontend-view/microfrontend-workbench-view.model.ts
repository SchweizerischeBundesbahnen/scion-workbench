/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {WorkbenchViewCapability} from '@scion/workbench-client';
import {Params} from '@angular/router';

/**
 * Represents a view that displays a microfrontend.
 *
 * This type is registered as adapter in {@link ɵWorkbenchView}, allowing adaptation of views displaying a microfrontend.
 *
 * @see ɵWorkbenchView.adapt
 */
export class MicrofrontendWorkbenchView {

  constructor(public readonly capability: WorkbenchViewCapability, public readonly params: Params) {
  }
}

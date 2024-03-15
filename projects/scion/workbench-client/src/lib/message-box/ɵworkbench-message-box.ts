/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {MicrofrontendPlatformClient} from '@scion/microfrontend-platform';
import {ɵMessageBoxContext} from './ɵworkbench-message-box-context';
import {WorkbenchMessageBox} from './workbench-message-box';
import {WorkbenchMessageBoxCapability} from '../message-box/workbench-message-box-capability';

/**
 * @ignore
 * @docs-private Not public API, intended for internal use only.
 */
export class ɵWorkbenchMessageBox implements WorkbenchMessageBox {

  public capability: WorkbenchMessageBoxCapability;
  public params: Map<string, unknown>;

  constructor(private _context: ɵMessageBoxContext) {
    this.capability = this._context.capability;
    this.params = this._context.params;
  }

  /** @inheritDoc */
  public signalReady(): void {
    MicrofrontendPlatformClient.signalReady();
  }
}

/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ActivatedMicrofrontend} from '../microfrontend-host/microfrontend-host.model';
import {signal, Signal} from '@angular/core';
import {WorkbenchMessageBoxCapability} from '@scion/workbench-client';
import {WorkbenchDialog} from '../../dialog/workbench-dialog.model';

/** @inheritDoc */
export class MicrofrontendHostMessageBox implements ActivatedMicrofrontend {

  public readonly capability: Signal<WorkbenchMessageBoxCapability>;
  public readonly params: Signal<Map<string, unknown>>;
  public readonly referrer: Signal<string>;

  constructor(private _dialog: WorkbenchDialog, capability: WorkbenchMessageBoxCapability, params: Map<string, unknown>, referrer: string) {
    this.capability = signal(capability).asReadonly();
    this.params = signal(params).asReadonly();
    this.referrer = signal(referrer).asReadonly();
    this.setMessageBoxProperties();
  }

  private setMessageBoxProperties(): void {
    const properties = this.capability().properties;

    this._dialog.size.width = properties.size?.width;
    this._dialog.size.height = properties.size?.height;
    this._dialog.size.minWidth = properties.size?.minWidth;
    this._dialog.size.maxWidth = properties.size?.maxWidth;
    this._dialog.size.minHeight = properties.size?.minHeight;
    this._dialog.size.maxHeight = properties.size?.maxHeight;
  }
}

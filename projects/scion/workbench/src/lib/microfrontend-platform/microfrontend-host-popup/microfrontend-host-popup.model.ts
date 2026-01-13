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
import {WorkbenchPopupCapability} from '@scion/workbench-client';
import {WorkbenchPopup} from '../../popup/workbench-popup.model';

/** @inheritDoc */
export class MicrofrontendHostPopup implements ActivatedMicrofrontend {

  public readonly capability: Signal<WorkbenchPopupCapability>;
  public readonly params: Signal<Map<string, unknown>>;
  public readonly referrer: Signal<string>;

  constructor(private _popup: WorkbenchPopup, capability: WorkbenchPopupCapability, params: Map<string, unknown>, referrer: string) {
    this.capability = signal(capability).asReadonly();
    this.params = signal(params).asReadonly();
    this.referrer = signal(referrer).asReadonly();
    this.setPopupProperties();
  }

  private setPopupProperties(): void {
    const properties = this.capability().properties;

    this._popup.size.width = properties.size?.width;
    this._popup.size.height = properties.size?.height;
    this._popup.size.minWidth = properties.size?.minWidth;
    this._popup.size.maxWidth = properties.size?.maxWidth;
    this._popup.size.minHeight = properties.size?.minHeight;
    this._popup.size.maxHeight = properties.size?.maxHeight;
  }
}

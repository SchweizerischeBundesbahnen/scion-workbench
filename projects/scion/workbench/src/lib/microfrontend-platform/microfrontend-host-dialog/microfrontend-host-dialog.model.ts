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
import {WorkbenchDialogCapability} from '@scion/workbench-client';
import {createRemoteTranslatable} from '../microfrontend-text/remote-text-provider';
import {WorkbenchDialog} from '../../dialog/workbench-dialog.model';

/** @inheritDoc */
export class MicrofrontendHostDialog implements ActivatedMicrofrontend {

  public readonly capability: Signal<WorkbenchDialogCapability>;
  public readonly params: Signal<Map<string, unknown>>;
  public readonly referrer: Signal<string>;

  constructor(private _dialog: WorkbenchDialog, capability: WorkbenchDialogCapability, params: Map<string, unknown>, referrer: string) {
    this.capability = signal(capability).asReadonly();
    this.params = signal(params).asReadonly();
    this.referrer = signal(referrer).asReadonly();
    this.setDialogProperties();
  }

  private setDialogProperties(): void {
    const properties = this.capability().properties;
    const params = this.params();
    const appSymbolicName = this.capability().metadata!.appSymbolicName;

    this._dialog.size.width = properties.size?.width;
    this._dialog.size.height = properties.size?.height;
    this._dialog.size.minWidth = properties.size?.minWidth;
    this._dialog.size.maxWidth = properties.size?.maxWidth;
    this._dialog.size.minHeight = properties.size?.minHeight;
    this._dialog.size.maxHeight = properties.size?.maxHeight;

    this._dialog.title = createRemoteTranslatable(properties.title, {appSymbolicName, valueParams: params, topicParams: properties.resolve});
    this._dialog.closable = properties.closable ?? true;
    this._dialog.resizable = properties.resizable ?? true;
    this._dialog.padding = properties.padding ?? true;
  }
}

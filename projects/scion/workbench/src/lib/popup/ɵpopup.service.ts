/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {inject, Injectable} from '@angular/core';
import {LEGACY_POPUP_INPUT} from './ɵworkbench-popup';
import {PopupConfig} from './popup.config';
import {PopupService} from './popup.service';
import {WorkbenchPopupService} from './workbench-popup.service';

/** @inheritDoc */
@Injectable({providedIn: 'root'})
export class ɵPopupService implements PopupService {

  private readonly _workbenchPopupService = inject(WorkbenchPopupService);

  /** @inheritDoc */
  public open<R>(config: PopupConfig): Promise<R | undefined> {
    return this._workbenchPopupService.open(config.component, {
      id: config.id,
      anchor: config.anchor,
      align: config.align,
      closeStrategy: config.closeStrategy,
      size: config.size,
      cssClass: config.cssClass,
      context: config.context,
      injector: config.componentConstructOptions?.injector,
      providers: [
        ...config.componentConstructOptions?.providers ?? [],
        {provide: LEGACY_POPUP_INPUT, useValue: config.input as unknown},
      ],
    });
  }
}

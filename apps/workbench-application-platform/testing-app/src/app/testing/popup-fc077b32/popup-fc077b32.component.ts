/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Component } from '@angular/core';
import { provideWorkbenchPopup, WorkbenchPopup } from '@scion/workbench-application.angular';

@Component({
  selector: 'app-popup-fc077b32',
  templateUrl: './popup-fc077b32.component.html',
  styleUrls: ['./popup-fc077b32.component.scss'],
  providers: [
    provideWorkbenchPopup(PopupFc077b32Component),
  ],
})
export class PopupFc077b32Component {

  constructor(private _popup: WorkbenchPopup) {
  }

  public onClose(): void {
    this._popup.close();
  }
}

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
import { provideWorkbenchView, WbBeforeDestroy, WorkbenchView } from '@scion/workbench-application.angular';
import { Observable } from 'rxjs';
import { MessageBoxService } from '@scion/workbench-application.core';

@Component({
  selector: 'app-view-0c4fe9e3',
  template: '',
  providers: [
    provideWorkbenchView(View0c4fe9e3Component),
  ],
})
export class View0c4fe9e3Component implements WbBeforeDestroy {

  constructor(private _messageBoxService: MessageBoxService, private _view: WorkbenchView) {
  }

  public wbBeforeDestroy(): Observable<boolean> | Promise<boolean> | boolean {
    return this._messageBoxService.open({
      text: `Do you want to close this view '${this._view.title}'?`,
      cssClass: 'e2e-confirm-closing',
      actions: {
        'e2e-yes': 'Yes',
        'e2e-no': 'No',
      },
    }).then(result => (result === 'e2e-yes'));
  }
}

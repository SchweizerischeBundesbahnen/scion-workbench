/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {booleanAttribute, Component} from '@angular/core';
import {WorkbenchView} from '@scion/workbench-client';
import {from, map, mergeMap, Observable} from 'rxjs';

@Component({
  selector: 'app-view-properties-test-page',
  template: '',
})
export default class ViewPropertiesTestPageComponent {

  constructor(private _view: WorkbenchView) {
    this._view.setTitle(this.observeParam$('title'));
    this._view.setHeading(this.observeParam$('heading'));
    this._view.markDirty(this.observeParam$('dirty').pipe(map(booleanAttribute)));
    this._view.setClosable(this.observeParam$('closable').pipe(map(booleanAttribute)));
  }

  private observeParam$(param: string): Observable<string> {
    return this._view.params$
      .pipe(
        map(params => params.get(param) as string | undefined),
        map(params => params?.split(',') ?? []),
        mergeMap(params => from(params)),
      );
  }
}

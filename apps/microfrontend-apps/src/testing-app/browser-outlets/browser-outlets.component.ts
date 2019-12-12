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
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';
import { coerceNumberProperty } from '@angular/cdk/coercion';
import { UUID } from '@scion/toolkit/util';

@Component({
  selector: 'app-browser-outlets',
  templateUrl: './browser-outlets.component.html',
  styleUrls: ['./browser-outlets.component.scss'],
})
export class BrowserOutletsComponent {

  public outletNames$: Observable<string[]>;

  constructor(route: ActivatedRoute) {
    const identity = UUID.randomUUID();
    this.outletNames$ = route.paramMap.pipe(map(params => {
      if (params.get('names')) {
        return params.get('names').split(',');
      }
      else if (params.get('count')) {
        const count = coerceNumberProperty(params.get('count'));
        return new Array(count).fill(undefined).map((value, index) => `${identity}#${index}`);
      }
      else {
        return [UUID.randomUUID()];
      }
    }));
  }
}

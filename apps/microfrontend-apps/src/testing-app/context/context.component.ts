/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Beans, ContextService } from '@scion/microfrontend-platform';
import { Observable, OperatorFunction } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-context',
  templateUrl: './context.component.html',
  styleUrls: ['./context.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContextComponent {

  public context$: Observable<Map<string, Observable<any>>>;

  constructor() {
    this.context$ = Beans.get(ContextService).names$().pipe(collectToContextMap());
  }
}

function collectToContextMap(): OperatorFunction<Set<string>, Map<string, Observable<any>>> {
  return map(names => Array.from(names).reduce((collected, name) => collected.set(name, Beans.get(ContextService).observe$(name)), new Map<string, Observable<any>>()));
}

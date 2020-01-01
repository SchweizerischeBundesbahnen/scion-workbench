/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-context-entry',
  templateUrl: './context-entry.component.html',
  styleUrls: ['./context-entry.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContextEntryComponent {

  public value: any;

  @Input()
  public name: string;

  @Input('value')  // tslint:disable-line:no-input-rename
  public set setValue(value: any) {
    if (typeof value === 'object') {
      this.value = JSON.stringify(value);
    }
    else {
      this.value = value;
    }
  }
}

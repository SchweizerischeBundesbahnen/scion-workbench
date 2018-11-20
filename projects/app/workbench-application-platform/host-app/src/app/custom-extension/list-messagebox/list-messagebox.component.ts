/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Component } from '@angular/core';
import { MessageBox } from '@scion/workbench';

@Component({
  selector: 'app-list-messagebox',
  templateUrl: './list-messagebox.component.html',
  styleUrls: ['./list-messagebox.component.scss'],
})
export class ListMessageboxComponent {

  constructor(public messageBox: MessageBox) {
  }
}

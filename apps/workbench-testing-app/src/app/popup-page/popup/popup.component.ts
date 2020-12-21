/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Component, HostBinding } from '@angular/core';
import { Popup } from '@scion/workbench';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss'],
})
export class PopupComponent {

  @HostBinding('style.min-height')
  public minHeight = '525px';

  @HostBinding('style.height')
  public height: string;

  @HostBinding('style.max-height')
  public maxHeight: string;

  @HostBinding('style.min-width')
  public minWidth = '400px';

  @HostBinding('style.width')
  public width: string;

  @HostBinding('style.max-width')
  public maxWidth: string;

  constructor(public popup: Popup) {
  }
}

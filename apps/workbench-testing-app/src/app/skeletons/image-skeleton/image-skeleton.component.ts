/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, HostBinding} from '@angular/core';
import {WorkbenchView} from '@scion/workbench';

@Component({
  selector: 'app-image-skeleton',
  templateUrl: './image-skeleton.component.html',
  styleUrls: ['./image-skeleton.component.scss'],
  standalone: true,
})
export default class ImageSkeletonComponent {

  @HostBinding('class.active')
  public get active(): boolean {
    return this.view.part.active;
  }

  constructor(public view: WorkbenchView) {
  }
}

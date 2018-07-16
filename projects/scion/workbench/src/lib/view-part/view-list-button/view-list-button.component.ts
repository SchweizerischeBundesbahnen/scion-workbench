/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Component, HostBinding, HostListener } from '@angular/core';
import { WorkbenchViewPartService } from '../workbench-view-part.service';

@Component({
  selector: 'wb-view-list-button',
  templateUrl: './view-list-button.component.html',
  styleUrls: ['./view-list-button.component.scss']
})
export class ViewListButtonComponent {

  @HostBinding('class.visible')
  public get visible(): boolean {
    return this._viewPartService.hiddenViewTabCount > 0;
  }

  constructor(private _viewPartService: WorkbenchViewPartService) {
  }

  @HostListener('click')
  public onClick(): void {
    this._viewPartService.toggleViewList();
  }

  public get hiddenViewTabCount(): number {
    return this._viewPartService.hiddenViewTabCount;
  }
}

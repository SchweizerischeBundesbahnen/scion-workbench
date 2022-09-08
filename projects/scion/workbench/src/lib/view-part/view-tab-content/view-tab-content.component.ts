/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, HostBinding, Inject} from '@angular/core';
import {VIEW_TAB_CONTEXT, ViewTabContext} from '../../workbench.constants';
import {WorkbenchView} from '../../view/workbench-view.model';

@Component({
  selector: 'wb-view-tab-content',
  templateUrl: './view-tab-content.component.html',
  styleUrls: ['./view-tab-content.component.scss'],
})
export class ViewTabContentComponent {

  @HostBinding('attr.context')
  public context: ViewTabContext;

  @HostBinding('class.heading')
  public get hasHeading(): boolean {
    return !!this.view.heading;
  }

  constructor(public view: WorkbenchView, @Inject(VIEW_TAB_CONTEXT) context: ViewTabContext) {
    this.context = context;
  }

  @HostBinding('class.active')
  public get active(): boolean {
    return this.view.active;
  }

  @HostBinding('class.blocked')
  public get blocked(): boolean {
    return this.view.blocked;
  }

  public onClose(event: Event): void {
    event.stopPropagation(); // prevent the view from being activated
    this.view.close().then();
  }
}

/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { AfterViewInit, Component, HostBinding, ViewChild, ViewContainerRef } from '@angular/core';
import { WorkbenchLayoutService } from './workbench-layout.service';
import { OverlayHostRef } from './overlay-host-ref.service';
import { MessageBoxService } from './message-box/message-box.service';

@Component({
  selector: 'wb-workbench',
  templateUrl: './workbench.component.html',
  styleUrls: ['./workbench.component.scss'],
})
export class WorkbenchComponent implements AfterViewInit {

  @ViewChild('overlay_host', {read: ViewContainerRef})
  public host: ViewContainerRef;

  @HostBinding('class.maximized')
  public get maximized(): boolean {
    return this._workbenchLayout.maximized;
  }

  @HostBinding('class.glasspane')
  public get glasspane(): boolean {
    return this._messageBoxService.count > 0;
  }

  constructor(private _workbenchLayout: WorkbenchLayoutService,
              private _overlayHostRef: OverlayHostRef,
              private _messageBoxService: MessageBoxService) {
  }

  public ngAfterViewInit(): void {
    this._overlayHostRef.set(this.host);
  }
}

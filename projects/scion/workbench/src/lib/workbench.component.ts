/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Component, HostBinding, ViewChild, ViewContainerRef } from '@angular/core';
import { WorkbenchLayoutService } from './workbench-layout.service';
import { OverlayHostRef } from './overlay-host-ref.service';
import { MessageBoxService } from './message-box/message-box.service';
import { IFrameHostRef } from './remote-site/iframe-host-ref.service';

@Component({
  selector: 'wb-workbench',
  templateUrl: './workbench.component.html',
  styleUrls: ['./workbench.component.scss'],
})
export class WorkbenchComponent {

  @ViewChild('overlay_host', {read: ViewContainerRef})
  public set overlayHost(overlayHost: ViewContainerRef) {
    this._overlayHostRef.set(overlayHost);
  }

  @ViewChild('iframe_host', {read: ViewContainerRef})
  public set iframeHost(iframeHost: ViewContainerRef) {
    this._iframeHostRef.set(iframeHost);
  }

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
              private _iframeHostRef: IFrameHostRef,
              private _messageBoxService: MessageBoxService) {
  }
}

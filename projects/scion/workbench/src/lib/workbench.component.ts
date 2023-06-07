/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, HostBinding, Inject, ViewChild, ViewContainerRef} from '@angular/core';
import {WorkbenchLayoutService} from './layout/workbench-layout.service';
import {IFRAME_HOST, VIEW_LOCAL_MESSAGE_BOX_HOST, ViewContainerReference} from './content-projection/view-container.reference';
import {WorkbenchLauncher} from './startup/workbench-launcher.service';
import {WorkbenchModuleConfig} from './workbench-module-config';
import {ComponentType} from '@angular/cdk/portal';
import {SplashComponent} from './startup/splash/splash.component';
import {Logger, LoggerNames} from './logging';
import {NgComponentOutlet, NgIf} from '@angular/common';
import {WorkbenchLayoutComponent} from './layout/workbench-layout.component';
import {NotificationListComponent} from './notification/notification-list.component';
import {MessageBoxStackComponent} from './message-box/message-box-stack.component';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

/**
 * Main entry point component of the SCION Workbench.
 */
@Component({
  selector: 'wb-workbench',
  templateUrl: './workbench.component.html',
  styleUrls: ['./workbench.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    NgComponentOutlet,
    WorkbenchLayoutComponent,
    NotificationListComponent,
    MessageBoxStackComponent,
  ],
})
export class WorkbenchComponent {

  @HostBinding('class.starting')
  public workbenchStarting = true;

  @ViewChild('iframe_host', {read: ViewContainerRef})
  public set injectIframeHost(host: ViewContainerRef) {
    host && this._iframeHost.set(host);
  }

  @ViewChild('view_local_message_box_host', {read: ViewContainerRef})
  public set injectLocalMessageBoxHost(host: ViewContainerRef) {
    host && this._viewLocalMessageBoxHost.set(host);
  }

  @HostBinding('class.dragging')
  public dragging = false;

  public splash: ComponentType<any>;

  constructor(private _workbenchLayoutService: WorkbenchLayoutService,
              @Inject(IFRAME_HOST) private _iframeHost: ViewContainerReference,
              @Inject(VIEW_LOCAL_MESSAGE_BOX_HOST) private _viewLocalMessageBoxHost: ViewContainerReference,
              workbenchModuleConfig: WorkbenchModuleConfig,
              workbenchLauncher: WorkbenchLauncher,
              logger: Logger) {
    logger.debug(() => 'Constructing WorkbenchComponent.', LoggerNames.LIFECYCLE);
    // Start the workbench. Has no effect if already started, e.g., in an app initializer or route guard.
    workbenchLauncher.launch().then(() => this.workbenchStarting = false);
    this.splash = workbenchModuleConfig?.startup?.splash || SplashComponent;

    this._workbenchLayoutService.dragging$
      .pipe(takeUntilDestroyed())
      .subscribe(event => {
        this.dragging = (event === 'start');
      });
  }
}

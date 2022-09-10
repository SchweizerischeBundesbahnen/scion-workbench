/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, HostBinding, Inject, OnDestroy, ViewChild, ViewContainerRef} from '@angular/core';
import {WorkbenchLayoutService} from './layout/workbench-layout.service';
import {IFRAME_HOST, VIEW_LOCAL_MESSAGE_BOX_HOST, ViewContainerReference} from './content-projection/view-container.reference';
import {map, takeUntil} from 'rxjs/operators';
import {Observable, Subject} from 'rxjs';
import {WorkbenchActivityPartService} from './activity-part/workbench-activity-part.service';
import {WorkbenchLauncher} from './startup/workbench-launcher.service';
import {WorkbenchModuleConfig} from './workbench-module-config';
import {ComponentType} from '@angular/cdk/portal';
import {SplashComponent} from './startup/splash/splash.component';
import {Logger, LoggerNames} from './logging';

@Component({
  selector: 'wb-workbench',
  templateUrl: './workbench.component.html',
  styleUrls: ['./workbench.component.scss'],
})
export class WorkbenchComponent implements OnDestroy {

  private _destroy$ = new Subject<void>();

  @HostBinding('class.starting')
  public workbenchStarting = true;
  public activitiesVisible$: Observable<boolean>;

  @ViewChild('iframe_host', {read: ViewContainerRef})
  public set injectIframeHost(host: ViewContainerRef) {
    host && this._iframeHost.set(host);
  }

  @ViewChild('view_local_message_box_host', {read: ViewContainerRef})
  public set injectLocalMessageBoxHost(host: ViewContainerRef) {
    host && this._viewLocalMessageBoxHost.set(host);
  }

  @HostBinding('class.maximized')
  public get maximized(): boolean {
    return this._workbenchLayout.maximized;
  }

  @HostBinding('class.dragging')
  public dragging = false;

  public splash: ComponentType<any>;

  constructor(private _workbenchLayout: WorkbenchLayoutService,
              @Inject(IFRAME_HOST) private _iframeHost: ViewContainerReference,
              @Inject(VIEW_LOCAL_MESSAGE_BOX_HOST) private _viewLocalMessageBoxHost: ViewContainerReference,
              workbenchModuleConfig: WorkbenchModuleConfig,
              workbenchLauncher: WorkbenchLauncher,
              activityPartService: WorkbenchActivityPartService,
              logger: Logger) {
    logger.debug(() => 'Constructing WorkbenchComponent.', LoggerNames.LIFECYCLE);
    // Start the workbench. Has no effect if already started, e.g., in an app initializer or route guard.
    workbenchLauncher.launch().then(() => this.workbenchStarting = false);
    this.splash = workbenchModuleConfig?.startup?.splash || SplashComponent;
    this.activitiesVisible$ = activityPartService.activities$
      .pipe(
        map(activities => activities.filter(activity => activity.visible)),
        map(activities => activities.length > 0),
      );

    this._workbenchLayout.dragging$
      .pipe(takeUntil(this._destroy$))
      .subscribe(event => {
        this.dragging = (event === 'start');
      });
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}

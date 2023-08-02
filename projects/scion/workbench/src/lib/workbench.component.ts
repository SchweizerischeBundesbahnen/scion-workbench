/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, HostBinding, inject, OnDestroy, ViewChild, ViewContainerRef} from '@angular/core';
import {WorkbenchLayoutService} from './layout/workbench-layout.service';
import {IFRAME_HOST, VIEW_DROP_PLACEHOLDER_HOST, VIEW_MODAL_MESSAGE_BOX_HOST} from './content-projection/view-container.reference';
import {WorkbenchLauncher, WorkbenchStartup} from './startup/workbench-launcher.service';
import {WorkbenchModuleConfig} from './workbench-module-config';
import {ComponentType} from '@angular/cdk/portal';
import {SplashComponent} from './startup/splash/splash.component';
import {Logger, LoggerNames} from './logging';
import {AsyncPipe, NgComponentOutlet, NgIf} from '@angular/common';
import {WorkbenchLayoutComponent} from './layout/workbench-layout.component';
import {NotificationListComponent} from './notification/notification-list.component';
import {MessageBoxStackComponent} from './message-box/message-box-stack.component';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {combineLatest, lastValueFrom} from 'rxjs';
import {first, map} from 'rxjs/operators';

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
    AsyncPipe,
  ],
})
export class WorkbenchComponent implements OnDestroy {

  /**
   * View containers required for the workbench to attach elements.
   */
  private viewContainerReferences = {
    iframeHost: inject(IFRAME_HOST),
    viewModalMessageBoxHost: inject(VIEW_MODAL_MESSAGE_BOX_HOST),
    viewDropPlaceholderHost: inject(VIEW_DROP_PLACEHOLDER_HOST),
  };

  /**
   * Splash to display during workbench startup.
   */
  protected splash: ComponentType<unknown>;

  /**
   * Promise that resolves once all the required view containers for the workbench to attach elements have been injected from the template.
   *
   * To avoid an `ExpressionChangedAfterItHasBeenCheckedError`, make sure not to add the {@link WorkbenchLayoutComponent} before the relevant
   * view containers have been injected. Otherwise, when loading an existing workbench layout (e.g., from URL) into the workbench, Angular
   * will throw this error because views are rendered before view containers are available.
   */
  protected whenViewContainersInjected: Promise<true>;

  @HostBinding('class.dragging')
  protected dragging = false;

  @ViewChild('iframe_host', {read: ViewContainerRef})
  protected set injectIframeHost(vcr: ViewContainerRef) {
    vcr && this.viewContainerReferences.iframeHost.set(vcr);
  }

  @ViewChild('view_modal_messagebox_host', {read: ViewContainerRef})
  protected set injectViewModalMessageBoxHost(vcr: ViewContainerRef) {
    vcr && this.viewContainerReferences.viewModalMessageBoxHost.set(vcr);
  }

  @ViewChild('view_drop_placeholder_host', {read: ViewContainerRef})
  protected set injectViewDropPlaceholderHost(vcr: ViewContainerRef) {
    vcr && this.viewContainerReferences.viewDropPlaceholderHost.set(vcr);
  }

  constructor(workbenchModuleConfig: WorkbenchModuleConfig,
              private _workbenchLayoutService: WorkbenchLayoutService,
              private _workbenchLauncher: WorkbenchLauncher,
              private _logger: Logger,
              protected workbenchStartup: WorkbenchStartup) {
    this._logger.debug(() => 'Constructing WorkbenchComponent.', LoggerNames.LIFECYCLE);
    this.splash = workbenchModuleConfig?.startup?.splash || SplashComponent;
    this.whenViewContainersInjected = this.createHostViewContainersInjectedPromise();
    this.startWorkbench();
    this.installViewDragDetector();
  }

  /**
   * Starts the SCION Workbench. Has no effect if already started, e.g., in an app initializer or route guard.
   */
  private startWorkbench(): void {
    if (!this.workbenchStartup.isStarted()) {
      this._workbenchLauncher.launch().catch(error => this._logger.error('Failed to start SCION Workbench', error));
    }
  }

  /**
   * Updates {@link dragging} property when start or end dragging a view.
   */
  private installViewDragDetector(): void {
    this._workbenchLayoutService.dragging$
      .pipe(takeUntilDestroyed())
      .subscribe(event => {
        this.dragging = (event === 'start');
      });
  }

  /**
   * Creates a Promise that resolves once all the required view containers for the workbench to attach elements have been injected from the template.
   */
  private createHostViewContainersInjectedPromise(): Promise<true> {
    const references = Object.values(this.viewContainerReferences);
    return lastValueFrom(combineLatest(references.map(reference => reference.ref$))
      .pipe(
        first(vcrs => vcrs.every(Boolean)),
        map(() => true),
      ));
  }

  /**
   * Unsets view container references when this component is destroyed.
   */
  private unsetViewContainerReferences(): void {
    Object.values(this.viewContainerReferences).forEach(ref => ref.unset());
  }

  public ngOnDestroy(): void {
    this.unsetViewContainerReferences();
  }
}

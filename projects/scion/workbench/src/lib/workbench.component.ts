/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, ElementRef, inject, OnDestroy, ViewChild, ViewContainerRef} from '@angular/core';
import {IFRAME_HOST, VIEW_DROP_PLACEHOLDER_HOST, WORKBENCH_ELEMENT_REF} from './content-projection/view-container.reference';
import {WorkbenchLauncher, WorkbenchStartup} from './startup/workbench-launcher.service';
import {WorkbenchModuleConfig} from './workbench-module-config';
import {ComponentType} from '@angular/cdk/portal';
import {SplashComponent} from './startup/splash/splash.component';
import {Logger, LoggerNames} from './logging';
import {AsyncPipe, NgComponentOutlet, NgIf} from '@angular/common';
import {WorkbenchLayoutComponent} from './layout/workbench-layout.component';
import {NotificationListComponent} from './notification/notification-list.component';
import {combineLatest, EMPTY, fromEvent, lastValueFrom, switchMap} from 'rxjs';
import {first, map} from 'rxjs/operators';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {WorkbenchDialogRegistry} from './dialog/workbench-dialog.registry';

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
    AsyncPipe,
  ],
})
export class WorkbenchComponent implements OnDestroy {

  /**
   * View containers required for the workbench to attach elements.
   */
  private viewContainerReferences = {
    workbenchElement: inject(WORKBENCH_ELEMENT_REF),
    iframeHost: inject(IFRAME_HOST),
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

  @ViewChild('iframe_host', {read: ViewContainerRef})
  protected set injectIframeHost(vcr: ViewContainerRef) {
    vcr && this.viewContainerReferences.iframeHost.set(vcr);
  }

  @ViewChild('view_drop_placeholder_host', {read: ViewContainerRef})
  protected set injectViewDropPlaceholderHost(vcr: ViewContainerRef) {
    vcr && this.viewContainerReferences.viewDropPlaceholderHost.set(vcr);
  }

  constructor(workbenchModuleConfig: WorkbenchModuleConfig,
              private _host: ElementRef<HTMLElement>,
              private _workbenchLauncher: WorkbenchLauncher,
              private _workbenchDialogRegistry: WorkbenchDialogRegistry,
              private _logger: Logger,
              protected workbenchStartup: WorkbenchStartup) {
    this._logger.debug(() => 'Constructing WorkbenchComponent.', LoggerNames.LIFECYCLE);
    this.viewContainerReferences.workbenchElement.set(inject(ViewContainerRef));
    this.splash = workbenchModuleConfig?.startup?.splash || SplashComponent;
    this.whenViewContainersInjected = this.createHostViewContainersInjectedPromise();
    this.preventFocusIfBlocked();
    this.startWorkbench();
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
   * Prevent parts of the workbench from gaining focus via sequential keyboard navigation when a dialog overlays it.
   */
  private preventFocusIfBlocked(): void {
    this._workbenchDialogRegistry.top$()
      .pipe(
        switchMap(dialog => dialog ? fromEvent(this._host.nativeElement, 'focusin') : EMPTY),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this._workbenchDialogRegistry.top()!.focus();
      });
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

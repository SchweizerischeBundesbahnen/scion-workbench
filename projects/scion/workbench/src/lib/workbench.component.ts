/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ChangeDetectorRef, Component, ElementRef, inject, OnDestroy, Provider, ViewChild, ViewContainerRef} from '@angular/core';
import {IFRAME_HOST, VIEW_DROP_PLACEHOLDER_HOST, WORKBENCH_ELEMENT_REF} from './content-projection/view-container.reference';
import {WorkbenchLauncher, WorkbenchStartup} from './startup/workbench-launcher.service';
import {WorkbenchConfig} from './workbench-config';
import {ComponentType} from '@angular/cdk/portal';
import {SplashComponent} from './startup/splash/splash.component';
import {Logger, LoggerNames} from './logging';
import {AsyncPipe, DOCUMENT, NgComponentOutlet} from '@angular/common';
import {WorkbenchLayoutComponent} from './layout/workbench-layout.component';
import {NotificationListComponent} from './notification/notification-list.component';
import {combineLatest, lastValueFrom} from 'rxjs';
import {first, map} from 'rxjs/operators';
import {GLASS_PANE_BLOCKABLE, GLASS_PANE_OPTIONS, GLASS_PANE_TARGET_ELEMENT, GlassPaneDirective, GlassPaneOptions} from './glass-pane/glass-pane.directive';
import {WorkbenchDialogRegistry} from './dialog/workbench-dialog.registry';
import {Blockable} from './glass-pane/blockable';
import {WORKBENCH_AUXILIARY_ROUTE_OUTLET} from './routing/workbench-auxiliary-route-installer.service';
import {NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router} from '@angular/router';
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
    AsyncPipe,
    NgComponentOutlet,
    WorkbenchLayoutComponent,
    NotificationListComponent,
    GlassPaneDirective,
  ],
  viewProviders: [
    configureWorkbenchGlassPane(),
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

  constructor(private _workbenchLauncher: WorkbenchLauncher,
              private _logger: Logger,
              protected workbenchStartup: WorkbenchStartup) {
    this._logger.debug(() => 'Constructing WorkbenchComponent.', LoggerNames.LIFECYCLE);
    if (inject(WORKBENCH_AUXILIARY_ROUTE_OUTLET, {optional: true})) {
      throw Error(`[WorkbenchError] Workbench must not be loaded into a view. Did you navigate to the empty path route? Make sure that the application's root route is guarded with 'canMatchWorkbenchView(false)'. Example: "{path: '', canMatch: [canMatchWorkbenchView(false), ...]}"`);
    }
    this.viewContainerReferences.workbenchElement.set(inject(ViewContainerRef));
    this.splash = inject(WorkbenchConfig).startup?.splash || SplashComponent;
    this.whenViewContainersInjected = this.createHostViewContainersInjectedPromise();
    this.startWorkbench();
    this.disableChangeDetectionDuringNavigation();
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
   * Unsets view container references when this component is destroyed.
   */
  private unsetViewContainerReferences(): void {
    Object.values(this.viewContainerReferences).forEach(ref => ref.unset());
  }

  /**
   * Disables change detection during navigation to avoid partial DOM updates of the workbench layout
   * if the navigation is asynchronous (e.g., because of lazy loading, async guards, or resolvers).
   */
  private disableChangeDetectionDuringNavigation(): void {
    const changeDetector = inject(ChangeDetectorRef);

    inject(Router).events
      .pipe(takeUntilDestroyed())
      .subscribe(event => {
        if (event instanceof NavigationStart) {
          changeDetector.detach();
        }
        else if (event instanceof NavigationEnd || event instanceof NavigationError || event instanceof NavigationCancel) {
          changeDetector.reattach();
        }
      });
  }

  public ngOnDestroy(): void {
    this.unsetViewContainerReferences();
  }
}

/**
 * Blocks the workbench or the browser's viewport when opening an application-modal dialog.
 */
function configureWorkbenchGlassPane(): Provider[] {
  return [
    {
      provide: GLASS_PANE_BLOCKABLE,
      useFactory: (): Blockable => ({
        blockedBy$: inject(WorkbenchDialogRegistry).top$(),
      }),
    },
    {
      provide: GLASS_PANE_TARGET_ELEMENT,
      useFactory: () => {
        if (inject(WorkbenchConfig).dialog?.modalityScope === 'viewport') {
          return inject(DOCUMENT).body;
        }
        else {
          return inject(ElementRef);
        }
      },
    },
    {
      provide: GLASS_PANE_OPTIONS,
      useValue: {cssClass: 'e2e-workbench'} satisfies GlassPaneOptions,
    },
  ];
}

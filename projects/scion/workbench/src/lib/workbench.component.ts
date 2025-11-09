/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ChangeDetectorRef, Component, DestroyRef, DOCUMENT, effect, ElementRef, inject, NgZone, Provider, viewChild, ViewContainerRef} from '@angular/core';
import {IFRAME_OVERLAY_HOST, VIEW_DROP_ZONE_OVERLAY_HOST, WORKBENCH_COMPONENT_REF} from './workbench-element-references';
import {WorkbenchLauncher} from './startup/workbench-launcher.service';
import {WorkbenchStartup} from './startup/workbench-startup.service';
import {WorkbenchConfig} from './workbench-config';
import {SplashComponent} from './startup/splash/splash.component';
import {Logger, LoggerNames} from './logging';
import {NgComponentOutlet} from '@angular/common';
import {NotificationListComponent} from './notification/notification-list.component';
import {GLASS_PANE_BLOCKABLE, GLASS_PANE_OPTIONS, GLASS_PANE_TARGET_ELEMENT, GlassPaneDirective, GlassPaneOptions} from './glass-pane/glass-pane.directive';
import {WorkbenchDialogRegistry} from './dialog/workbench-dialog.registry';
import {Blockable} from './glass-pane/blockable';
import {WORKBENCH_OUTLET} from './routing/workbench-auxiliary-route-installer.service';
import {NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router} from '@angular/router';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {LayoutComponent} from './layout/layout.component';
import {ɵWorkbenchService} from './ɵworkbench.service';
import {fromEvent} from 'rxjs';
import {ɵWorkbenchRouter} from './routing/ɵworkbench-router.service';
import {subscribeIn} from '@scion/toolkit/operators';
import {filter} from 'rxjs/operators';

/**
 * Main entry point component of the SCION Workbench.
 */
@Component({
  selector: 'wb-workbench',
  templateUrl: './workbench.component.html',
  styleUrls: ['./workbench.component.scss'],
  imports: [
    NgComponentOutlet,
    NotificationListComponent,
    GlassPaneDirective,
    LayoutComponent,
  ],
  viewProviders: [
    configureWorkbenchGlassPane(),
  ],
})
export class WorkbenchComponent {

  private _workbenchLauncher = inject(WorkbenchLauncher);
  private _logger = inject(Logger);
  private readonly _workbenchRouter = inject(ɵWorkbenchRouter);

  private _iframeOverlayHost = viewChild('iframe_overlay_host', {read: ViewContainerRef});
  private _viewDropZoneOverlayHost = viewChild('view_drop_zone_overlay_host', {read: ViewContainerRef});

  /** Splash to display during workbench startup. */
  protected splash = inject(WorkbenchConfig).splashComponent ?? inject(WorkbenchConfig).startup?.splash ?? SplashComponent;
  protected workbenchStartup = inject(WorkbenchStartup);
  protected workbenchService = inject(ɵWorkbenchService);

  constructor() {
    this._logger.debug(() => 'Constructing WorkbenchComponent.', LoggerNames.LIFECYCLE);
    this.throwOnCircularLoad();
    this.startWorkbench();
    this.disableChangeDetectionDuringNavigation();
    this.provideWorkbenchElementReferences();
    this.installMaximizeShortcutListener();
  }

  /**
   * Toggles layout maximization by pressing Ctrl+Shift+F12.
   */
  private installMaximizeShortcutListener(): void {
    const zone = inject(NgZone);
    fromEvent<KeyboardEvent>(window, 'keydown', {capture: true}) // capturing phase for a higher precedence
      .pipe(
        subscribeIn(fn => zone.runOutsideAngular(fn)),
        filter(event => event.ctrlKey && event.shiftKey && event.key === 'F12'),
        takeUntilDestroyed(),
      )
      .subscribe(event => {
        event.preventDefault();
        void this._workbenchRouter.navigate(layout => layout.toggleMaximized());
      });
  }

  /**
   * Starts the SCION Workbench. Has no effect if already started, e.g., in an app initializer or route guard.
   */
  private startWorkbench(): void {
    if (!this.workbenchStartup.done()) {
      this._workbenchLauncher.launch().catch((error: unknown) => this._logger.error('Failed to start SCION Workbench', error));
    }
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

  /**
   * Initializes tokens to inject references to workbench elements.
   */
  private provideWorkbenchElementReferences(): void {
    // Provide reference to the workbench element.
    const workbenchComponentRef = inject(WORKBENCH_COMPONENT_REF);
    workbenchComponentRef.set(inject(ViewContainerRef));
    inject(DestroyRef).onDestroy(() => workbenchComponentRef.set(undefined));

    // Provide reference to the iframe overlay host.
    const iframeOverlayHost = inject(IFRAME_OVERLAY_HOST);
    effect(() => iframeOverlayHost.set(this._iframeOverlayHost()));
    inject(DestroyRef).onDestroy(() => iframeOverlayHost.set(undefined));

    // Provide reference to the view drop zone overlay host.
    const viewDropZoneOverlayHost = inject(VIEW_DROP_ZONE_OVERLAY_HOST);
    effect(() => viewDropZoneOverlayHost.set(this._viewDropZoneOverlayHost()));
    inject(DestroyRef).onDestroy(() => viewDropZoneOverlayHost.set(undefined));
  }

  /**
   * Throws if loading the workbench recursively.
   */
  private throwOnCircularLoad(): void {
    const outlet = inject(WORKBENCH_OUTLET, {optional: true});
    if (!outlet) {
      return;
    }

    throw Error(`[WorkbenchError] Circular loading of the workbench component detected in workbench outlet '${outlet}'. Did you forget to add the CanMatch guard 'canMatchWorkbenchOutlet(false)' to the application's empty-path default route?`);
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
        blockedBy: inject(WorkbenchDialogRegistry).top(),
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

/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { ANALYZE_FOR_ENTRY_COMPONENTS, Inject, InjectionToken, ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkbenchComponent } from './workbench.component';
import { ActivityPartComponent } from './activity-part/activity-part.component';
import { SashDirective } from './sash.directive';
import { WorkbenchActivityPartService } from './activity-part/workbench-activity-part.service';
import { ViewPartComponent } from './view-part/view-part.component';
import { PortalModule } from '@angular/cdk/portal';
import { ViewTabComponent } from './view-part/view-tab/view-tab.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ViewListComponent } from './view-part/view-list/view-list.component';
import { ViewListButtonComponent } from './view-part/view-list-button/view-list-button.component';
import { ViewPartBarComponent } from './view-part/view-part-bar/view-part-bar.component';
import { InternalWorkbenchService, WorkbenchService } from './workbench.service';
import { DropZoneDirective } from './view-part-grid/drop-zone.directive';
import { ViewPartGridComponent } from './view-part-grid/view-part-grid.component';
import { RemoteSiteComponent } from './remote-site/remote-site.component';
import { WorkbenchLayoutService } from './workbench-layout.service';
import { ViewComponent } from './view/view.component';
import { WbRouterOutletDirective } from './routing/wb-router-outlet.directive';
import { ViewPartSashBoxComponent } from './view-part-sash-box/view-part-sash-box.component';
import { ViewPartGridSerializerService } from './view-part-grid/view-part-grid-serializer.service';
import { WbPortalOutletComponent } from './portal/wb-portal-outlet.component';
import { ViewPartGridUrlObserver } from './view-part-grid/view-part-grid-url-observer.service';
import { WbBeforeDestroyGuard } from './view/wb-before-destroy.guard';
import { RouteReuseStrategy, RouterModule } from '@angular/router';
import { InternalWorkbenchRouter, WorkbenchRouter } from './routing/workbench-router.service';
import { WbRouterLinkDirective, WbRouterLinkWithHrefDirective } from './routing/wb-router-link.directive';
import { WorkbenchViewRegistry } from './workbench-view-registry.service';
import { OverlayHostRef } from './overlay-host-ref.service';
import { ViewOutletUrlObserver } from './routing/view-outlet-url-observer.service';
import { WbActivityActionDirective } from './activity-part/wb-activity-action.directive';
import { WbActivityDirective } from './activity-part/wb-activity.directive';
import { MoveDirective } from './move.directive';
import { WorkbenchConfig } from './workbench.config';
import { TemplateHostOverlayDirective } from './content-projection/template-host-overlay.directive';
import { ContentAsOverlayComponent } from './content-projection/content-as-overlay.component';
import { ROUTE_REUSE_PROVIDER, WORKBENCH_FORROOT_GUARD } from './workbench.constants';
import { NotificationService } from './notification/notification.service';
import { NotificationListComponent } from './notification/notification-list.component';
import { NotificationComponent } from './notification/notification.component';
import { MessageBoxStackComponent } from './message-box/message-box-stack.component';
import { MessageBoxComponent } from './message-box/message-box.component';
import { APP_MESSAGE_BOX_SERVICE, MessageBoxService } from './message-box/message-box.service';
import { EmptyOutletComponent } from './routing/empty-outlet.component';
import { ViewRegistrySynchronizer } from './routing/view-registry-synchronizer.service';
import { WbActivityRouteReuseProvider } from './routing/wb-activity-route-reuse-provider.service';
import { WbRouteReuseStrategy } from './routing/wb-route-reuse-strategy.service';
import { SciViewportModule } from '@scion/viewport';
import { SciDimensionModule } from '@scion/dimension';
import { ActivityResolver } from './routing/activity.resolver';
import { ContentHostRef } from './content-projection/content-host-ref.service';
import { WorkbenchAuxiliaryRoutesRegistrator } from './routing/workbench-auxiliary-routes-registrator.service';
import { OverlayModule } from '@angular/cdk/overlay';
import { FullScreenModeComponent } from './full-screen-mode/full-screen-mode.component';
import { FullScreenModeService } from './full-screen-mode/full-screen-mode.service';

const CONFIG = new InjectionToken<WorkbenchConfig>('WORKBENCH_CONFIG');

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([]),
    PortalModule,
    ReactiveFormsModule,
    SciViewportModule,
    SciDimensionModule,
    OverlayModule,
  ],
  declarations: [
    WorkbenchComponent,
    ActivityPartComponent,
    WbActivityDirective,
    WbActivityActionDirective,
    ViewPartComponent,
    ViewComponent,
    ViewPartBarComponent,
    ViewTabComponent,
    ViewListButtonComponent,
    ViewListComponent,
    ViewPartGridComponent,
    SashDirective,
    ViewPartSashBoxComponent,
    DropZoneDirective,
    WbPortalOutletComponent,
    RemoteSiteComponent,
    WbRouterOutletDirective,
    WbRouterLinkDirective,
    WbRouterLinkWithHrefDirective,
    NotificationListComponent,
    NotificationComponent,
    MessageBoxStackComponent,
    MessageBoxComponent,
    MoveDirective,
    TemplateHostOverlayDirective,
    EmptyOutletComponent,
    ContentAsOverlayComponent,
    FullScreenModeComponent,
  ],
  exports: [
    WorkbenchComponent,
    WbActivityDirective,
    WbActivityActionDirective,
    SashDirective,
    WbRouterLinkDirective,
    WbRouterLinkWithHrefDirective,
    RemoteSiteComponent,
    ContentAsOverlayComponent,
  ]
})
export class WorkbenchModule {

  // Note: We are injecting {WorkbenchAuxiliaryRoutesRegistrator} and {ViewRegistrySynchronizer} so they get created eagerly...
  constructor(@Optional() @Inject(WORKBENCH_FORROOT_GUARD) guard: any,
              auxiliaryRoutesRegistrator: WorkbenchAuxiliaryRoutesRegistrator,
              viewRegistrySynchronizer: ViewRegistrySynchronizer) {
  }

  /**
   * To manifest a dependency to the 'workbench.module' from application module, AppModule.
   *
   * Call `forRoot` only in the root application module. Calling it in any other module, particularly in a lazy-loaded module, will produce a runtime error.
   *
   * ```
   * @NgModule({
   *   declarations: [
   *     ...
   *   ],
   *   imports: [
   *     ...
   *     WorkbenchModule.forRoot()
   *   ],
   *   providers: [
   *     ...
   *   ],
   *   bootstrap: [AppComponent],
   * })
   * export class AppModule { }
   * ```
   */
  public static forRoot(config: WorkbenchConfig = {}): ModuleWithProviders {
    return {
      ngModule: WorkbenchModule,
      providers: [
        InternalWorkbenchService,
        {
          provide: WorkbenchService, useExisting: InternalWorkbenchService
        },
        WorkbenchLayoutService,
        WorkbenchActivityPartService,
        WorkbenchAuxiliaryRoutesRegistrator,
        ActivityResolver,
        NotificationService,
        MessageBoxService,
        ViewPartGridSerializerService,
        ViewOutletUrlObserver,
        ViewPartGridUrlObserver,
        WbBeforeDestroyGuard,
        WorkbenchViewRegistry,
        ViewRegistrySynchronizer,
        OverlayHostRef,
        ContentHostRef,
        FullScreenModeService,
        InternalWorkbenchRouter,
        {
          provide: WorkbenchRouter, useExisting: InternalWorkbenchRouter
        },
        {
          provide: APP_MESSAGE_BOX_SERVICE,
          useExisting: MessageBoxService
        },
        {provide: CONFIG, useValue: config}, // required because function calls not supported in AOT build
        {
          provide: WorkbenchConfig,
          useFactory: newConfig,
          deps: [CONFIG]
        },
        {
          provide: ANALYZE_FOR_ENTRY_COMPONENTS,
          multi: true,
          useValue: ViewPartComponent
        },
        {
          provide: ANALYZE_FOR_ENTRY_COMPONENTS,
          multi: true,
          useValue: ViewComponent
        },
        {
          provide: ANALYZE_FOR_ENTRY_COMPONENTS,
          multi: true,
          useValue: EmptyOutletComponent
        },
        {
          provide: ANALYZE_FOR_ENTRY_COMPONENTS,
          multi: true,
          useValue: ViewListComponent,
        },
        {
          provide: ROUTE_REUSE_PROVIDER,
          multi: true,
          useClass: WbActivityRouteReuseProvider
        },
        {
          provide: RouteReuseStrategy,
          useClass: WbRouteReuseStrategy,
        },
        {
          provide: WORKBENCH_FORROOT_GUARD,
          useFactory: provideForRootGuard,
          deps: [[WorkbenchService, new Optional(), new SkipSelf()]]
        },
      ]
    };
  }

  /**
   * To manifest a dependency to the 'workbench.module' from within a feature module.
   */
  public static forChild(): ModuleWithProviders {
    return {
      ngModule: WorkbenchModule,
      providers: [] // do not register any providers in 'forChild' but in 'forRoot' instead
    };
  }
}

export function provideForRootGuard(workbench: WorkbenchService): any {
  if (workbench) {
    throw new Error('[ModuleForRootError] WorkbenchModule.forRoot() called twice. Lazy loaded modules should use WorkbenchModule.forChild() instead.');
  }
  return 'guarded';
}

export function newConfig(config: WorkbenchConfig): WorkbenchConfig {
  return new WorkbenchConfig(config);
}

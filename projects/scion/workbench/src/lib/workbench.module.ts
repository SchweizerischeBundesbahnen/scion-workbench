/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Inject, ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
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
import { ViewDropZoneDirective } from './view-dnd/view-drop-zone.directive';
import { PartsLayoutComponent } from './layout/parts-layout.component';
import { RemoteSiteComponent } from './remote-site/remote-site.component';
import { WorkbenchLayoutService } from './workbench-layout.service';
import { ViewComponent } from './view/view.component';
import { WbRouterOutletDirective } from './routing/wb-router-outlet.directive';
import { TreeNodeComponent } from './layout/tree-node.component';
import { WbPortalOutletComponent } from './portal/wb-portal-outlet.component';
import { RouteReuseStrategy, RouterModule } from '@angular/router';
import { WorkbenchRouter } from './routing/workbench-router.service';
import { WbRouterLinkDirective, WbRouterLinkWithHrefDirective } from './routing/wb-router-link.directive';
import { WorkbenchViewRegistry } from './view/workbench-view.registry';
import { OverlayHostRef } from './overlay-host-ref.service';
import { WorkbenchUrlObserver } from './workbench-url-observer.service';
import { WbActivityActionDirective } from './activity-part/wb-activity-action.directive';
import { WbActivityDirective } from './activity-part/wb-activity.directive';
import { MoveDirective } from './move.directive';
import { WorkbenchConfig } from './workbench.config';
import { TemplateHostOverlayDirective } from './content-projection/template-host-overlay.directive';
import { ContentAsOverlayComponent } from './content-projection/content-as-overlay.component';
import { ROUTE_REUSE_PROVIDER, VIEW_COMPONENT_TYPE, VIEW_PART_COMPONENT_TYPE, WORKBENCH, WORKBENCH_FORROOT_GUARD } from './workbench.constants';
import { NotificationService } from './notification/notification.service';
import { NotificationListComponent } from './notification/notification-list.component';
import { NotificationComponent } from './notification/notification.component';
import { MessageBoxStackComponent } from './message-box/message-box-stack.component';
import { MessageBoxComponent } from './message-box/message-box.component';
import { APP_MESSAGE_BOX_SERVICE, MessageBoxService } from './message-box/message-box.service';
import { EmptyOutletComponent } from './routing/empty-outlet.component';
import { WbActivityRouteReuseProvider } from './routing/wb-activity-route-reuse-provider.service';
import { WbRouteReuseStrategy } from './routing/wb-route-reuse-strategy.service';
import { SciViewportModule } from '@scion/toolkit/viewport';
import { SciDimensionModule } from '@scion/toolkit/dimension';
import { SciSashboxModule } from '@scion/toolkit/sashbox';
import { ActivityResolver } from './routing/activity.resolver';
import { ContentHostRef } from './content-projection/content-host-ref.service';
import { WorkbenchAuxiliaryRoutesRegistrator } from './routing/workbench-auxiliary-routes-registrator.service';
import { OverlayModule } from '@angular/cdk/overlay';
import { PopupService } from './popup/popup.service';
import { A11yModule } from '@angular/cdk/a11y';
import { ViewPartActionDirective } from './view-part/view-part-action-bar/view-part-action.directive';
import { ViewPartActionBarComponent } from './view-part/view-part-action-bar/view-part-action-bar.component';
import { TaskScheduler } from './task-scheduler.service';
import { WorkbenchViewPartRegistry } from './view-part/workbench-view-part.registry';
import { ViewActivationInstantProvider } from './view-activation-instant-provider.service';
import { ViewTabContentComponent } from './view-part/view-tab-content/view-tab-content.component';
import { ViewOutletNavigator } from './routing/view-outlet-navigator.service';
import { ViewMenuComponent } from './view-part/view-context-menu/view-menu.component';
import { ViewMenuItemDirective } from './view-part/view-context-menu/view-menu.directive';
import { WbFormatAcceleratorPipe } from './view-part/view-context-menu/accelerator-format.pipe';
import { TextComponent } from './view-part/view-context-menu/text.component';
import { ViewMenuService } from './view-part/view-context-menu/view-menu.service';
import { ArrayCoercePipe } from './array-coerce.pipe';
import { ArrayConcatPipe } from './array-concat.pipe';
import { ViewPortalPipe } from './view/view-portal.pipe';
import { PartsLayoutFactory } from './layout/parts-layout.factory';
import { ViewDropHandler } from './layout/view-drop-handler.service';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([]),
    PortalModule,
    ReactiveFormsModule,
    SciViewportModule,
    SciDimensionModule,
    SciSashboxModule,
    OverlayModule,
    A11yModule,
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
    ViewTabContentComponent,
    ViewListButtonComponent,
    ViewListComponent,
    PartsLayoutComponent,
    SashDirective,
    TreeNodeComponent,
    ViewDropZoneDirective,
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
    ViewPartActionDirective,
    ViewPartActionBarComponent,
    ViewMenuComponent,
    ViewMenuItemDirective,
    WbFormatAcceleratorPipe,
    TextComponent,
    ArrayCoercePipe,
    ArrayConcatPipe,
    ViewPortalPipe,
  ],
  exports: [
    WorkbenchComponent,
    WbActivityDirective,
    WbActivityActionDirective,
    WbRouterLinkDirective,
    WbRouterLinkWithHrefDirective,
    RemoteSiteComponent,
    ContentAsOverlayComponent,
    ViewPartActionDirective,
    ViewMenuItemDirective,
  ],
})
export class WorkbenchModule {

  // Note: Inject services which should be created eagerly.
  constructor(@Optional() @Inject(WORKBENCH_FORROOT_GUARD) guard: any,
              auxiliaryRoutesRegistrator: WorkbenchAuxiliaryRoutesRegistrator,
              workbenchUrlObserver: WorkbenchUrlObserver,
              viewMenuService: ViewMenuService,
              viewDropService: ViewDropHandler) {
    auxiliaryRoutesRegistrator.registerActivityAuxiliaryRoutes();
    viewMenuService.registerBuiltInMenuItems();
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
  public static forRoot(config: WorkbenchConfig = {}): ModuleWithProviders<WorkbenchModule> {
    return {
      ngModule: WorkbenchModule,
      providers: [
        InternalWorkbenchService,
        {
          provide: WorkbenchService, useExisting: InternalWorkbenchService,
        },
        {
          provide: WORKBENCH, useExisting: InternalWorkbenchService,
        },
        {
          provide: VIEW_PART_COMPONENT_TYPE, useValue: ViewPartComponent,
        },
        {
          provide: VIEW_COMPONENT_TYPE, useValue: ViewComponent,
        },
        WorkbenchLayoutService,
        WorkbenchActivityPartService,
        WorkbenchAuxiliaryRoutesRegistrator,
        ActivityResolver,
        NotificationService,
        MessageBoxService,
        WorkbenchUrlObserver,
        WorkbenchViewRegistry,
        WorkbenchViewPartRegistry,
        OverlayHostRef,
        ContentHostRef,
        WorkbenchRouter,
        ViewOutletNavigator,
        PopupService,
        TaskScheduler,
        ViewActivationInstantProvider,
        PartsLayoutFactory,
        {
          provide: APP_MESSAGE_BOX_SERVICE,
          useExisting: MessageBoxService,
        },
        {provide: WorkbenchConfig, useValue: config},
        {
          provide: ROUTE_REUSE_PROVIDER,
          multi: true,
          useClass: WbActivityRouteReuseProvider,
        },
        {
          provide: RouteReuseStrategy,
          useClass: WbRouteReuseStrategy,
        },
        {
          provide: WORKBENCH_FORROOT_GUARD,
          useFactory: provideForRootGuard,
          deps: [[WorkbenchService, new Optional(), new SkipSelf()]],
        },
      ],
    };
  }

  /**
   * To manifest a dependency to the 'workbench.module' from within a feature module.
   */
  public static forChild(): ModuleWithProviders<WorkbenchModule> {
    return {
      ngModule: WorkbenchModule,
      providers: [], // do not register any providers in 'forChild' but in 'forRoot' instead
    };
  }
}

export function provideForRootGuard(workbench: WorkbenchService): any {
  if (workbench) {
    throw new Error('[ModuleForRootError] WorkbenchModule.forRoot() called twice. Lazy loaded modules should use WorkbenchModule.forChild() instead.');
  }
  return 'guarded';
}


/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, Inject, Injector, ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
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
import { WorkbenchService } from './workbench.service';
import { ViewDropZoneDirective } from './view-dnd/view-drop-zone.directive';
import { PartsLayoutComponent } from './layout/parts-layout.component';
import { WorkbenchLayoutService } from './layout/workbench-layout.service';
import { ViewComponent } from './view/view.component';
import { WbRouterOutletDirective } from './routing/wb-router-outlet.directive';
import { TreeNodeComponent } from './layout/tree-node.component';
import { WbPortalOutletComponent } from './portal/wb-portal-outlet.component';
import { RouteReuseStrategy, RouterModule } from '@angular/router';
import { WorkbenchRouter } from './routing/workbench-router.service';
import { WbRouterLinkDirective, WbRouterLinkWithHrefDirective } from './routing/wb-router-link.directive';
import { WorkbenchViewRegistry } from './view/workbench-view.registry';
import { WorkbenchUrlObserver } from './routing/workbench-url-observer.service';
import { WbActivityActionDirective } from './activity-part/wb-activity-action.directive';
import { WbActivityDirective } from './activity-part/wb-activity.directive';
import { WorkbenchModuleConfig } from './workbench-module-config';
import { ContentProjectionDirective } from './content-projection/content-projection.directive';
import { ContentAsOverlayComponent } from './content-projection/content-as-overlay.component';
import { ROUTE_REUSE_PROVIDER, WORKBENCH_FORROOT_GUARD } from './workbench.constants';
import { EmptyOutletComponent } from './routing/empty-outlet.component';
import { WbActivityRouteReuseProvider } from './routing/wb-activity-route-reuse-provider.service';
import { WbRouteReuseStrategy } from './routing/wb-route-reuse-strategy.service';
import { SciViewportModule } from '@scion/toolkit/viewport';
import { SciDimensionModule } from '@scion/toolkit/dimension';
import { SciSashboxModule } from '@scion/toolkit/sashbox';
import { SciThrobberModule } from '@scion/toolkit/throbber';
import { ActivityResolver } from './routing/activity.resolver';
import { WorkbenchAuxiliaryRoutesRegistrator } from './routing/workbench-auxiliary-routes-registrator.service';
import { OverlayModule } from '@angular/cdk/overlay';
import { PopupService } from './popup/popup.service';
import { A11yModule } from '@angular/cdk/a11y';
import { ViewPartActionDirective } from './view-part/view-part-action-bar/view-part-action.directive';
import { ViewPartActionBarComponent } from './view-part/view-part-action-bar/view-part-action-bar.component';
import { WorkbenchViewPartRegistry } from './view-part/workbench-view-part.registry';
import { ViewActivationInstantProvider } from './view/view-activation-instant-provider.service';
import { ViewTabContentComponent } from './view-part/view-tab-content/view-tab-content.component';
import { ViewMenuComponent } from './view-part/view-context-menu/view-menu.component';
import { ViewMenuItemDirective } from './view-part/view-context-menu/view-menu.directive';
import { WbFormatAcceleratorPipe } from './view-part/view-context-menu/accelerator-format.pipe';
import { TextComponent } from './view-part/view-context-menu/text.component';
import { ViewMenuService } from './view-part/view-context-menu/view-menu.service';
import { ArrayCoercePipe } from './array-coerce.pipe';
import { ArrayConcatPipe } from './array-concat.pipe';
import { ViewPortalPipe } from './view/view-portal.pipe';
import { PartsLayoutFactory } from './layout/parts-layout.factory';
import { ViewMoveHandler } from './view/view-move-handler.service';
import { ɵWorkbenchService } from './ɵworkbench.service';
import { WorkbenchLayoutDiffer } from './routing/workbench-layout-differ';
import { provideWorkbenchMicrofrontendSupport } from './microfrontend-platform/workbench-microfrontend-support';
import { provideWorkbenchLauncher } from './startup/workbench-launcher.service';
import { MicrofrontendViewComponent } from './microfrontend-platform/microfrontend-view/microfrontend-view.component';
import { SplashComponent } from './startup/splash/splash.component';
import { provideLogging } from './logging';
import { IFRAME_HOST, VIEW_LOCAL_MESSAGE_BOX_HOST, ViewContainerReference } from './content-projection/view-container.reference';
import { MicrofrontendViewRoutes } from './microfrontend-platform/routing/microfrontend-routes';
import { SafeRunner } from './safe-runner';
import { BroadcastChannelService } from './broadcast-channel.service';
import { WbAddViewToPartGuard } from './routing/add-view-to-part.guard';
import { WbBeforeDestroyGuard } from './view/wb-before-destroy.guard';
import { ViewDragService } from './view-dnd/view-drag.service';
import { ViewTabDragImageRenderer } from './view-dnd/view-tab-drag-image-renderer.service';
import { PopupComponent } from './popup/popup.component';
import { MicrofrontendPopupComponent } from './microfrontend-platform/microfrontend-popup/microfrontend-popup.component';
import { MessageBoxModule } from './message-box/message-box.module';
import { NotificationModule } from './notification/notification.module';
import { WORKBENCH_POST_STARTUP } from './startup/workbench-initializer';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      ...MicrofrontendViewRoutes.config,
    ]),
    PortalModule,
    ReactiveFormsModule,
    SciViewportModule,
    SciDimensionModule,
    SciSashboxModule,
    SciThrobberModule,
    OverlayModule,
    A11yModule,
    MessageBoxModule,
    NotificationModule,
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
    WbRouterOutletDirective,
    WbRouterLinkDirective,
    WbRouterLinkWithHrefDirective,
    ContentProjectionDirective,
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
    MicrofrontendViewComponent,
    MicrofrontendPopupComponent,
    SplashComponent,
    PopupComponent,
  ],
  exports: [
    WorkbenchComponent,
    WbActivityDirective,
    WbActivityActionDirective,
    WbRouterLinkDirective,
    WbRouterLinkWithHrefDirective,
    ContentAsOverlayComponent,
    ViewPartActionDirective,
    ViewMenuItemDirective,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // required because <sci-router-outlet> is a web component
})
export class WorkbenchModule {

  constructor(@Inject(WORKBENCH_FORROOT_GUARD) guard: any) {
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
  public static forRoot(config: WorkbenchModuleConfig = {}): ModuleWithProviders<WorkbenchModule> {
    return {
      ngModule: WorkbenchModule,
      providers: [
        {provide: WorkbenchModuleConfig, useValue: config},
        ɵWorkbenchService,
        {
          provide: WorkbenchService, useExisting: ɵWorkbenchService,
        },
        WorkbenchLayoutService,
        WorkbenchLayoutDiffer,
        WorkbenchActivityPartService,
        WorkbenchAuxiliaryRoutesRegistrator,
        ActivityResolver,
        WorkbenchUrlObserver,
        WorkbenchViewRegistry,
        WorkbenchViewPartRegistry,
        WorkbenchRouter,
        PopupService,
        ViewActivationInstantProvider,
        PartsLayoutFactory,
        ViewMenuService,
        ViewContainerReference,
        ViewMoveHandler,
        SafeRunner,
        BroadcastChannelService,
        WbAddViewToPartGuard,
        WbBeforeDestroyGuard,
        ViewDragService,
        ViewTabDragImageRenderer,
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
        {
          provide: WORKBENCH_POST_STARTUP,
          useExisting: ViewMenuService,
          multi: true,
        },
        {
          provide: IFRAME_HOST,
          useClass: ViewContainerReference,
        },
        {
          provide: VIEW_LOCAL_MESSAGE_BOX_HOST,
          useClass: ViewContainerReference,
        },
        {
          provide: APP_INITIALIZER,
          useFactory: installWorkbenchRouting,
          multi: true,
          deps: [Injector],
        },
        {
          provide: WORKBENCH_POST_STARTUP,
          useExisting: ViewMoveHandler,
          multi: true,
        },
        provideWorkbenchLauncher(config),
        provideWorkbenchMicrofrontendSupport(config),
        provideLogging(config),
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

/**
 * @docs-private Not public API, intended for internal use only.
 */
export function provideForRootGuard(workbench: WorkbenchService): any {
  if (workbench) {
    throw new Error('[ModuleForRootError] WorkbenchModule.forRoot() called twice. Lazy loaded modules should use WorkbenchModule.forChild() instead.');
  }
  return 'guarded';
}

/**
 * Workbench routing needs to be installed before Angular performs the initial navigation.
 *
 * @docs-private Not public API, intended for internal use only.
 */
export function installWorkbenchRouting(injector: Injector): () => void {
  // Angular is very strict when compiling module definitions ahead-of-time.
  // We cannot return the lamda directly as this would break the AOT build. Instead, we add a redundant assignment.
  const fn = () => {
    injector.get(WorkbenchUrlObserver);
    injector.get(WorkbenchAuxiliaryRoutesRegistrator).registerActivityAuxiliaryRoutes();
  };
  return fn;
}

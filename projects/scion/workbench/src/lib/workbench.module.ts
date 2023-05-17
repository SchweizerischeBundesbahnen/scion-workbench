/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {CUSTOM_ELEMENTS_SCHEMA, ENVIRONMENT_INITIALIZER, inject, Inject, ModuleWithProviders, NgModule, Optional, SkipSelf} from '@angular/core';
import {CommonModule} from '@angular/common';
import {WorkbenchComponent} from './workbench.component';
import {SashDirective} from './sash.directive';
import {PartComponent} from './part/part.component';
import {PortalModule} from '@angular/cdk/portal';
import {ViewTabComponent} from './part/view-tab/view-tab.component';
import {ReactiveFormsModule} from '@angular/forms';
import {ViewListComponent} from './part/view-list/view-list.component';
import {ViewListButtonComponent} from './part/view-list-button/view-list-button.component';
import {PartBarComponent} from './part/part-bar/part-bar.component';
import {WorkbenchService} from './workbench.service';
import {ViewDropZoneDirective} from './view-dnd/view-drop-zone.directive';
import {WorkbenchLayoutService} from './layout/workbench-layout.service';
import {ViewComponent} from './view/view.component';
import {WorkbenchPortalOutletDirective} from './portal/workbench-portal-outlet.directive';
import {RouterModule} from '@angular/router';
import {provideWorkbenchRouter} from './routing/workbench-router.service';
import {WorkbenchRouterLinkDirective} from './routing/workbench-router-link.directive';
import {WorkbenchViewRegistry} from './view/workbench-view.registry';
import {WorkbenchUrlObserver} from './routing/workbench-url-observer.service';
import {WorkbenchModuleConfig} from './workbench-module-config';
import {ContentProjectionDirective} from './content-projection/content-projection.directive';
import {ContentAsOverlayComponent} from './content-projection/content-as-overlay.component';
import {WORKBENCH_FORROOT_GUARD} from './workbench.constants';
import {SciViewportModule} from '@scion/components/viewport';
import {SciDimensionModule} from '@scion/components/dimension';
import {SciSashboxModule} from '@scion/components/sashbox';
import {SciThrobberModule} from '@scion/components/throbber';
import {WorkbenchAuxiliaryRoutesRegistrator} from './routing/workbench-auxiliary-routes-registrator.service';
import {OverlayModule} from '@angular/cdk/overlay';
import {PopupService} from './popup/popup.service';
import {A11yModule} from '@angular/cdk/a11y';
import {WorkbenchPartActionDirective} from './part/part-action-bar/part-action.directive';
import {PartActionBarComponent} from './part/part-action-bar/part-action-bar.component';
import {WorkbenchPartRegistry} from './part/workbench-part.registry';
import {ViewTabContentComponent} from './part/view-tab-content/view-tab-content.component';
import {ViewMenuComponent} from './part/view-context-menu/view-menu.component';
import {WorkbenchViewMenuItemDirective} from './part/view-context-menu/view-menu.directive';
import {WbFormatAcceleratorPipe} from './part/view-context-menu/accelerator-format.pipe';
import {TextComponent} from './part/view-context-menu/text.component';
import {ViewMenuService} from './part/view-context-menu/view-menu.service';
import {ArrayCoercePipe} from './array-coerce.pipe';
import {ArrayConcatPipe} from './array-concat.pipe';
import {ViewPortalPipe} from './view/view-portal.pipe';
import {WorkbenchLayoutFactory} from './layout/workbench-layout-factory.service';
import {ViewMoveHandler} from './view/view-move-handler.service';
import {ɵWorkbenchService} from './ɵworkbench.service';
import {WorkbenchLayoutDiffer} from './routing/workbench-layout-differ';
import {WorkbenchPopupDiffer} from './routing/workbench-popup-differ';
import {provideWorkbenchMicrofrontendSupport} from './microfrontend-platform/workbench-microfrontend-support';
import {provideWorkbenchLauncher} from './startup/workbench-launcher.service';
import {MicrofrontendViewComponent} from './microfrontend-platform/microfrontend-view/microfrontend-view.component';
import {SplashComponent} from './startup/splash/splash.component';
import {provideLogging} from './logging';
import {IFRAME_HOST, VIEW_LOCAL_MESSAGE_BOX_HOST, ViewContainerReference} from './content-projection/view-container.reference';
import {WorkbenchViewPreDestroyGuard} from './view/workbench-view-pre-destroy.guard';
import {ViewDragService} from './view-dnd/view-drag.service';
import {ViewTabDragImageRenderer} from './view-dnd/view-tab-drag-image-renderer.service';
import {PopupComponent} from './popup/popup.component';
import {MicrofrontendPopupComponent} from './microfrontend-platform/microfrontend-popup/microfrontend-popup.component';
import {MessageBoxModule} from './message-box/message-box.module';
import {NotificationModule} from './notification/notification.module';
import {WORKBENCH_POST_STARTUP, WORKBENCH_PRE_STARTUP, WORKBENCH_STARTUP} from './startup/workbench-initializer';
import {MainAreaLayoutComponent} from './main-area-layout/main-area-layout.component';
import {WorkbenchPerspectiveService} from './perspective/workbench-perspective.service';
import {InstanceofPipe} from './instanceof.pipe';
import {WorkbenchLayoutComponent} from './layout/workbench-layout.component';
import {GridElementComponent} from './layout/grid-element/grid-element.component';
import {PartPortalPipe} from './part/part-portal.pipe';
import {ActivationInstantProvider} from './activation-instant.provider';
import {FilterByTextPipe} from './filter-by-text.pipe';
import {FilterByPredicatePipe} from './filter-by-predicate.pipe';
import {EmptyIfNullPipe} from './empty-if-null.pipe';
import {FilterFieldComponent} from './filter-field/filter-field.component';
import {WorkbenchPeripheralGridMerger} from './perspective/workbench-peripheral-grid-merger.service';
import {DefaultWorkbenchStorage, WorkbenchStorage} from './storage/workbench-storage';
import {WorkbenchStorageService} from './storage/workbench-storage.service';
import {WorkbenchPerspectiveRegistry} from './perspective/workbench-perspective.registry';

/**
 * Module of the SCION Workbench.
 *
 * SCION Workbench enables the creation of Angular web applications that require a flexible layout
 * to arrange content side-by-side or stacked, all personalizable by the user via drag & drop.
 *
 * The workbench layout is ideal for applications with non-linear workflows, enabling users to work
 * on content in parallel.
 *
 * The workbench has a main area and a peripheral area for placing views. The main area is the primary
 * place for views to interact with the application. The peripheral area arranges views around the main
 * area to support the user's workflow. Multiple arrangements of peripheral views, called perspectives,
 * are supported. Different perspectives provide a different perspective on the application while sharing
 * the main area. Only one perspective can be active at a time.
 */
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([]),
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
    WorkbenchRouterLinkDirective,
  ],
  declarations: [
    WorkbenchComponent,
    WorkbenchLayoutComponent,
    MainAreaLayoutComponent,
    PartComponent,
    PartPortalPipe,
    PartBarComponent,
    WorkbenchPartActionDirective,
    PartActionBarComponent,
    ViewComponent,
    ViewPortalPipe,
    ViewTabComponent,
    ViewTabContentComponent,
    ViewListButtonComponent,
    ViewListComponent,
    ViewMenuComponent,
    WorkbenchViewMenuItemDirective,
    SashDirective,
    GridElementComponent,
    ViewDropZoneDirective,
    WorkbenchPortalOutletDirective,
    ContentProjectionDirective,
    ContentAsOverlayComponent,
    WbFormatAcceleratorPipe,
    TextComponent,
    ArrayCoercePipe,
    ArrayConcatPipe,
    InstanceofPipe,
    MicrofrontendViewComponent,
    MicrofrontendPopupComponent,
    SplashComponent,
    PopupComponent,
    FilterByTextPipe,
    FilterByPredicatePipe,
    EmptyIfNullPipe,
    FilterFieldComponent,
  ],
  exports: [
    WorkbenchComponent,
    ContentAsOverlayComponent,
    WorkbenchPartActionDirective,
    WorkbenchViewMenuItemDirective,
    WorkbenchRouterLinkDirective,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // required because <sci-router-outlet> is a custom element
})
export class WorkbenchModule {

  constructor(@Inject(WORKBENCH_FORROOT_GUARD) guard: any) { // eslint-disable-line @typescript-eslint/no-unused-vars
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
        WorkbenchPerspectiveService,
        WorkbenchLayoutService,
        WorkbenchLayoutDiffer,
        WorkbenchPopupDiffer,
        WorkbenchAuxiliaryRoutesRegistrator,
        WorkbenchUrlObserver,
        WorkbenchPerspectiveRegistry,
        WorkbenchViewRegistry,
        WorkbenchPartRegistry,
        provideWorkbenchRouter(),
        PopupService,
        ActivationInstantProvider,
        WorkbenchLayoutFactory,
        ViewMenuService,
        ViewContainerReference,
        ViewMoveHandler,
        WorkbenchViewPreDestroyGuard,
        ViewDragService,
        ViewTabDragImageRenderer,
        WorkbenchPeripheralGridMerger,
        WorkbenchStorageService,
        {
          provide: WORKBENCH_PRE_STARTUP,
          multi: true,
          useExisting: WorkbenchStorageService,
        },
        {
          provide: WorkbenchStorage,
          useClass: config.storage ?? DefaultWorkbenchStorage,
        },
        {
          provide: WORKBENCH_FORROOT_GUARD,
          useFactory: provideForRootGuard,
          deps: [[WorkbenchService, new Optional(), new SkipSelf()]],
        },
        {
          provide: WORKBENCH_STARTUP,
          multi: true,
          useExisting: WorkbenchPerspectiveService,
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
          provide: WORKBENCH_POST_STARTUP,
          useExisting: ViewMoveHandler,
          multi: true,
        },
        {
          provide: ENVIRONMENT_INITIALIZER,
          multi: true,
          useValue: () => inject(WorkbenchUrlObserver),
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
export function provideForRootGuard(workbenchService: WorkbenchService): any {
  if (workbenchService) {
    throw new Error('[ModuleForRootError] WorkbenchModule.forRoot() called twice. Lazy loaded modules should use WorkbenchModule.forChild() instead.');
  }
  return 'guarded';
}

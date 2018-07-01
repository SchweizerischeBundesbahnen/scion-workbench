import { ANALYZE_FOR_ENTRY_COMPONENTS, InjectionToken, ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkbenchComponent } from './workbench.component';
import { ActivityPartComponent } from './activity-part/activity-part.component';
import { SashDirective } from './sash.directive';
import { WorkbenchActivityPartService } from './activity-part/workbench-activity-part.service';
import { ScrollbarComponent } from './scrollbar/scrollbar.component';
import { ViewPartComponent } from './view-part/view-part.component';
import { PortalModule } from '@angular/cdk/portal';
import { ViewTabComponent } from './view-part/view-tab/view-tab.component';
import { ViewportComponent } from './viewport/viewport.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SearchfieldComponent } from './searchfield/searchfield.component';
import { ViewListComponent } from './view-part/view-list/view-list.component';
import { DimensionDirective } from './wb-dimension.directive';
import { ViewListButtonComponent } from './view-part/view-list-button/view-list-button.component';
import { ViewPartBarComponent } from './view-part/view-part-bar/view-part-bar.component';
import { WorkbenchService } from './workbench.service';
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
import { WorkbenchRouter } from './routing/workbench-router.service';
import { WbRouterLinkDirective, WbRouterLinkWithHrefDirective } from './routing/wb-router-link.directive';
import { WorkbenchViewRegistry } from './workbench-view-registry.service';
import { OverlayHostRef } from './overlay-host-ref.service';
import { ViewOutletUrlObserver } from './routing/view-outlet-url-observer.service';
import { WbRouteReuseStrategy } from './routing/wb-route-reuse-strategy.service';
import { WbActivityActionDirective } from './activity-part/wb-activity-action.directive';
import { WbActivityDirective } from './activity-part/wb-activity.directive';
import { MoveDirective } from './move.directive';
import { WorkbenchConfig } from './workbench.config';
import { OverlayTemplateOutletDirective } from './overlay-template-outlet.directive';
import { NLS_DEFAULTS } from './workbench.constants';
import { NotificationService } from './notification/notification.service';
import { NotificationListComponent } from './notification/notification-list.component';
import { NotificationComponent } from './notification/notification.component';
import { MessageBoxStackComponent } from './message-box/message-box-stack.component';
import { MessageBoxComponent } from './message-box/message-box.component';
import { APP_MESSAGE_BOX_SERVICE, MessageBoxService } from './message-box/message-box.service';

const CONFIG = new InjectionToken<WorkbenchConfig>('WORKBENCH_CONFIG');

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([]),
    PortalModule,
    ReactiveFormsModule,
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
    ScrollbarComponent,
    ViewportComponent,
    SearchfieldComponent,
    SashDirective,
    ViewPartSashBoxComponent,
    DimensionDirective,
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
    OverlayTemplateOutletDirective,
  ],
  exports: [
    WorkbenchComponent,
    WbActivityDirective,
    WbActivityActionDirective,
    ViewportComponent,
    ScrollbarComponent,
    SashDirective,
    DimensionDirective,
    WbRouterLinkDirective,
    WbRouterLinkWithHrefDirective,
    RemoteSiteComponent,
  ]
})
export class WorkbenchModule {

  // Specify services to be loaded eagerly
  constructor(@Optional() @SkipSelf() parentModule: WorkbenchModule,
              viewRegistry: WorkbenchViewRegistry) {
    WorkbenchModule.throwIfAlreadyLoaded(parentModule);
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
  public static forRoot(config: WorkbenchConfig = {nls: NLS_DEFAULTS}): ModuleWithProviders {
    return {
      ngModule: WorkbenchModule,
      providers: [
        WorkbenchService,
        WorkbenchRouter,
        WorkbenchLayoutService,
        WorkbenchActivityPartService,
        NotificationService,
        MessageBoxService,
        ViewPartGridSerializerService,
        ViewOutletUrlObserver,
        ViewPartGridUrlObserver,
        WbBeforeDestroyGuard,
        WorkbenchViewRegistry,
        OverlayHostRef,
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
          provide: RouteReuseStrategy,
          useClass: WbRouteReuseStrategy,
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

  private static throwIfAlreadyLoaded(parentModule: any): void {
    if (parentModule) {
      throw new Error('WorkbenchModule.forRoot() called twice. Lazy loaded modules should use WorkbenchModule.forChild() instead.');
    }
  }
}

export function newConfig(config: WorkbenchConfig): WorkbenchConfig {
  return new WorkbenchConfig(config);
}

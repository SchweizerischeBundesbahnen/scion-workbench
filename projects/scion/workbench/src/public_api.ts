/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

/**
 * Entry point for all public APIs of this package.
 */
export { WorkbenchModule } from './lib/workbench.module';
export { WorkbenchView, WorkbenchViewPart, WbBeforeDestroy } from './lib/workbench.model';
export { WbRouterLinkDirective, WbRouterLinkWithHrefDirective } from './lib/routing/wb-router-link.directive';
export { WorkbenchRouter } from './lib/routing/workbench-router.service';
export { WorkbenchComponent } from './lib/workbench.component';
export { ViewportComponent } from './lib/viewport/viewport.component';
export { ScrollbarComponent } from './lib/scrollbar/scrollbar.component';
export { DimensionDirective, Dimension } from './lib/wb-dimension.directive';
export { RemoteSiteComponent } from './lib/remote-site/remote-site.component';
export { OverlayHostRef } from './lib/overlay-host-ref.service';
export { WbActivityDirective } from './lib/activity-part/wb-activity.directive';
export { WbActivityActionDirective } from './lib/activity-part/wb-activity-action.directive';
export { Notification, Duration } from './lib/notification/notification';
export { NotificationService } from './lib/notification/notification.service';
export { MessageBox, Action } from './lib/message-box/message-box';
export { MessageBoxService } from './lib/message-box/message-box.service';
export { WB_REMOTE_URL_PARAM, WB_VIEW_TITLE_PARAM, WB_VIEW_HEADING_PARAM, WB_ROUTE_REUSE_IDENTITY_PARAM }  from './lib/routing/routing-params.constants';
export { Severity, NLS_DEFAULTS } from './lib/workbench.constants';

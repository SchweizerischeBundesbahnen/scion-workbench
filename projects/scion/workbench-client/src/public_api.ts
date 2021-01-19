/*
 * Copyright (c) 2018-2020 Swiss Federal Railways
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
export { WorkbenchClient } from './lib/workbench-client';
export { WorkbenchRouter, WorkbenchNavigationExtras } from './lib/routing/workbench-router';
export { ɵWorkbenchRouterNavigateCommand, ɵMicrofrontendRouteParams } from './lib/routing/workbench-router-navigate-command';
export { WorkbenchViewCapability } from './lib/view/workbench-view-capability';
export { WorkbenchView, ViewClosingListener, ViewClosingEvent, ɵVIEW_ID_CONTEXT_KEY } from './lib/view/workbench-view';
export { WorkbenchCapabilities } from './lib/workbench-capabilities.enum';
export { ɵWorkbenchCommands } from './lib/ɵworkbench-commands';
export { ɵWorkbenchPopupCommand } from './lib/popup/workbench-popup-open-command';
export { WorkbenchPopupService } from './lib/popup/workbench-popup-service';
export { WorkbenchPopup, ɵWorkbenchPopupMessageHeaders } from './lib/popup/workbench-popup';
export { WorkbenchPopupCapability, PopupSize } from './lib/popup/workbench-popup-capability';
export { WorkbenchPopupConfig, PopupOrigin, CloseStrategy } from './lib/popup/workbench-popup.config';
export { ɵPopupContext, ɵPOPUP_CONTEXT } from './lib/popup/workbench-popup-context';

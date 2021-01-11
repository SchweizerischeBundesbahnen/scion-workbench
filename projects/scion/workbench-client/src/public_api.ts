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
export { ɵMicrofrontendRouteParams, ɵWorkbenchNavigationMessageHeaders } from './lib/routing/workbench-router.constants';
export { WorkbenchViewCapability } from './lib/view/workbench-view-capability';
export { WorkbenchView, ViewClosingListener, ViewClosingEvent, ɵVIEW_ID_CONTEXT_KEY } from './lib/view/workbench-view';
export { WorkbenchCapabilities } from './lib/workbench-capabilities.enum';
export { ɵWorkbenchCommands } from './lib/ɵworkbench-commands';

/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

export {WorkbenchClient} from './workbench-client';
export {WorkbenchCapabilities} from './workbench-capabilities.enum';
export {ɵWorkbenchCommands} from './ɵworkbench-commands';
export {type ViewId, type PartId, type DialogId, type PopupId, type NotificationId, type ActivityId} from './workbench.identifiers';
export {type WorkbenchElement, WORKBENCH_ELEMENT} from './workbench.model';

export * from './common/public_api';
export * from './dialog/public_api';
export * from './message-box/public_api';
export * from './notification/public_api';
export * from './perspective/public_api';
export * from './popup/public_api';
export * from './routing/public_api';
export * from './text/public_api';
export * from './theme/public_api';
export * from './view/public_api';
export * from './part/public_api';

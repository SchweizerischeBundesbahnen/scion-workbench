/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Qualifier} from '@scion/microfrontend-platform';

/**
 * Describes an Angular route.
 */
export interface RouteDescriptor {
  path: string;
  component: 'part-page' | 'view-page' | 'dialog-page' | 'popup-page' | 'messagebox-page' | 'notification-page' | 'router-page' | 'focus-test-page' | 'size-test-page' | 'text-test-page' | 'microfrontend-dialog-opener-page' | 'microfrontend-messagebox-opener-page' | 'microfrontend-popup-opener-page';
  data?: Record<string, unknown>;
  canMatch?: [CanMatchWorkbenchElementDescriptor | CanMatchWorkbenchCapabilityDescriptor];
}

/**
 * Describes a `CanMatch` route guard to match a workbench part or workbench view.
 *
 * @see canMatchWorkbenchPart
 * @see canMatchWorkbenchView
 */
export interface CanMatchWorkbenchElementDescriptor {
  fn: 'canMatchWorkbenchPart' | 'canMatchWorkbenchView';
  hint: string;
}

/**
 * Describes a `CanMatch` route guard to match a host microfrontend.
 *
 * @see canMatchWorkbenchPartCapability
 * @see canMatchWorkbenchViewCapability
 * @see canMatchWorkbenchDialogCapability
 * @see canMatchWorkbenchMessageBoxCapability
 * @see canMatchWorkbenchPopupCapability
 * @see canMatchWorkbenchNotificationCapability
 */
export interface CanMatchWorkbenchCapabilityDescriptor {
  fn: 'canMatchWorkbenchPartCapability' | 'canMatchWorkbenchViewCapability' | 'canMatchWorkbenchDialogCapability' | 'canMatchWorkbenchMessageBoxCapability' | 'canMatchWorkbenchPopupCapability' | 'canMatchWorkbenchNotificationCapability';
  qualifier: Qualifier;
}

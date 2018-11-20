/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { InjectionToken } from '@angular/core';
import { ComponentType } from '@angular/cdk/portal';

/**
 * Routing data key to get a reference to {ActivityCapability}.
 */
export const ACTIVITY_CAPABILITY_ROUTE_DATA_KEY = 'wap.activityCapability';

/**
 * DI injection token to register activity action providers, e.g. to show an action as a button.
 */
export const ACTIVITY_ACTION_PROVIDER = new InjectionToken<ActivityActionProvider>('ACTIVITY_ACTION_PROVIDER');

/**
 * DI injection token to inject the action into a {ActivityActionProvider}.
 */
export const ACTIVITY_ACTION = new InjectionToken<any>('ACTIVITY_ACTION');

/**
 * Provides the component to render an activity action.
 *
 * There are some built-in providers installed by the platform: 'view-open', 'url-open', 'popup-open'.
 *
 *  - view-open: button to open a view
 *  - popup-open: button to open a popup
 *  - url-open: button to open an URL in a separate browser tab
 *
 * To provide an action, register it via DI token {ACTIVITY_ACTION_PROVIDER} as multi provider in the host application.
 *
 * ---
 * Example registration:
 *
 * @NgModule({
 *   imports: [
 *     WorkbenchModule.forRoot(),
 *     WorkbenchApplicationPlatformModule.forRoot(...),
 *   ],
 *   providers: [
 *     {provide: ACTIVITY_ACTION_PROVIDER, useClass: YourActivityActionProvider, multi: true},
 *   ],
 * })
 * export class AppModule {}
 */
export interface ActivityActionProvider {
  /**
   * Unique type used by actions to reference this provider.
   */
  type: string;
  /**
   * The component which this provider provides.
   */
  component: ComponentType<any>;
}

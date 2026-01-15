/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {EnvironmentProviders, makeEnvironmentProviders} from '@angular/core';
import {Beans} from '@scion/toolkit/bean-manager';
import {mapToBody, MessageClient} from '@scion/microfrontend-platform';
import {WORKBENCH_ICON_PROVIDER, WorkbenchIconDescriptor, WorkbenchIconProviderFn} from '../../icon/workbench-icon-provider.model';
import {iconDescriptor} from '../../icon/icon.component';
import {MaterialIconComponent} from '../../icon/material-icon-provider';

/**
 * Registers an icon provider for the SCION Workbench to get badge for an icon from micro apps.
 *
 * This icon provider resolves the badge for icons matching the format: "workbench.external.scion-workbench-client.<APP_SYMBOLIC_NAME>.<ICON>;badge=<BADGE>".
 *
 * @see createRemoteIcon
 */
export function provideRemoteIconProvider(): EnvironmentProviders {
  // workbench.external.scion-workbench-client.app.task;badge=3
  const ICON_WITH_BADGE = /^workbench\.external\.scion-workbench-client\.(?<provider>[^\\.]+)\.(?<icon>[^;]+)(?:;badge=(?<badge>.+))?$/;

  return makeEnvironmentProviders([
    {
      provide: WORKBENCH_ICON_PROVIDER,
      useValue: provideIconWithBadge satisfies WorkbenchIconProviderFn,
      multi: true,
    },
  ]);


  function sampleProjectIconProvider(icon: string): WorkbenchIconDescriptor | undefined {
    if (icon === 'task') {
      return {
        component: MaterialIconComponent,
        inputs: {ligature: icon},
        badge: () => 4,
      }
    }
    return undefined;
  }

  /**
   * Provides text from a remote app.
   */
  function provideIconWithBadge(iconKey: string | `workbench.external.scion-workbench-client.${string}.${string}`): WorkbenchIconDescriptor | undefined {
    // Test if the key matches a remote icon key.
    const match = ICON_WITH_BADGE.exec(iconKey);
    if (!match) {
      return undefined;
    }

    const {icon, badge} = match.groups as {icon: string; badge: string; provider: string};
    const descriptor = iconDescriptor(icon);
    if (!descriptor) {
      return undefined;
    }
    else if (typeof descriptor === 'function') {
      return {
        component: descriptor,
        badge: () => Beans.get(MessageClient).request$<string | undefined>(badge, undefined, {retain: true}).pipe(mapToBody<string | undefined>()),
      }
    }
    else {
      return {
        component: descriptor?.component,
        inputs: descriptor?.inputs,
        badge: () => Beans.get(MessageClient).request$<string | undefined>(badge, undefined, {retain: true}).pipe(mapToBody<string | undefined>()),
      }
    }
  }
}

export function createRemoteIcon(icon: undefined, config: {appSymbolicName: string; badge?: string}): undefined;
export function createRemoteIcon(icon: string, config: {appSymbolicName: string; badge?: string}): string;
export function createRemoteIcon(icon: string | undefined, config: {appSymbolicName: string; badge?: string}): string | undefined {
  if (!icon || !config.badge) {
    return icon;
  }
  return `workbench.external.scion-workbench-client.${config.appSymbolicName}.${icon};badge=${config.badge}`;
}

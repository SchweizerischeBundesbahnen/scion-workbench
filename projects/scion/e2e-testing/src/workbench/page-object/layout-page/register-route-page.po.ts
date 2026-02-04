/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Locator} from '@playwright/test';
import {Qualifier} from '@scion/microfrontend-platform';
import {SciKeyValueFieldPO} from '../../../@scion/components.internal/key-value-field.po';
import {CanMatchWorkbenchCapabilityDescriptor, CanMatchWorkbenchElementDescriptor, RouteDescriptor} from 'workbench-testing-app-common';

/**
 * Page object to interact with {@link RegisterRoutePageComponent}.
 */
export class RegisterRoutePagePO {

  constructor(public locator: Locator) {
  }

  public async registerRoute(route: RouteDescriptor): Promise<void> {
    // Path
    await this.locator.locator('input.e2e-path').fill(route.path);

    // Component
    await this.locator.locator('select.e2e-component').selectOption(route.component);

    // Data
    if (route.data) {
      const dataField = new SciKeyValueFieldPO(this.locator.locator('app-key-value-field.e2e-data'));
      await dataField.clear();
      await dataField.addEntries(route.data);
    }

    // CanMatch
    const canMatch = route.canMatch?.[0];
    if (isCanMatchWorkbenchElementFn(canMatch)) {
      await this.locator.locator('select.e2e-can-match').selectOption(canMatch.fn);
      await this.locator.locator('input.e2e-hint').fill(canMatch.hint);
    }
    else if (isCanMatchWorkbenchCapabilityFn(canMatch)) {
      await this.locator.locator('select.e2e-can-match').selectOption(canMatch.fn);
      const qualifierField = new SciKeyValueFieldPO(this.locator.locator('app-key-value-field.e2e-qualifier'));
      await qualifierField.clear();
      await qualifierField.addEntries(canMatch.qualifier);
    }

    await this.locator.locator('button.e2e-register').click();
  }
}

function isCanMatchWorkbenchElementFn(canMatch: CanMatchWorkbenchElementDescriptor | CanMatchWorkbenchCapabilityDescriptor | undefined): canMatch is CanMatchWorkbenchElementDescriptor {
  return (canMatch?.fn.startsWith('canMatchWorkbench') && !canMatch.fn.endsWith('Capability')) ?? false;
}

function isCanMatchWorkbenchCapabilityFn(canMatch: CanMatchWorkbenchElementDescriptor | CanMatchWorkbenchCapabilityDescriptor | undefined): canMatch is CanMatchWorkbenchCapabilityDescriptor {
  return (canMatch?.fn.startsWith('canMatchWorkbench') && canMatch.fn.endsWith('Capability')) ?? false;
}

export function canMatchWorkbenchPart(hint: string): CanMatchWorkbenchElementDescriptor {
  return {fn: 'canMatchWorkbenchPart', hint};
}

export function canMatchWorkbenchView(hint: string): CanMatchWorkbenchElementDescriptor {
  return {fn: 'canMatchWorkbenchView', hint};
}

export function canMatchWorkbenchPartCapability(qualifier: Qualifier): CanMatchWorkbenchCapabilityDescriptor {
  return {fn: 'canMatchWorkbenchPartCapability', qualifier};
}

export function canMatchWorkbenchViewCapability(qualifier: Qualifier): CanMatchWorkbenchCapabilityDescriptor {
  return {fn: 'canMatchWorkbenchViewCapability', qualifier};
}

export function canMatchWorkbenchDialogCapability(qualifier: Qualifier): CanMatchWorkbenchCapabilityDescriptor {
  return {fn: 'canMatchWorkbenchDialogCapability', qualifier};
}

export function canMatchWorkbenchMessageBoxCapability(qualifier: Qualifier): CanMatchWorkbenchCapabilityDescriptor {
  return {fn: 'canMatchWorkbenchMessageBoxCapability', qualifier};
}

export function canMatchWorkbenchPopupCapability(qualifier: Qualifier): CanMatchWorkbenchCapabilityDescriptor {
  return {fn: 'canMatchWorkbenchPopupCapability', qualifier};
}

export function canMatchWorkbenchNotificationCapability(qualifier: Qualifier): CanMatchWorkbenchCapabilityDescriptor {
  return {fn: 'canMatchWorkbenchNotificationCapability', qualifier};
}

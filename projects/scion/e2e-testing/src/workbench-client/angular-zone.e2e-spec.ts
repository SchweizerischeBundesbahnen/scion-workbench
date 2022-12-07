/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {expect} from '@playwright/test';
import {test} from '../fixtures';
import {AngularZoneTestPagePO} from './page-object/test-pages/angular-zone-test-page.po';

/**
 * Tests RxJS Observables to emit in the correct Angular zone.
 *
 * The SCION Workbench Client is framework-agnostic with no dependency on Angular. But integration in Angular applications
 * requires Observables to emit in the correct zone. For that reason, an application can register a `ObservableDecorator` to control
 * the context of Observable emissions. Angular applications typically install such a decorator to have Observables emit in the
 * correct zone.
 */
test.describe('Angular Zone Synchronization', () => {

  test('should emit in the same Angular zone as subscribed to "WorkbenchView#capability$"', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const angularZoneTestPO = await AngularZoneTestPagePO.openInNewTab(appPO, microfrontendNavigator);

    const capabilityPO = angularZoneTestPO.workbenchView.capabilityPO;
    await capabilityPO.expand();

    await test.step('subscribeInsideAngularZone', async () => {
      await capabilityPO.subscribe({subscribeInAngularZone: true});
      await expect(await capabilityPO.isEmissionReceivedInAngularZone({nth: 0})).toBe(true);
      await expect(await capabilityPO.isEmissionReceivedInAngularZone({nth: 1})).toBe(true);
    });
    await test.step('subscribeOutsideAngularZone', async () => {
      await capabilityPO.subscribe({subscribeInAngularZone: false});
      await expect(await capabilityPO.isEmissionReceivedInAngularZone({nth: 0})).toBe(false);
      await expect(await capabilityPO.isEmissionReceivedInAngularZone({nth: 1})).toBe(false);
    });
  });

  test('should emit in the same Angular zone as subscribed to "WorkbenchView#params$"', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const angularZoneTestPO = await AngularZoneTestPagePO.openInNewTab(appPO, microfrontendNavigator);

    const paramsPO = angularZoneTestPO.workbenchView.paramsPO;
    await paramsPO.expand();

    await test.step('subscribeInsideAngularZone', async () => {
      await paramsPO.subscribe({subscribeInAngularZone: true});
      await expect(await paramsPO.isEmissionReceivedInAngularZone({nth: 0})).toBe(true);
      await expect(await paramsPO.isEmissionReceivedInAngularZone({nth: 1})).toBe(true);
    });
    await test.step('subscribeOutsideAngularZone', async () => {
      await paramsPO.subscribe({subscribeInAngularZone: false});
      await expect(await paramsPO.isEmissionReceivedInAngularZone({nth: 0})).toBe(false);
      await expect(await paramsPO.isEmissionReceivedInAngularZone({nth: 1})).toBe(false);
    });
  });

  test('should emit in the same Angular zone as subscribed to "WorkbenchView#active$"', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const angularZoneTestPO = await AngularZoneTestPagePO.openInNewTab(appPO, microfrontendNavigator);

    const activePO = angularZoneTestPO.workbenchView.activePO;
    await activePO.expand();

    await test.step('subscribeInsideAngularZone', async () => {
      await activePO.subscribe({subscribeInAngularZone: true});
      await expect(await activePO.isEmissionReceivedInAngularZone({nth: 0})).toBe(true);
      await expect(await activePO.isEmissionReceivedInAngularZone({nth: 1})).toBe(true);
    });
    await test.step('subscribeOutsideAngularZone', async () => {
      await activePO.subscribe({subscribeInAngularZone: false});
      await expect(await activePO.isEmissionReceivedInAngularZone({nth: 0})).toBe(false);
      await expect(await activePO.isEmissionReceivedInAngularZone({nth: 1})).toBe(false);
    });
  });
});

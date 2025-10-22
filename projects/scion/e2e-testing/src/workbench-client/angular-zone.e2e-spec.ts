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

  test('should emit in the same Angular zone as subscribed to "WorkbenchView#partId$"', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const angularZoneTestPage = await AngularZoneTestPagePO.openInNewTab(appPO, microfrontendNavigator);

    const partIdPanel = angularZoneTestPage.workbenchView.partIdPanel;
    await partIdPanel.expand();

    await test.step('subscribeInsideAngularZone', async () => {
      await partIdPanel.subscribe({subscribeInAngularZone: true});
      await expect.poll(() => partIdPanel.isEmissionReceivedInAngularZone({nth: 0})).toBe(true);
      await expect.poll(() => partIdPanel.isEmissionReceivedInAngularZone({nth: 1})).toBe(true);
    });
    await test.step('subscribeOutsideAngularZone', async () => {
      await partIdPanel.subscribe({subscribeInAngularZone: false});
      await expect.poll(() => partIdPanel.isEmissionReceivedInAngularZone({nth: 0})).toBe(false);
      await expect.poll(() => partIdPanel.isEmissionReceivedInAngularZone({nth: 1})).toBe(false);
    });
  });

  test('should emit in the same Angular zone as subscribed to "WorkbenchView#capability$"', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const angularZoneTestPage = await AngularZoneTestPagePO.openInNewTab(appPO, microfrontendNavigator);

    const capabilityPanel = angularZoneTestPage.workbenchView.capabilityPanel;
    await capabilityPanel.expand();

    await test.step('subscribeInsideAngularZone', async () => {
      await capabilityPanel.subscribe({subscribeInAngularZone: true});
      await expect.poll(() => capabilityPanel.isEmissionReceivedInAngularZone({nth: 0})).toBe(true);
      await expect.poll(() => capabilityPanel.isEmissionReceivedInAngularZone({nth: 1})).toBe(true);
    });
    await test.step('subscribeOutsideAngularZone', async () => {
      await capabilityPanel.subscribe({subscribeInAngularZone: false});
      await expect.poll(() => capabilityPanel.isEmissionReceivedInAngularZone({nth: 0})).toBe(false);
      await expect.poll(() => capabilityPanel.isEmissionReceivedInAngularZone({nth: 1})).toBe(false);
    });
  });

  test('should emit in the same Angular zone as subscribed to "WorkbenchView#params$"', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const angularZoneTestPage = await AngularZoneTestPagePO.openInNewTab(appPO, microfrontendNavigator);

    const paramsPanel = angularZoneTestPage.workbenchView.paramsPanel;
    await paramsPanel.expand();

    await test.step('subscribeInsideAngularZone', async () => {
      await paramsPanel.subscribe({subscribeInAngularZone: true});
      await expect.poll(() => paramsPanel.isEmissionReceivedInAngularZone({nth: 0})).toBe(true);
      await expect.poll(() => paramsPanel.isEmissionReceivedInAngularZone({nth: 1})).toBe(true);
    });
    await test.step('subscribeOutsideAngularZone', async () => {
      await paramsPanel.subscribe({subscribeInAngularZone: false});
      await expect.poll(() => paramsPanel.isEmissionReceivedInAngularZone({nth: 0})).toBe(false);
      await expect.poll(() => paramsPanel.isEmissionReceivedInAngularZone({nth: 1})).toBe(false);
    });
  });

  test('should emit in the same Angular zone as subscribed to "WorkbenchView#active$"', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const angularZoneTestPage = await AngularZoneTestPagePO.openInNewTab(appPO, microfrontendNavigator);

    const activePanel = angularZoneTestPage.workbenchView.activePanel;
    await activePanel.expand();

    await test.step('subscribeInsideAngularZone', async () => {
      await activePanel.subscribe({subscribeInAngularZone: true});
      await expect.poll(() => activePanel.isEmissionReceivedInAngularZone({nth: 0})).toBe(true);
      await expect.poll(() => activePanel.isEmissionReceivedInAngularZone({nth: 1})).toBe(true);
    });
    await test.step('subscribeOutsideAngularZone', async () => {
      await activePanel.subscribe({subscribeInAngularZone: false});
      await expect.poll(() => activePanel.isEmissionReceivedInAngularZone({nth: 0})).toBe(false);
      await expect.poll(() => activePanel.isEmissionReceivedInAngularZone({nth: 1})).toBe(false);
    });
  });

  test('should emit in the same Angular zone as subscribed to "WorkbenchView#focused$"', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const angularZoneTestPage = await AngularZoneTestPagePO.openInNewTab(appPO, microfrontendNavigator);

    const focusedPanel = angularZoneTestPage.workbenchView.focusedPanel;
    await focusedPanel.expand();

    await test.step('subscribeInsideAngularZone', async () => {
      await focusedPanel.subscribe({subscribeInAngularZone: true});
      await expect.poll(() => focusedPanel.isEmissionReceivedInAngularZone({nth: 0})).toBe(true);
      await expect.poll(() => focusedPanel.isEmissionReceivedInAngularZone({nth: 1})).toBe(true);
    });
    await test.step('subscribeOutsideAngularZone', async () => {
      await focusedPanel.subscribe({subscribeInAngularZone: false});
      await expect.poll(() => focusedPanel.isEmissionReceivedInAngularZone({nth: 0})).toBe(false);
      await expect.poll(() => focusedPanel.isEmissionReceivedInAngularZone({nth: 1})).toBe(false);
    });
  });

  test('should emit in the same Angular zone as subscribed to "WorkbenchPart#active$"', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const angularZoneTestPage = await AngularZoneTestPagePO.openInNewTab(appPO, microfrontendNavigator);

    const activePanel = angularZoneTestPage.workbenchPart.activePanel;
    await activePanel.expand();

    await test.step('subscribeInsideAngularZone', async () => {
      await activePanel.subscribe({subscribeInAngularZone: true});
      await expect.poll(() => activePanel.isEmissionReceivedInAngularZone({nth: 0})).toBe(true);
      await expect.poll(() => activePanel.isEmissionReceivedInAngularZone({nth: 1})).toBe(true);
    });
    await test.step('subscribeOutsideAngularZone', async () => {
      await activePanel.subscribe({subscribeInAngularZone: false});
      await expect.poll(() => activePanel.isEmissionReceivedInAngularZone({nth: 0})).toBe(false);
      await expect.poll(() => activePanel.isEmissionReceivedInAngularZone({nth: 1})).toBe(false);
    });
  });

  test('should emit in the same Angular zone as subscribed to "WorkbenchPart#focused$"', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const angularZoneTestPage = await AngularZoneTestPagePO.openInNewTab(appPO, microfrontendNavigator);

    const focusedPanel = angularZoneTestPage.workbenchPart.focusedPanel;
    await focusedPanel.expand();

    await test.step('subscribeInsideAngularZone', async () => {
      await focusedPanel.subscribe({subscribeInAngularZone: true});
      await expect.poll(() => focusedPanel.isEmissionReceivedInAngularZone({nth: 0})).toBe(true);
      await expect.poll(() => focusedPanel.isEmissionReceivedInAngularZone({nth: 1})).toBe(true);
    });
    await test.step('subscribeOutsideAngularZone', async () => {
      await focusedPanel.subscribe({subscribeInAngularZone: false});
      await expect.poll(() => focusedPanel.isEmissionReceivedInAngularZone({nth: 0})).toBe(false);
      await expect.poll(() => focusedPanel.isEmissionReceivedInAngularZone({nth: 1})).toBe(false);
    });
  });
});

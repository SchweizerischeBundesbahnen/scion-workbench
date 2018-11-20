/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { TestingViewPO } from './page-object/testing-view.po';
import { HostAppPO } from './page-object/host-app.po';
import { browser } from 'protractor';
import { Testcase61097badNotificationPO } from './page-object/testcase-61097bad-notification.po';

describe('Notification', () => {

  const hostAppPO = new HostAppPO();
  const testingViewPO = new TestingViewPO();

  beforeEach(async () => {
    await browser.get('/');
  });

  it('should show specified text and title', async () => {
    await testingViewPO.navigateTo();
    const notificationPanelPO = await testingViewPO.openNotificationPanel();
    await notificationPanelPO.enterCssClass('e2e-c5dc3af5cd92-notification');
    await notificationPanelPO.enterText('01de40e40df3');
    await notificationPanelPO.enterTitle('976653342eef');
    await notificationPanelPO.show();

    const notificationPO = await hostAppPO.findNotification('e2e-c5dc3af5cd92-notification');

    await expect(notificationPO.getText()).toEqual('01de40e40df3');
    await expect(notificationPO.getTitle()).toEqual('976653342eef');
  });

  it('should show specified severity', async () => {
    await testingViewPO.navigateTo();
    const notificationPanelPO = await testingViewPO.openNotificationPanel();
    await notificationPanelPO.enterCssClass('e2e-fbf7ec24f2d4-notification');

    // info
    await notificationPanelPO.selectSeverity('info');
    await notificationPanelPO.show();
    {
      const notificationPO = await hostAppPO.findNotification('e2e-fbf7ec24f2d4-notification');
      await expect(notificationPO.getSeverity()).toEqual('info');
      await notificationPO.close();
    }

    // warn
    await notificationPanelPO.selectSeverity('warn');
    await notificationPanelPO.show();
    {
      const notificationPO = await hostAppPO.findNotification('e2e-fbf7ec24f2d4-notification');
      await expect(notificationPO.getSeverity()).toEqual('warn');
      await notificationPO.close();
    }

    // error
    await notificationPanelPO.selectSeverity('error');
    await notificationPanelPO.show();
    {
      const notificationPO = await hostAppPO.findNotification('e2e-fbf7ec24f2d4-notification');
      await expect(notificationPO.getSeverity()).toEqual('error');
      await notificationPO.close();
    }
  });

  it('should apply specified duration', async () => {
    await testingViewPO.navigateTo();
    const notificationPanelPO = await testingViewPO.openNotificationPanel();
    await notificationPanelPO.enterCssClass('e2e-fbf7ec24f2d4-notification');

    // short
    await notificationPanelPO.selectDuration('short');
    await notificationPanelPO.show();
    {
      const notificationPO = await hostAppPO.findNotification('e2e-fbf7ec24f2d4-notification');
      await expect(notificationPO.getDuration()).toEqual('short');
      await notificationPO.close();
    }

    // medium
    await notificationPanelPO.selectDuration('medium');
    await notificationPanelPO.show();
    {
      const notificationPO = await hostAppPO.findNotification('e2e-fbf7ec24f2d4-notification');
      await expect(notificationPO.getDuration()).toEqual('medium');
      await notificationPO.close();
    }

    // long
    await notificationPanelPO.selectDuration('long');
    await notificationPanelPO.show();
    {
      const notificationPO = await hostAppPO.findNotification('e2e-fbf7ec24f2d4-notification');
      await expect(notificationPO.getDuration()).toEqual('long');
      await notificationPO.close();
    }

    // infinite
    await notificationPanelPO.selectDuration('infinite');
    await notificationPanelPO.show();
    {
      const notificationPO = await hostAppPO.findNotification('e2e-fbf7ec24f2d4-notification');
      await expect(notificationPO.getDuration()).toBeNull();
      await notificationPO.close();
    }
  });

  it('should allow to close a notification', async () => {
    await testingViewPO.navigateTo();
    const notificationPanelPO = await testingViewPO.openNotificationPanel();
    await notificationPanelPO.enterCssClass('e2e-fbf7ec24f2d4-notification');

    await notificationPanelPO.show();
    await expect(hostAppPO.findNotification('e2e-fbf7ec24f2d4-notification')).not.toBeNull('expected notification to show');

    const notificationPO = await hostAppPO.findNotification('e2e-fbf7ec24f2d4-notification');
    await notificationPO.close();
    await expect(hostAppPO.findNotification('e2e-fbf7ec24f2d4-notification')).toBeNull('expected notification to be closed');
  });

  it('should allow to show multiple notifications', async () => {
    await testingViewPO.navigateTo();
    const notificationPanelPO = await testingViewPO.openNotificationPanel();

    await notificationPanelPO.enterCssClass('e2e-6dbbd7fe35c0-notification');
    await notificationPanelPO.show();

    await notificationPanelPO.enterCssClass('e2e-b5e3e1a38c3d-notification');
    await notificationPanelPO.show();

    await expect(hostAppPO.findNotification('e2e-6dbbd7fe35c0-notification')).not.toBeNull('expected notification \'6dbbd7fe35c0\' to show');
    await expect(hostAppPO.findNotification('e2e-b5e3e1a38c3d-notification')).not.toBeNull('expected notification \'b5e3e1a38c3d\' to show');
  });

  it('should allow to replace notifications', async () => {
    await testingViewPO.navigateTo();

    const notificationPanelPO = await testingViewPO.openNotificationPanel();

    await notificationPanelPO.enterCssClass('e2e-first-notification');
    await notificationPanelPO.enterText('first');
    await notificationPanelPO.enterGroup('group-identity');
    await notificationPanelPO.show();
    {
      const notificationPO = await hostAppPO.findNotification('e2e-first-notification');
      await expect(notificationPO.getText()).toEqual('first');
    }

    await notificationPanelPO.enterCssClass('e2e-second-notification');
    await notificationPanelPO.enterText('second');
    await notificationPanelPO.enterGroup('group-identity');
    await notificationPanelPO.show();

    await expect(hostAppPO.getNotificationCount()).toEqual(1);

    {
      const notificationPO = await hostAppPO.findNotification('e2e-first-notification');
      await expect(notificationPO).toBeNull('expected notification \'first\' not to show');
    }
    {
      const notificationPO = await hostAppPO.findNotification('e2e-second-notification');
      await expect(notificationPO).not.toBeNull('expected notification \'second\' to show');
      await expect(notificationPO.getText()).toEqual('second');
    }
  });

  it('should show a custom notification [testcase: 61097bad]', async () => {
    await testingViewPO.navigateTo();
    const notificationPanelPO = await testingViewPO.openNotificationPanel();

    await notificationPanelPO.enterQualifier({'type': 'list'});
    await notificationPanelPO.enterCssClass('e2e-61097bad-notification');
    await notificationPanelPO.enterPayload({'items': ['a', 'b', 'c']});

    await notificationPanelPO.show();
    const notificationPO = new Testcase61097badNotificationPO('e2e-61097bad-notification');
    await expect(notificationPO.getItems()).toEqual(['a', 'b', 'c']);
  });
});

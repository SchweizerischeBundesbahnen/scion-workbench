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
import { HostAppPO, ViewTabPO } from './page-object/host-app.po';
import { browser } from 'protractor';
import { expectViewToExistButHidden, expectViewToNotExist, expectViewToShow } from './util/testing.util';
import { TestcaseFfd6a78fViewPO } from './page-object/testcase-ffd6a78f-view.po';
import { Testcase28f32b51ViewPO } from './page-object/testcase-28f32b51-view.po';
import { Testcase56657ad1ViewPO } from './page-object/testcase-56657ad1-view.po';
import { TestcaseC8e40918ViewPO } from './page-object/testcase-c8e40918-view.po';
import { TestcaseA686d615ViewPO } from './page-object/testcase-a686d615-view.po';
import { TestcaseCc977da9ViewPO } from './page-object/testcase-cc977da9-view.po';
import { TestcaseB6a8fe23ViewPO } from './page-object/testcase-b6a8fe23-view.po';
import { Testcase5782ab19ViewPO } from './page-object/testcase-5782ab19-view.po';
import { Testcase68f302b4ViewPO } from './page-object/testcase-68f302b4-view-po';

describe('View', () => {

  const hostAppPO = new HostAppPO();
  const testingViewPO = new TestingViewPO();

  beforeEach(async () => {
    await browser.get('/');
  });

  describe('Registration', () => {

    it('should be registered as specified in the manifest [testcase: ffd6a78f-view]', async () => {
      const activityItemPO = await hostAppPO.findActivityItem('e2e-activity-ffd6a78f');

      await expect(activityItemPO.getTitle()).toEqual('a1ebdaf5cb37');
      await expect(activityItemPO.getText()).toEqual('');

      await activityItemPO.click();
      await expectViewToShow({symbolicAppName: 'testing-app', viewCssClass: 'e2e-view-ffd6a78f', componentSelector: 'app-view-ffd6a78f'});

      const viewTabPO: ViewTabPO = await hostAppPO.findViewTab('e2e-view-ffd6a78f');
      await expect(viewTabPO.getTitle()).toEqual('bd3f2784cf0a');
      await expect(viewTabPO.getHeading()).toEqual('5abffe076b58');
      await expect(viewTabPO.isClosable()).toBeTruthy('closable');

      const viewPO = new TestcaseFfd6a78fViewPO();
      await expect(viewPO.getUrlParameters()).toEqual({mp1: '667b2594253b', mp2: '74823e27f1f6'});
      await expect(viewPO.getUrlQueryParameters()).toEqual({qp1: 'ccd50ae933f8', qp2: 'fdc1ad050078'});
    });
  });

  describe('Interaction', () => {

    it('should allow to change view properties', async () => {
      await testingViewPO.navigateTo();
      await expectViewToShow({symbolicAppName: 'testing-app', viewCssClass: 'e2e-testing-view', componentSelector: 'app-testing-view'});

      const viewTab: ViewTabPO = await hostAppPO.findViewTab('e2e-testing-view');
      await expect(viewTab).not.toBeNull('ViewTab not found: e2e-testing-view');

      const viewInteractionPO = await testingViewPO.openViewInteractionPanel();

      await viewInteractionPO.enterTitle('e2e:title');
      await expect(viewTab.getTitle()).toEqual('e2e:title');

      await viewInteractionPO.enterHeading('e2e:heading');
      await expect(viewTab.getHeading()).toEqual('e2e:heading');

      await viewInteractionPO.markDirty(true);
      await expect(viewTab.isDirty()).toBeTruthy('dirty');

      await viewInteractionPO.markDirty(false);
      await expect(viewTab.isDirty()).toBeFalsy('not dirty');

      await viewInteractionPO.setClosable(true);
      await expect(viewTab.isClosable()).toBeTruthy('closable');

      await viewInteractionPO.setClosable(false);
      await expect(viewTab.isClosable()).toBeFalsy('not closable');
    });

    it('should allow to close the view', async () => {
      await testingViewPO.navigateTo();

      const viewInteractionPO = await testingViewPO.openViewInteractionPanel();
      await viewInteractionPO.close();

      await expect(hostAppPO.findViewTab('e2e-testing-view')).toBeNull('ViewTab still open: e2e-testing-view');
    });

    it('should allow to close the view via \'view-tab\' close button', async () => {
      await testingViewPO.navigateTo();

      const viewTab: ViewTabPO = await hostAppPO.findViewTab('e2e-testing-view');
      await expect(viewTab).not.toBeNull('ViewTab not found: e2e-testing-view');

      const viewInteractionPO = await testingViewPO.openViewInteractionPanel();
      await viewInteractionPO.setClosable(true);
      await viewTab.close();
      await expect(hostAppPO.findViewTab('e2e-testing-view')).toBeNull('ViewTab still open: e2e-testing-view');
    });

    it('should allow to prevent closing the view if closed via close button [testcase: 0c4fe9e3-view]', async () => {
      await testingViewPO.navigateTo();

      const viewNavigationPO = await testingViewPO.openViewNavigationPanel();
      await viewNavigationPO.enterQualifier({
        entity: 'testing',
        testcase: '0c4fe9e3-view',
      });
      await viewNavigationPO.selectTarget('blank');
      await viewNavigationPO.execute();
      await expectViewToShow({symbolicAppName: 'testing-app', viewCssClass: 'e2e-view-0c4fe9e3', componentSelector: 'app-view-0c4fe9e3'});

      // Close the view
      const viewTabPO: ViewTabPO = await hostAppPO.findViewTab('e2e-view-0c4fe9e3');

      // Click close button but cancel closing
      await viewTabPO.close();
      await expectViewToShow({symbolicAppName: 'testing-app', viewCssClass: 'e2e-view-0c4fe9e3', componentSelector: 'app-view-0c4fe9e3'});

      const msgbox1 = await hostAppPO.findMessageBox('e2e-confirm-closing');
      await expect(msgbox1).not.toBeNull('expected closing confirmation message box');
      await msgbox1.close('e2e-no');
      await expectViewToShow({symbolicAppName: 'testing-app', viewCssClass: 'e2e-view-0c4fe9e3', componentSelector: 'app-view-0c4fe9e3'});

      // Click close button and confirm closing
      await viewTabPO.close();
      const msgbox2PO = await hostAppPO.findMessageBox('e2e-confirm-closing');
      await expect(msgbox2PO).not.toBeNull('expected closing confirmation message box');
      await msgbox2PO.close('e2e-yes');
      await expectViewToNotExist({symbolicAppName: 'testing-app', viewCssClass: 'e2e-view-0c4fe9e3'});
    });

    // // TODO testcase not working because routing bug
    // // TODO dwie add issue number
    // // TODO see https://github.com/angular/angular/pull/25740
    // // TODO `First, we will no longer have multiple navigations running at the same time.`
    // it('should allow to prevent closing the view if closed via navigation [testcase: 0c4fe9e3-view]', async () => {
    //   await testingViewPO.navigateTo();
    //
    //   const viewNavigationPO = await testingViewPO.openViewNavigationPanel();
    //   await viewNavigationPO.enterQualifier({
    //     entity: 'testing',
    //     testcase: '0c4fe9e3-view',
    //   });
    //   await viewNavigationPO.selectTarget('blank');
    //   await viewNavigationPO.execute();
    //   await expectViewToShow({symbolicAppName: 'testing-app', viewCssClass: 'e2e-view-0c4fe9e3', componentSelector: 'app-view-0c4fe9e3'});
    //
    //   // Go back to the testing view
    //   const testingViewTabPO: ViewTabPO = await hostAppPO.findViewTab('e2e-testing-view');
    //   await testingViewTabPO.click();
    //   await expectViewToShow({symbolicAppName: 'testing-app', viewCssClass: 'e2e-testing-view', componentSelector: 'app-testing-view'});
    //   await expect(hostAppPO.getViewTabCount()).toBe(2);
    //
    //   // Close the view 'e2e-view-608aa47c' via navigation but cancel closing
    //   await viewNavigationPO.enterQualifier({
    //     entity: 'testing',
    //     testcase: '0c4fe9e3-view',
    //   });
    //   await viewNavigationPO.checkCloseIfPresent(true);
    //   await viewNavigationPO.execute();
    //   await expectViewToShow({symbolicAppName: 'testing-app', viewCssClass: 'e2e-view-0c4fe9e3', componentSelector: 'app-view-0c4fe9e3'});
    //
    //   const msgbox1PO = await hostAppPO.findMessageBox('e2e-confirm-closing');
    //   await expect(msgbox1PO).not.toBeNull('expected closing confirmation message box');
    //   await msgbox1PO.close('e2e-no');
    //   await expectViewToShow({symbolicAppName: 'testing-app', viewCssClass: 'e2e-view-0c4fe9e3', componentSelector: 'app-view-0c4fe9e3'});
    //
    //   // Close the view 'e2e-view-608aa47c' via navigation and confirm closing
    //   await viewNavigationPO.enterQualifier({
    //     entity: 'testing',
    //     testcase: '0c4fe9e3-view',
    //   });
    //   await viewNavigationPO.checkCloseIfPresent(true);
    //   await viewNavigationPO.execute();
    //   await expectViewToShow({symbolicAppName: 'testing-app', viewCssClass: 'e2e-view-0c4fe9e3', componentSelector: 'app-view-0c4fe9e3'});
    //
    //   const msgbox2PO = await hostAppPO.findMessageBox('e2e-confirm-closing');
    //   await expect(msgbox2PO).not.toBeNull('expected closing confirmation message box');
    //   await msgbox2PO.close('e2e-yes');
    //   await expectViewToNotExist('e2e-view-0c4fe9e3');
    //   await expect(hostAppPO.getViewTabCount()).toBe(1);
    // });

    it('should receive an activate event if activated, and receive a deactivate event if deactivated [testcase: 28f32b51-view]', async () => {
      await testingViewPO.navigateTo();
      const viewPO = new Testcase28f32b51ViewPO();

      const viewNavigationPO = await testingViewPO.openViewNavigationPanel();
      await viewNavigationPO.enterQualifier({
        entity: 'testing',
        testcase: '28f32b51-view',
      });
      await viewNavigationPO.selectTarget('blank');
      await viewNavigationPO.execute();
      await expectViewToShow({symbolicAppName: 'testing-app', viewCssClass: 'e2e-view-28f32b51', componentSelector: 'app-view-28f32b51'});
      await expect(viewPO.readActiveLog()).toEqual([true]);

      await hostAppPO.clickViewTab('e2e-testing-view');
      await expectViewToShow({symbolicAppName: 'testing-app', viewCssClass: 'e2e-testing-view', componentSelector: 'app-testing-view'});

      await hostAppPO.clickViewTab('e2e-view-28f32b51');
      await expectViewToShow({symbolicAppName: 'testing-app', viewCssClass: 'e2e-view-28f32b51', componentSelector: 'app-view-28f32b51'});
      await expect(viewPO.readActiveLog()).toEqual([true, false, true]);
    });
  });

  describe('Navigation', () => {

    it('should allow navigation to private views of the same application (implicit intent) [testcase: 354aa6da-view]', async () => {
      await testingViewPO.navigateTo();

      const viewNavigationPO = await testingViewPO.openViewNavigationPanel();
      await viewNavigationPO.enterQualifier({
        entity: 'testing',
        testcase: '354aa6da-view',
      });
      await viewNavigationPO.selectTarget('blank');
      await viewNavigationPO.execute();

      await expectViewToShow({symbolicAppName: 'testing-app', viewCssClass: 'e2e-view-354aa6da', componentSelector: 'app-view-354aa6da'});
    });

    it('should allow navigation to public views of the same application (implicit intent) [testcase: 85dde646-view]', async () => {
      await testingViewPO.navigateTo();

      const viewNavigationPO = await testingViewPO.openViewNavigationPanel();
      await viewNavigationPO.enterQualifier({
        entity: 'testing',
        testcase: '85dde646-view',
      });
      await viewNavigationPO.selectTarget('blank');
      await viewNavigationPO.execute();

      await expectViewToShow({symbolicAppName: 'testing-app', viewCssClass: 'e2e-view-85dde646', componentSelector: 'app-view-85dde646'});
    });

    it('should allow navigation to public views of other applications', async () => {
      await testingViewPO.navigateTo();

      const viewNavigationPO = await testingViewPO.openViewNavigationPanel();
      await viewNavigationPO.enterQualifier({
        entity: 'communication',
        presentation: 'list',
        contactId: '5',
      });
      await viewNavigationPO.selectTarget('blank');
      await viewNavigationPO.execute();

      await expectViewToShow({symbolicAppName: 'communication-app', viewCssClass: 'e2e-communication-list', componentSelector: 'app-communication-view'});
    });

    it('should not allow navigation to public views of other applications if missing the intent', async () => {
      await testingViewPO.navigateTo();

      const viewNavigationPO = await testingViewPO.openViewNavigationPanel();
      await viewNavigationPO.enterQualifier({
        entity: 'communication',
        presentation: 'list',
        contactId: '999',
      });
      await viewNavigationPO.selectTarget('blank');
      await viewNavigationPO.execute();

      const notificationPO = await hostAppPO.findNotification('e2e-not-qualified');
      await expect(notificationPO).not.toBeNull();
      await expect(notificationPO.getSeverity()).toEqual('error');
      await expectViewToNotExist({symbolicAppName: 'communication-app', viewCssClass: 'e2e-communication-list'});
    });

    it('should not allow navigation to private views of other applications', async () => {
      await testingViewPO.navigateTo();

      const viewNavigationPO = await testingViewPO.openViewNavigationPanel();
      await viewNavigationPO.enterQualifier({
        entity: 'contact',
        id: '5',
      });
      await viewNavigationPO.selectTarget('blank');
      await viewNavigationPO.execute();

      const notificationPO = await hostAppPO.findNotification('e2e-not-handled');
      await expect(notificationPO).not.toBeNull();
      await expect(notificationPO.getSeverity()).toEqual('error');
      await expectViewToNotExist({symbolicAppName: 'contact-app', viewCssClass: 'e2e-contact'});
    });

    it('should allow to provide query and matrix parameters [testcase: 56657ad1-view]', async () => {
      await testingViewPO.navigateTo();

      const viewNavigationPO = await testingViewPO.openViewNavigationPanel();
      await viewNavigationPO.enterQualifier({
        entity: 'testing',
        testcase: '56657ad1-view',
      });
      await viewNavigationPO.enterMatrixParams({
        mp1: '41ecdefec0a3',
        mp2: 'da67bd554b36',
      });
      await viewNavigationPO.enterQueryParams({
        qp1: '6378a62700d3',
        qp2: 'c5a37d3660ba',
      });
      await viewNavigationPO.selectTarget('blank');
      await viewNavigationPO.execute();

      await expectViewToShow({symbolicAppName: 'testing-app', viewCssClass: 'e2e-view-56657ad1', componentSelector: 'app-view-56657ad1'});

      const viewPO = new Testcase56657ad1ViewPO();
      const urlParams = await viewPO.getUrlParameters();
      await expect(urlParams).toEqual({
        mp1: '41ecdefec0a3',
        mp2: 'da67bd554b36',
      });

      const urlQueryParams = await viewPO.getUrlQueryParameters();
      await expect(urlQueryParams).toEqual({
        qp1: '6378a62700d3',
        qp2: 'c5a37d3660ba',
      });
    });

    it('should allow to receive query and matrix parameters as specified in the manifest [testcase: c8e40918-view]', async () => {
      await testingViewPO.navigateTo();

      const viewNavigationPO = await testingViewPO.openViewNavigationPanel();
      await viewNavigationPO.enterQualifier({
        entity: 'testing',
        testcase: 'c8e40918-view',
      });

      await viewNavigationPO.selectTarget('blank');
      await viewNavigationPO.execute();

      await expectViewToShow({symbolicAppName: 'testing-app', viewCssClass: 'e2e-view-c8e40918', componentSelector: 'app-view-c8e40918'});

      const viewPO = new TestcaseC8e40918ViewPO();
      const urlParams = await viewPO.getUrlParameters();
      await expect(urlParams).toEqual({
        mp1: 'd52f5f88be27',
        mp2: '01aa011fb2f4',
      });

      const urlQueryParams = await viewPO.getUrlQueryParameters();
      await expect(urlQueryParams).toEqual({
        qp1: 'f3227d5926c0',
        qp2: '88a9cd0cb937',
      });
    });

    it('should allow to merge query and matrix parameters provided from intent (overwrite) and manifest [testcase: a686d615-view]', async () => {
      await testingViewPO.navigateTo();

      const viewNavigationPO = await testingViewPO.openViewNavigationPanel();
      await viewNavigationPO.enterQualifier({
        entity: 'testing',
        testcase: 'a686d615-view',
      });
      await viewNavigationPO.enterMatrixParams({
        mp1: '557c7323a13c',
        mp2: '67dbebc8dd7c',
      });
      await viewNavigationPO.enterQueryParams({
        qp1: 'a3fa547519cf',
        qp2: 'db03e5494054',
      });

      await viewNavigationPO.selectTarget('blank');
      await viewNavigationPO.execute();

      await expectViewToShow({symbolicAppName: 'testing-app', viewCssClass: 'e2e-view-a686d615', componentSelector: 'app-view-a686d615'});

      const viewPO = new TestcaseA686d615ViewPO();
      const urlParams = await viewPO.getUrlParameters();
      await expect(urlParams).toEqual({
        mp1: '557c7323a13c',
        mp2: '67dbebc8dd7c',
        mpx: 'f406422c77fc',
      });

      const urlQueryParams = await viewPO.getUrlQueryParameters();
      await expect(urlQueryParams).toEqual({
        qp1: 'a3fa547519cf',
        qp2: 'db03e5494054',
        qpx: '18c9d6c51b0c',
      });
    });

    it('should allow to navigate to an opened view (activateIfPresent=true) [testcase: 4a4e6970-view]', async () => {
      await testingViewPO.navigateTo();

      const viewNavigationPO = await testingViewPO.openViewNavigationPanel();
      await viewNavigationPO.enterQualifier({
        entity: 'testing',
        testcase: '4a4e6970-view',
      });
      await viewNavigationPO.selectTarget('blank');
      await viewNavigationPO.execute();
      await expectViewToShow({symbolicAppName: 'testing-app', viewCssClass: 'e2e-view-4a4e6970', componentSelector: 'app-view-4a4e6970'});
      await expect(hostAppPO.getViewTabCount()).toBe(2);

      // Go back to the testing view
      const testingViewTabPO: ViewTabPO = await hostAppPO.findViewTab('e2e-testing-view');
      await testingViewTabPO.click();
      await expectViewToShow({symbolicAppName: 'testing-app', viewCssClass: 'e2e-testing-view', componentSelector: 'app-testing-view'});
      await expect(hostAppPO.getViewTabCount()).toBe(2);

      // Navigate to already opened view 'e2e-view-4a4e6970'
      await viewNavigationPO.enterQualifier({
        entity: 'testing',
        testcase: '4a4e6970-view',
      });
      await viewNavigationPO.selectTarget('blank');
      await viewNavigationPO.checkActivateIfPresent(true);
      await viewNavigationPO.execute();
      await expectViewToShow({symbolicAppName: 'testing-app', viewCssClass: 'e2e-view-4a4e6970', componentSelector: 'app-view-4a4e6970'});
      await expect(hostAppPO.getViewTabCount()).toBe(2);

      // Go back to the testing view
      await testingViewTabPO.click();
      await expectViewToShow({symbolicAppName: 'testing-app', viewCssClass: 'e2e-testing-view', componentSelector: 'app-testing-view'});
      await expect(hostAppPO.getViewTabCount()).toBe(2);

      // Navigate to new 'e2e-view-4a4e6970' view
      await viewNavigationPO.enterQualifier({
        entity: 'testing',
        testcase: '4a4e6970-view',
      });
      await viewNavigationPO.selectTarget('blank');
      await viewNavigationPO.checkActivateIfPresent(false);
      await viewNavigationPO.execute();
      await expect(hostAppPO.getViewTabCount()).toBe(3);
    });

    it('should activate an already opened view even if using \'self\' target strategy (activateIfPresent=true, target=self) [testcase: b1dd152a-view]', async () => {
      await testingViewPO.navigateTo();

      const viewNavigationPO = await testingViewPO.openViewNavigationPanel();
      await viewNavigationPO.enterQualifier({
        entity: 'testing',
        testcase: 'b1dd152a-view',
      });
      await viewNavigationPO.selectTarget('blank');
      await viewNavigationPO.execute();
      await expectViewToShow({symbolicAppName: 'testing-app', viewCssClass: 'e2e-view-b1dd152a', componentSelector: 'app-view-b1dd152a'});
      await expect(hostAppPO.getViewTabCount()).toBe(2);

      // Go back to the testing view
      const testingViewTabPO: ViewTabPO = await hostAppPO.findViewTab('e2e-testing-view');
      await testingViewTabPO.click();
      await expectViewToShow({symbolicAppName: 'testing-app', viewCssClass: 'e2e-testing-view', componentSelector: 'app-testing-view'});
      await expect(hostAppPO.getViewTabCount()).toBe(2);

      // Navigate to already opened view 'e2e-view-b1dd152a'
      await viewNavigationPO.enterQualifier({
        entity: 'testing',
        testcase: 'b1dd152a-view',
      });
      await viewNavigationPO.selectTarget('self'); // use self target
      await viewNavigationPO.checkActivateIfPresent(true);
      await viewNavigationPO.execute();
      await expectViewToShow({symbolicAppName: 'testing-app', viewCssClass: 'e2e-view-b1dd152a', componentSelector: 'app-view-b1dd152a'});
      await expect(hostAppPO.getViewTabCount()).toBe(2);
    });

    it('should allow to close an opened view (closeIfPresent=true) [testcase: 608aa47c-view]', async () => {
      await testingViewPO.navigateTo();

      const viewNavigationPO = await testingViewPO.openViewNavigationPanel();
      await viewNavigationPO.enterQualifier({
        entity: 'testing',
        testcase: '608aa47c-view',
      });
      await viewNavigationPO.selectTarget('blank');
      await viewNavigationPO.execute();
      await expectViewToShow({symbolicAppName: 'testing-app', viewCssClass: 'e2e-view-608aa47c', componentSelector: 'app-view-608aa47c'});
      await expect(hostAppPO.getViewTabCount()).toBe(2);

      // Go back to the testing view
      const testingViewTabPO: ViewTabPO = await hostAppPO.findViewTab('e2e-testing-view');
      await testingViewTabPO.click();
      await expectViewToShow({symbolicAppName: 'testing-app', viewCssClass: 'e2e-testing-view', componentSelector: 'app-testing-view'});
      await expect(hostAppPO.getViewTabCount()).toBe(2);

      // Close the view 'e2e-view-608aa47c' via navigation
      await viewNavigationPO.enterQualifier({
        entity: 'testing',
        testcase: '608aa47c-view',
      });
      await viewNavigationPO.checkCloseIfPresent(true);
      await viewNavigationPO.execute();
      await expectViewToShow({symbolicAppName: 'testing-app', viewCssClass: 'e2e-testing-view', componentSelector: 'app-testing-view'});
      await expect(hostAppPO.getViewTabCount()).toBe(1);
    });

    it('should allow to open another view in the same view outlet (target=self) [testcase: f389a9d5-view]', async () => {
      await testingViewPO.navigateTo();

      const viewNavigationPO = await testingViewPO.openViewNavigationPanel();
      await viewNavigationPO.enterQualifier({
        entity: 'testing',
        testcase: 'f389a9d5-view',
      });
      await viewNavigationPO.selectTarget('self');
      await viewNavigationPO.execute();
      await expectViewToShow({symbolicAppName: 'testing-app', viewCssClass: 'e2e-view-f389a9d5', componentSelector: 'app-view-f389a9d5'});
      await expect(hostAppPO.getViewTabCount()).toBe(1);
    });

    it('should substitute path parameters with values from the intent qualifier [testcase: cc977da9-view]', async () => {
      await testingViewPO.navigateTo();

      const viewNavigationPO = await testingViewPO.openViewNavigationPanel();
      await viewNavigationPO.enterQualifier({
        entity: 'testing',
        testcase: 'cc977da9-view',
        qualifierParam1: 'e82bf49c4768',
        qualifierParam2: '1b84a4a926f7',
      });
      await viewNavigationPO.selectTarget('self');
      await viewNavigationPO.execute();
      await expectViewToShow({symbolicAppName: 'testing-app', viewCssClass: 'e2e-view-cc977da9', componentSelector: 'app-view-cc977da9'});

      const viewPO = new TestcaseCc977da9ViewPO();
      const urlParams = await viewPO.getUrlParameters();
      await expect(urlParams).toEqual({
        a: 'e82bf49c4768',
        b: '1b84a4a926f7',
      });

      const urlQueryParams = await viewPO.getUrlQueryParameters();
      await expect(urlQueryParams).toBeNull();
    });

    it('should substitute matrix and query parameters with values from the intent qualifier [testcase: b6a8fe23-view]', async () => {
      await testingViewPO.navigateTo();

      const viewNavigationPO = await testingViewPO.openViewNavigationPanel();
      await viewNavigationPO.enterQualifier({
        entity: 'testing',
        testcase: 'b6a8fe23-view',
        qualifierParam1: 'd8b74df2c77d',
        qualifierParam2: 'e60c81360bee',
      });
      await viewNavigationPO.selectTarget('self');
      await viewNavigationPO.execute();
      await expectViewToShow({symbolicAppName: 'testing-app', viewCssClass: 'e2e-view-b6a8fe23', componentSelector: 'app-view-b6a8fe23'});

      const viewPO = new TestcaseB6a8fe23ViewPO();
      const urlParams = await viewPO.getUrlParameters();
      await expect(urlParams).toEqual({
        matrixParam1: 'd8b74df2c77d',
        matrixParam2: 'eda2e91468e1',
        pathParam1: 'd8b74df2c77d',
      });

      const urlQueryParams = await viewPO.getUrlQueryParameters();
      await expect(urlQueryParams).toEqual({
        queryParam1: 'e60c81360bee',
        queryParam2: '1a3d3aaf937e',
      });
    });

    it('should not show the iframe of inactive views [testcase: be587bd6-view]', async () => {
      await testingViewPO.navigateTo();
      await expectViewToShow({symbolicAppName: 'testing-app', viewCssClass: 'e2e-testing-view', componentSelector: 'app-testing-view'});

      // Navigate to be587bd6 view
      const viewNavigationPO = await testingViewPO.openViewNavigationPanel();
      await viewNavigationPO.enterQualifier({
        entity: 'testing',
        testcase: 'be587bd6-view',
      });
      await viewNavigationPO.selectTarget('blank');
      await viewNavigationPO.execute();
      await expectViewToShow({symbolicAppName: 'testing-app', viewCssClass: 'e2e-view-be587bd6', componentSelector: 'app-view-be587bd6'});
      await expectViewToExistButHidden({symbolicAppName: 'testing-app', viewCssClass: 'e2e-testing-view'});

      // Go to to testing view
      await hostAppPO.clickViewTab('e2e-testing-view');
      await expectViewToShow({symbolicAppName: 'testing-app', viewCssClass: 'e2e-testing-view', componentSelector: 'app-testing-view'});
      await expectViewToExistButHidden({symbolicAppName: 'testing-app', viewCssClass: 'e2e-view-be587bd6'});

      // // Go to be587bd6 view
      await hostAppPO.clickViewTab('e2e-view-be587bd6');
      await expectViewToShow({symbolicAppName: 'testing-app', viewCssClass: 'e2e-view-be587bd6', componentSelector: 'app-view-be587bd6'});
      await expectViewToExistButHidden({symbolicAppName: 'testing-app', viewCssClass: 'e2e-testing-view'});
      //
      // // Close be587bd6 view
      const viewTab = await hostAppPO.findViewTab('e2e-view-be587bd6');
      await viewTab.close();
      await expectViewToShow({symbolicAppName: 'testing-app', viewCssClass: 'e2e-testing-view', componentSelector: 'app-testing-view'});
      await expectViewToNotExist({symbolicAppName: 'testing-app', viewCssClass: 'e2e-view-be587bd6'});
    });

    it('should not add an entry to the browser\'s history when navigating within the same app [testcase: cba33eaf-view]', async () => {
      await testingViewPO.navigateTo();
      const testingViewUrl = await hostAppPO.getCurrentBrowserUrl();

      const viewNavigationPO = await testingViewPO.openViewNavigationPanel();
      await viewNavigationPO.enterQualifier({
        entity: 'testing',
        testcase: 'cba33eaf-view',
      });

      await viewNavigationPO.selectTarget('self');
      await viewNavigationPO.checkActivateIfPresent(false);
      await viewNavigationPO.execute();

      await expectViewToShow({symbolicAppName: 'testing-app', viewCssClass: 'e2e-view-cba33eaf', componentSelector: 'app-view-cba33eaf'});

      // Hit browser back button
      await hostAppPO.navigateBack();

      await expectViewToShow({symbolicAppName: 'testing-app', viewCssClass: 'e2e-testing-view', componentSelector: 'app-testing-view'});
      await expect(hostAppPO.getCurrentBrowserUrl()).toEqual(testingViewUrl);

      // expect no 'postMessage' error to be thrown
      await expect(hostAppPO.hasBrowserError('Failed to execute \'postMessage\' on \'DOMWindow\'')).toBeFalsy();
    });

    it('should not add an entry to the browser\'s history when navigating to another app [testcase: cba33eaf-view]', async () => {
      await testingViewPO.navigateTo();
      const testingViewUrl = await hostAppPO.getCurrentBrowserUrl();

      const viewNavigationPO = await testingViewPO.openViewNavigationPanel();
      await viewNavigationPO.enterQualifier({
        entity: 'communication',
        presentation: 'list',
        contactId: '5',
      });

      await viewNavigationPO.selectTarget('self');
      await viewNavigationPO.checkActivateIfPresent(false);
      await viewNavigationPO.execute();

      await expectViewToShow({symbolicAppName: 'communication-app', viewCssClass: 'e2e-communication-list', componentSelector: 'app-communication-view'});

      // Hit browser back button
      await hostAppPO.navigateBack();

      await expectViewToShow({symbolicAppName: 'testing-app', viewCssClass: 'e2e-testing-view', componentSelector: 'app-testing-view'});
      await expect(hostAppPO.getCurrentBrowserUrl()).toEqual(testingViewUrl);

      // expect no 'postMessage' error to be thrown
      await expect(hostAppPO.hasBrowserError('Failed to execute \'postMessage\' on \'DOMWindow\'')).toBeFalsy();
    });
  });

  describe('Focus', () => {

    it('should cycle the focus in the view [testcase: 5782ab19-view]', async () => {
      await testingViewPO.navigateTo();
      const viewPanelPO = await testingViewPO.openViewNavigationPanel();
      await viewPanelPO.enterQualifier({
        entity: 'testing',
        testcase: '5782ab19-view',
      });
      await viewPanelPO.selectTarget('blank');
      await viewPanelPO.execute();
      await expectViewToShow({symbolicAppName: 'testing-app', viewCssClass: 'e2e-view-5782ab19', componentSelector: 'app-view-5782ab19'});

      const viewPO = new Testcase5782ab19ViewPO();
      await expect(viewPO.isActiveElement('field-1')).toBeTruthy('(1)');

      await viewPO.pressTab();
      await expect(viewPO.isActiveElement('field-2')).toBeTruthy('(2)');

      await viewPO.pressTab();
      await expect(viewPO.isActiveElement('field-3')).toBeTruthy('(3)');

      await viewPO.pressTab();
      await expect(viewPO.isActiveElement('field-1')).toBeTruthy('(4)');

      await viewPO.pressTab();
      await expect(viewPO.isActiveElement('field-2')).toBeTruthy('(5)');

      await viewPO.pressTab();
      await expect(viewPO.isActiveElement('field-3')).toBeTruthy('(6)');

      await viewPO.pressShiftTab();
      await expect(viewPO.isActiveElement('field-2')).toBeTruthy('(7)');

      await viewPO.pressShiftTab();
      await expect(viewPO.isActiveElement('field-1')).toBeTruthy('(8)');

      await viewPO.pressShiftTab();
      await expect(viewPO.isActiveElement('field-3')).toBeTruthy('(9)');

      await viewPO.pressShiftTab();
      await expect(viewPO.isActiveElement('field-2')).toBeTruthy('(10)');

      await viewPO.pressShiftTab();
      await expect(viewPO.isActiveElement('field-1')).toBeTruthy('(11)');
    });

    it('should restore the focus upon view activation [testcase: 5782ab19-view]', async () => {
      await testingViewPO.navigateTo();
      const viewPanelPO = await testingViewPO.openViewNavigationPanel();
      await viewPanelPO.enterQualifier({
        entity: 'testing',
        testcase: '5782ab19-view',
      });
      await viewPanelPO.selectTarget('blank');
      await viewPanelPO.execute();
      await expectViewToShow({symbolicAppName: 'testing-app', viewCssClass: 'e2e-view-5782ab19', componentSelector: 'app-view-5782ab19'});

      const viewPO = new Testcase5782ab19ViewPO();
      await expect(viewPO.isActiveElement('field-1')).toBeTruthy('(1)');

      await viewPO.pressTab();
      await expect(viewPO.isActiveElement('field-2')).toBeTruthy('(2)');

      await hostAppPO.clickViewTab('e2e-testing-view');
      await expectViewToShow({symbolicAppName: 'testing-app', viewCssClass: 'e2e-testing-view', componentSelector: 'app-testing-view'});

      await hostAppPO.clickViewTab('e2e-view-5782ab19');
      await expectViewToShow({symbolicAppName: 'testing-app', viewCssClass: 'e2e-view-5782ab19', componentSelector: 'app-view-5782ab19'});
      await expect(viewPO.isActiveElement('field-2')).toBeTruthy('(3)');
    });

    it('should autofocus the first element [testcase: 5782ab19-view]', async () => {
      await testingViewPO.navigateTo();
      const viewPanelPO = await testingViewPO.openViewNavigationPanel();
      await viewPanelPO.enterQualifier({
        entity: 'testing',
        testcase: '5782ab19-view',
      });
      await viewPanelPO.selectTarget('blank');
      await viewPanelPO.execute();
      await expectViewToShow({symbolicAppName: 'testing-app', viewCssClass: 'e2e-view-5782ab19', componentSelector: 'app-view-5782ab19'});

      const viewPO = new Testcase5782ab19ViewPO();
      await expect(viewPO.isActiveElement('field-1')).toBeTruthy('Expected first field to be the active element');
    });
  });

  describe('Application and view component lifecycle', () => {

    it('should not start a new app or create a new component instance upon path parameter change [testcase: 68f302b4-view]', async () => {
      await testingViewPO.navigateTo();
      let viewPanelPO = await testingViewPO.openViewNavigationPanel();
      await viewPanelPO.enterQualifier({
        entity: 'testing',
        testcase: '68f302b4-view',
        param: 'a99f7ef1444e',
      });
      await viewPanelPO.selectTarget('self');
      await viewPanelPO.execute();
      await expectViewToShow({symbolicAppName: 'testing-app', viewCssClass: 'e2e-view-68f302b4', componentSelector: 'app-view-68f302b4'});

      const viewPO = new Testcase68f302b4ViewPO();
      await expect(await viewPO.getUrlParameters()).toEqual({param: 'a99f7ef1444e'});

      const appInstanceUuid = await viewPO.getAppInstanceUuid();
      const componentInstanceUuid = await viewPO.getComponentInstanceUuid();

      // navigate to the same view anew
      viewPanelPO = viewPO.viewNavigationPanelPO;
      await viewPanelPO.enterQualifier({
        entity: 'testing',
        testcase: '68f302b4-view',
        param: '3fa90744020d',
      });
      await viewPanelPO.selectTarget('self');
      await viewPanelPO.execute();

      await expectViewToShow({symbolicAppName: 'testing-app', viewCssClass: 'e2e-view-68f302b4', componentSelector: 'app-view-68f302b4'});
      await expect(viewPO.getAppInstanceUuid()).toEqual(appInstanceUuid);
      await expect(viewPO.getComponentInstanceUuid()).toEqual(componentInstanceUuid);
      await expect(await viewPO.getUrlParameters()).toEqual({param: '3fa90744020d'});
    });

    it('should not start a new app or create a new component instance upon query parameter change [testcase: 68f302b4-view]', async () => {
      await testingViewPO.navigateTo();
      let viewPanelPO = await testingViewPO.openViewNavigationPanel();
      await viewPanelPO.enterQualifier({
        entity: 'testing',
        testcase: '68f302b4-view',
        param: 'a99f7ef1444e',
      });
      await viewPanelPO.selectTarget('self');
      await viewPanelPO.execute();
      await expectViewToShow({symbolicAppName: 'testing-app', viewCssClass: 'e2e-view-68f302b4', componentSelector: 'app-view-68f302b4'});

      const viewPO = new Testcase68f302b4ViewPO();
      await expect(await viewPO.getUrlParameters()).toEqual({param: 'a99f7ef1444e'});

      const appInstanceUuid = await viewPO.getAppInstanceUuid();
      const componentInstanceUuid = await viewPO.getComponentInstanceUuid();

      // navigate to the same view anew
      viewPanelPO = viewPO.viewNavigationPanelPO;
      await viewPanelPO.enterQualifier({
        entity: 'testing',
        testcase: '68f302b4-view',
        param: '22caa99deca5',
      });
      await viewPanelPO.enterQueryParams({
        queryParam: 'e1e519230b20',
      });
      await viewPanelPO.selectTarget('self');
      await viewPanelPO.execute();

      await expectViewToShow({symbolicAppName: 'testing-app', viewCssClass: 'e2e-view-68f302b4', componentSelector: 'app-view-68f302b4'});
      await expect(viewPO.getAppInstanceUuid()).toEqual(appInstanceUuid);
      await expect(viewPO.getComponentInstanceUuid()).toEqual(componentInstanceUuid);
      await expect(await viewPO.getUrlParameters()).toEqual({param: '22caa99deca5'});
      await expect(await viewPO.getUrlQueryParameters()).toEqual({queryParam: 'e1e519230b20'});
    });

    it('should not start a new app instance when navigating to another view of the same application [testcase: 68f302b4-view]', async () => {
      await testingViewPO.navigateTo();
      let viewPanelPO = await testingViewPO.openViewNavigationPanel();
      await viewPanelPO.enterQualifier({
        entity: 'testing',
        testcase: '68f302b4-view',
        param: 'a99f7ef1444e',
      });
      await viewPanelPO.selectTarget('self');
      await viewPanelPO.execute();
      await expectViewToShow({symbolicAppName: 'testing-app', viewCssClass: 'e2e-view-68f302b4', componentSelector: 'app-view-68f302b4'});

      const viewPO = new Testcase68f302b4ViewPO();
      await expect(await viewPO.getUrlParameters()).toEqual({param: 'a99f7ef1444e'});

      const appInstanceUuid = await viewPO.getAppInstanceUuid();
      const componentInstanceUuid = await viewPO.getComponentInstanceUuid();

      // navigate to the testing view
      viewPanelPO = viewPO.viewNavigationPanelPO;
      await viewPanelPO.enterQualifier({entity: 'testing'});
      await viewPanelPO.selectTarget('self');
      await viewPanelPO.execute();
      await expectViewToShow({symbolicAppName: 'testing-app', viewCssClass: 'e2e-testing-view', componentSelector: 'app-testing-view'});

      // navigate to the view anew
      viewPanelPO = await testingViewPO.openViewNavigationPanel();
      await viewPanelPO.enterQualifier({
        entity: 'testing',
        testcase: '68f302b4-view',
        param: '544e3335e83c',
      });
      await viewPanelPO.selectTarget('self');
      await viewPanelPO.execute();

      await expectViewToShow({symbolicAppName: 'testing-app', viewCssClass: 'e2e-view-68f302b4', componentSelector: 'app-view-68f302b4'});
      await expect(viewPO.getAppInstanceUuid()).toEqual(appInstanceUuid);
      await expect(viewPO.getComponentInstanceUuid()).not.toEqual(componentInstanceUuid);
      await expect(await viewPO.getUrlParameters()).toEqual({param: '544e3335e83c'});
      await expect(await viewPO.getUrlQueryParameters()).toBeNull();
    });

    it('should attach previously detached view component instance when activating it [testcase: 68f302b4-view]', async () => {
      await testingViewPO.navigateTo();
      const viewPanelPO = await testingViewPO.openViewNavigationPanel();
      await viewPanelPO.enterQualifier({
        entity: 'testing',
        testcase: '68f302b4-view',
        param: 'a99f7ef1444e',
      });
      await viewPanelPO.selectTarget('blank');
      await viewPanelPO.execute();
      await expectViewToShow({symbolicAppName: 'testing-app', viewCssClass: 'e2e-view-68f302b4', componentSelector: 'app-view-68f302b4'});

      const viewPO = new Testcase68f302b4ViewPO();
      await expect(await viewPO.getUrlParameters()).toEqual({param: 'a99f7ef1444e'});

      const appInstanceUuid = await viewPO.getAppInstanceUuid();
      const componentInstanceUuid = await viewPO.getComponentInstanceUuid();

      // activate testing view
      await hostAppPO.clickViewTab('e2e-testing-view');
      await expectViewToShow({symbolicAppName: 'testing-app', viewCssClass: 'e2e-testing-view', componentSelector: 'app-testing-view'});

      // activate 68f302b4-view
      await hostAppPO.clickViewTab('e2e-view-68f302b4');
      await expectViewToShow({symbolicAppName: 'testing-app', viewCssClass: 'e2e-view-68f302b4', componentSelector: 'app-view-68f302b4'});

      await expect(viewPO.getAppInstanceUuid()).toEqual(appInstanceUuid);
      await expect(viewPO.getComponentInstanceUuid()).toEqual(componentInstanceUuid);
    });
  });
});

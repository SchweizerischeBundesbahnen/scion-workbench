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
import { expectPopupToNotExist, expectPopupToShow } from './util/testing.util';
import { browser, protractor } from 'protractor';
import { Testcase9c5319f7PopupPO } from './page-object/testcase-9c5319f7-popup.po';
import { Testcase45dc693fPopupPO } from './page-object/testcase-45dc693f-popup.po';
import { TestcaseF4286ac4PopupPO } from './page-object/testcase-f4286ac4-popup.po';
import { Testcase159913adPopupPO } from './page-object/testcase-159913ad-popup.po';
import { Testcase8a468258PopupPO } from './page-object/testcase-8a468258-popup.po';
import { Testcasefc077b32PopupPO } from './page-object/testcase-fc077b32-popup.po';
import { TestingPopupPO } from './page-object/testing-popup.po';
import { Testcase5782ab19PopupPO } from './page-object/testcase-5782ab19-popup.po';

describe('Popup', () => {
  const hostAppPO = new HostAppPO();
  const testingViewPO = new TestingViewPO();

  beforeEach(async () => {
    await browser.get('/');
  });

  describe('Navigation', () => {

    it('should allow navigation to private popups of the same application (implicit intent) [testcase: 1a90c8d2-popup]', async () => {
      await testingViewPO.navigateTo();

      const popupPanelPO = await testingViewPO.openPopupPanel();
      await popupPanelPO.enterQualifier({
        entity: 'testing',
        testcase: '1a90c8d2-popup',
      });
      await popupPanelPO.execute();

      await expectPopupToShow({symbolicAppName: 'testing-app', popupCssClass: 'e2e-popup-1a90c8d2', componentSelector: 'app-popup-1a90c8d2'});
    });

    it('should allow navigation to public popups of the same application (implicit intent) [testcase: 7330f506-popup]', async () => {
      await testingViewPO.navigateTo();

      const popupPanelPO = await testingViewPO.openPopupPanel();
      await popupPanelPO.enterQualifier({
        entity: 'testing',
        testcase: '7330f506-popup',
      });
      await popupPanelPO.execute();

      await expectPopupToShow({symbolicAppName: 'testing-app', popupCssClass: 'e2e-popup-7330f506', componentSelector: 'app-popup-7330f506'});
    });

    it('should allow navigation to public popups of other applications', async () => {
      await testingViewPO.navigateTo();

      const popupPanelPO = await testingViewPO.openPopupPanel();
      await popupPanelPO.enterQualifier({
        entity: 'communication',
        action: 'create',
        contactId: '5',
      });
      await popupPanelPO.execute();

      await expectPopupToShow({symbolicAppName: 'communication-app', popupCssClass: 'e2e-communication-create', componentSelector: 'app-communication-new-popup'});
    });

    it('should not allow navigation to public popups of other applications if missing the intent', async () => {
      await testingViewPO.navigateTo();

      const popupPanelPO = await testingViewPO.openPopupPanel();
      await popupPanelPO.enterQualifier({
        entity: 'communication',
        action: 'create',
        contactId: '999',
      });
      await popupPanelPO.execute();

      const notificationPO = await hostAppPO.findNotification('e2e-not-qualified');
      await expect(notificationPO).not.toBeNull();
      await expect(notificationPO.getSeverity()).toEqual('error');
      await expectPopupToNotExist({symbolicAppName: 'communication-app', popupCssClass: 'e2e-communication-create'});
    });

    it('should not allow navigation to private popups of other applications', async () => {
      await testingViewPO.navigateTo();

      const popupPanelPO = await testingViewPO.openPopupPanel();
      await popupPanelPO.enterQualifier({
        entity: 'contact',
        action: 'create',
      });
      await popupPanelPO.execute();

      const notificationPO = await hostAppPO.findNotification('e2e-not-handled');
      await expect(notificationPO).not.toBeNull();
      await expect(notificationPO.getSeverity()).toEqual('error');
      await expectPopupToNotExist({symbolicAppName: 'contact-app', popupCssClass: 'e2e-contact'});
    });

    it('should allow to provide query and matrix parameters [testcase: 9c5319f7-popup]', async () => {
      await testingViewPO.navigateTo();

      const popupPanelPO = await testingViewPO.openPopupPanel();
      await popupPanelPO.enterQualifier({
        entity: 'testing',
        testcase: '9c5319f7-popup'
      });
      await popupPanelPO.enterMatrixParams({
        mp1: '41ecdefec0a3',
        mp2: 'da67bd554b36',
      });
      await popupPanelPO.enterQueryParams({
        qp1: '6378a62700d3',
        qp2: 'c5a37d3660ba',
      });
      await popupPanelPO.execute();

      await expectPopupToShow({symbolicAppName: 'testing-app', popupCssClass: 'e2e-popup-9c5319f7', componentSelector: 'app-popup-9c5319f7'});

      const popupPO = new Testcase9c5319f7PopupPO();
      const urlParams = await popupPO.getUrlParameters();
      await expect(urlParams).toEqual({
        mp1: '41ecdefec0a3',
        mp2: 'da67bd554b36',
      });

      const urlQueryParams = await popupPO.getUrlQueryParameters();
      await expect(urlQueryParams).toEqual({
        qp1: '6378a62700d3',
        qp2: 'c5a37d3660ba',
      });
    });

    it('should allow to receive query and matrix parameters as specified in the manifest [testcase: 45dc693f-popup]', async () => {
      await testingViewPO.navigateTo();

      const popupPanelPO = await testingViewPO.openPopupPanel();
      await popupPanelPO.enterQualifier({
        entity: 'testing',
        testcase: '45dc693f-popup',
      });

      await popupPanelPO.execute();

      await expectPopupToShow({symbolicAppName: 'testing-app', popupCssClass: 'e2e-popup-45dc693f', componentSelector: 'app-popup-45dc693f'});

      const popupPO = new Testcase45dc693fPopupPO();
      const urlParams = await popupPO.getUrlParameters();
      await expect(urlParams).toEqual({
        mp1: 'd52f5f88be27',
        mp2: '01aa011fb2f4',
      });

      const urlQueryParams = await popupPO.getUrlQueryParameters();
      await expect(urlQueryParams).toEqual({
        qp1: 'f3227d5926c0',
        qp2: '88a9cd0cb937',
      });
    });

    it('should allow to merge query and matrix parameters provided from intent (overwrite) and manifest [testcase: f4286ac4-popup]', async () => {
      await testingViewPO.navigateTo();

      const popupPanelPO = await testingViewPO.openPopupPanel();
      await popupPanelPO.enterQualifier({
        entity: 'testing',
        testcase: 'f4286ac4-popup',
      });
      await popupPanelPO.enterMatrixParams({
        mp1: '557c7323a13c',
        mp2: '67dbebc8dd7c',
      });
      await popupPanelPO.enterQueryParams({
        qp1: 'a3fa547519cf',
        qp2: 'db03e5494054',
      });
      await popupPanelPO.execute();

      await expectPopupToShow({symbolicAppName: 'testing-app', popupCssClass: 'e2e-popup-f4286ac4', componentSelector: 'app-popup-f4286ac4'});

      const popupPO = new TestcaseF4286ac4PopupPO();
      const urlParams = await popupPO.getUrlParameters();
      await expect(urlParams).toEqual({
        mp1: '557c7323a13c',
        mp2: '67dbebc8dd7c',
        mpx: 'f406422c77fc',
      });

      const urlQueryParams = await popupPO.getUrlQueryParameters();
      await expect(urlQueryParams).toEqual({
        qp1: 'a3fa547519cf',
        qp2: 'db03e5494054',
        qpx: '18c9d6c51b0c',
      });
    });

    it('should substitute path parameters with values from the intent qualifier [testcase: 159913ad-popup]', async () => {
      await testingViewPO.navigateTo();

      const popupPanelPO = await testingViewPO.openPopupPanel();
      await popupPanelPO.enterQualifier({
        entity: 'testing',
        testcase: '159913ad-popup',
        qualifierParam1: 'e82bf49c4768',
        qualifierParam2: '1b84a4a926f7'
      });
      await popupPanelPO.execute();
      await expectPopupToShow({symbolicAppName: 'testing-app', popupCssClass: 'e2e-popup-159913ad', componentSelector: 'app-popup-159913ad'});

      const popupPO = new Testcase159913adPopupPO();
      const urlParams = await popupPO.getUrlParameters();
      await expect(urlParams).toEqual({
        a: 'e82bf49c4768',
        b: '1b84a4a926f7',
      });

      const urlQueryParams = await popupPO.getUrlQueryParameters();
      await expect(urlQueryParams).toBeNull();
    });

    it('should substitute matrix and query parameters with values from the intent qualifier [testcase: 8a468258-popup]', async () => {
      await testingViewPO.navigateTo();

      const popupPanelPO = await testingViewPO.openPopupPanel();
      await popupPanelPO.enterQualifier({
        entity: 'testing',
        testcase: '8a468258-popup',
        qualifierParam1: 'd8b74df2c77d',
        qualifierParam2: 'e60c81360bee',
      });
      await popupPanelPO.execute();
      await expectPopupToShow({symbolicAppName: 'testing-app', popupCssClass: 'e2e-popup-8a468258', componentSelector: 'app-popup-8a468258'});

      const popupPO = new Testcase8a468258PopupPO();
      const urlParams = await popupPO.getUrlParameters();
      await expect(urlParams).toEqual({
        matrixParam1: 'd8b74df2c77d',
        matrixParam2: 'eda2e91468e1',
        pathParam1: 'd8b74df2c77d',
      });

      const urlQueryParams = await popupPO.getUrlQueryParameters();
      await expect(urlQueryParams).toEqual({
        queryParam1: 'e60c81360bee',
        queryParam2: '1a3d3aaf937e'
      });
    });
  });

  describe('Properties', () => {
    it('should be positioned as specified [testcase: fc077b32-popup]', async () => {
      await testingViewPO.navigateTo();
      const popupPO = new Testcasefc077b32PopupPO();

      const popupPanelPO = await testingViewPO.openPopupPanel();
      await popupPanelPO.enterQualifier({
        entity: 'testing',
        testcase: 'fc077b32-popup'
      });

      await popupPanelPO.selectPosition('north');
      await popupPanelPO.execute();
      await expect(popupPO.getPosition()).toEqual('north');
      await popupPO.close();

      await popupPanelPO.selectPosition('east');
      await popupPanelPO.execute();
      await expect(popupPO.getPosition()).toEqual('east');
      await popupPO.close();

      await popupPanelPO.selectPosition('south');
      await popupPanelPO.execute();
      await expect(popupPO.getPosition()).toEqual('south');
      await popupPO.close();

      await popupPanelPO.selectPosition('west');
      await popupPanelPO.execute();
      await expect(popupPO.getPosition()).toEqual('west');
      await popupPO.close();
    });

    it('should close on focus lost', async () => {
      await testingViewPO.navigateTo();

      const popupPanelPO = await testingViewPO.openPopupPanel();
      await popupPanelPO.enterQualifier({
        entity: 'testing',
      });
      await popupPanelPO.checkCloseOnFocusLost(true);
      await popupPanelPO.execute();
      await expectPopupToShow({symbolicAppName: 'testing-app', popupCssClass: 'e2e-testing-popup', componentSelector: 'app-testing-popup'});

      // remove focus from the popup
      await testingViewPO.closePopupPanel();
      await expectPopupToNotExist({symbolicAppName: 'testing-app', popupCssClass: 'e2e-testing-popup'});
    });

    it('should not close on focus lost', async () => {
      await testingViewPO.navigateTo();

      const popupPanelPO = await testingViewPO.openPopupPanel();
      await popupPanelPO.enterQualifier({
        entity: 'testing',
      });
      await popupPanelPO.checkCloseOnFocusLost(false);
      await popupPanelPO.execute();
      await expectPopupToShow({symbolicAppName: 'testing-app', popupCssClass: 'e2e-testing-popup', componentSelector: 'app-testing-popup'});

      // remove focus from the popup
      await testingViewPO.closePopupPanel();
      await expectPopupToShow({symbolicAppName: 'testing-app', popupCssClass: 'e2e-testing-popup', componentSelector: 'app-testing-popup'});
    });

    it('should close on escape keystroke', async () => {
      await testingViewPO.navigateTo();

      const popupPanelPO = await testingViewPO.openPopupPanel();
      await popupPanelPO.enterQualifier({
        entity: 'testing',
      });
      await popupPanelPO.checkCloseOnEscape(true);
      await popupPanelPO.execute();
      await expectPopupToShow({symbolicAppName: 'testing-app', popupCssClass: 'e2e-testing-popup', componentSelector: 'app-testing-popup'});

      // send escape keystroke
      await browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
      await expectPopupToNotExist({symbolicAppName: 'testing-app', popupCssClass: 'e2e-testing-popup'});
    });

    it('should not close on escape keystroke', async () => {
      await testingViewPO.navigateTo();

      const popupPanelPO = await testingViewPO.openPopupPanel();
      await popupPanelPO.enterQualifier({
        entity: 'testing',
      });
      await popupPanelPO.checkCloseOnEscape(false);
      await popupPanelPO.execute();
      await expectPopupToShow({symbolicAppName: 'testing-app', popupCssClass: 'e2e-testing-popup', componentSelector: 'app-testing-popup'});

      // send escape keystroke
      await browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
      await expectPopupToShow({symbolicAppName: 'testing-app', popupCssClass: 'e2e-testing-popup', componentSelector: 'app-testing-popup'});
    });

    it('should close on grid layout change', async () => {
      // Open activity to have a sash
      await hostAppPO.clickActivityItem('e2e-contact-list');

      // Open popup
      await testingViewPO.navigateTo();
      const popupPanelPO = await testingViewPO.openPopupPanel();
      await popupPanelPO.enterQualifier({
        entity: 'testing',
      });
      await popupPanelPO.checkCloseOnFocusLost(false);
      await popupPanelPO.checkCloseOnGridLayoutChange(true);
      await popupPanelPO.execute();
      await expectPopupToShow({symbolicAppName: 'testing-app', popupCssClass: 'e2e-testing-popup', componentSelector: 'app-testing-popup'});

      // Make a grid layout change
      await hostAppPO.moveActivitySash(100);
      await expectPopupToNotExist({symbolicAppName: 'testing-app', popupCssClass: 'e2e-testing-popup'});
    });

    it('should not close on grid layout change', async () => {
      // Open activity to have a sash
      await hostAppPO.clickActivityItem('e2e-contact-list');

      // Open popup
      await testingViewPO.navigateTo();
      const popupPanelPO = await testingViewPO.openPopupPanel();
      await popupPanelPO.enterQualifier({
        entity: 'testing',
      });
      await popupPanelPO.checkCloseOnFocusLost(false);
      await popupPanelPO.checkCloseOnGridLayoutChange(false);
      await popupPanelPO.execute();
      await expectPopupToShow({symbolicAppName: 'testing-app', popupCssClass: 'e2e-testing-popup', componentSelector: 'app-testing-popup'});

      // Make a grid layout change
      await hostAppPO.moveActivitySash(100);
      await expectPopupToShow({symbolicAppName: 'testing-app', popupCssClass: 'e2e-testing-popup', componentSelector: 'app-testing-popup'});
    });
  });

  describe('Interaction', () => {

    it('should return the popup result', async () => {
      await testingViewPO.navigateTo();
      const popupPanelPO = await testingViewPO.openPopupPanel();
      await popupPanelPO.enterQualifier({
        entity: 'testing',
      });
      await popupPanelPO.checkCloseOnFocusLost(false);
      await popupPanelPO.checkCloseOnGridLayoutChange(false);
      await popupPanelPO.execute();
      await expectPopupToShow({symbolicAppName: 'testing-app', popupCssClass: 'e2e-testing-popup', componentSelector: 'app-testing-popup'});

      const json = {
        value1: '948a14cc1e06',
        value2: 'dd06acb924ed',
        value3: 'ef247df0be6e',
      };

      const popupPO = new TestingPopupPO();
      await popupPO.enterResult(json);
      await popupPO.ok();

      await expect(popupPanelPO.getResult()).toEqual(json);
    });
  });

  describe('Focus', () => {

    it('should cycle the focus in the popup [testcase: 5782ab19-popup]', async () => {
      await testingViewPO.navigateTo();
      const popupPanelPO = await testingViewPO.openPopupPanel();
      await popupPanelPO.enterQualifier({
        entity: 'testing',
        testcase: '5782ab19-popup',
      });
      await popupPanelPO.execute();
      await expectPopupToShow({symbolicAppName: 'testing-app', popupCssClass: 'e2e-popup-5782ab19', componentSelector: 'app-popup-5782ab19'});

      const popupPO = new Testcase5782ab19PopupPO();
      await expect(popupPO.isActiveElement('field-1')).toBeTruthy('(1)');

      await popupPO.pressTab();
      await expect(popupPO.isActiveElement('field-2')).toBeTruthy('(2)');

      await popupPO.pressTab();
      await expect(popupPO.isActiveElement('field-3')).toBeTruthy('(3)');

      await popupPO.pressTab();
      await expect(popupPO.isActiveElement('field-1')).toBeTruthy('(4)');

      await popupPO.pressTab();
      await expect(popupPO.isActiveElement('field-2')).toBeTruthy('(5)');

      await popupPO.pressTab();
      await expect(popupPO.isActiveElement('field-3')).toBeTruthy('(6)');

      await popupPO.pressShiftTab();
      await expect(popupPO.isActiveElement('field-2')).toBeTruthy('(7)');

      await popupPO.pressShiftTab();
      await expect(popupPO.isActiveElement('field-1')).toBeTruthy('(8)');

      await popupPO.pressShiftTab();
      await expect(popupPO.isActiveElement('field-3')).toBeTruthy('(9)');

      await popupPO.pressShiftTab();
      await expect(popupPO.isActiveElement('field-2')).toBeTruthy('(10)');

      await popupPO.pressShiftTab();
      await expect(popupPO.isActiveElement('field-1')).toBeTruthy('(11)');
    });

    it('should autofocus the first element [testcase: 5782ab19-popup]', async () => {
      await testingViewPO.navigateTo();
      const popupPanelPO = await testingViewPO.openPopupPanel();
      await popupPanelPO.enterQualifier({
        entity: 'testing',
        testcase: '5782ab19-popup',
      });
      await popupPanelPO.execute();
      await expectPopupToShow({symbolicAppName: 'testing-app', popupCssClass: 'e2e-popup-5782ab19', componentSelector: 'app-popup-5782ab19'});

      const popupPO = new Testcase5782ab19PopupPO();
      await expect(popupPO.isActiveElement('field-1')).toBeTruthy('Expected first field to be the active element');
    });
  });
});

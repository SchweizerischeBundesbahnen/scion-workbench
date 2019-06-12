/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { HostAppPO } from './page-object/host-app.po';
import { browser, protractor } from 'protractor';
import { expectActivityToExistButHidden, expectActivityToShow, expectPopupToNotExist, expectPopupToShow, expectViewToNotExist, expectViewToShow } from './util/testing.util';
import { TestingActivityPO } from './page-object/testing-activity.po';
import { Testcase4a3a8984ActivityPO } from './page-object/testcase-4a3a8984-activity-po';
import { Testcase28f32b51ActivityPO } from './page-object/testcase-28f32b51-activity.po';
import { Testcase5782ab19ActivityPO } from './page-object/testcase-5782ab19-activity.po';
import { Testcase56657ad1ViewPO } from './page-object/testcase-56657ad1-view.po';
import { TestcaseC8e40918ViewPO } from './page-object/testcase-c8e40918-view.po';
import { TestcaseA686d615ViewPO } from './page-object/testcase-a686d615-view.po';
import { TestingViewPO } from './page-object/testing-view.po';
import { TestcaseCc977da9ViewPO } from './page-object/testcase-cc977da9-view.po';
import { TestcaseB6a8fe23ViewPO } from './page-object/testcase-b6a8fe23-view.po';
import { Testcase9c5319f7PopupPO } from './page-object/testcase-9c5319f7-popup.po';
import { Testcase45dc693fPopupPO } from './page-object/testcase-45dc693f-popup.po';
import { TestcaseF4286ac4PopupPO } from './page-object/testcase-f4286ac4-popup.po';
import { Testcase159913adPopupPO } from './page-object/testcase-159913ad-popup.po';
import { Testcase8a468258PopupPO } from './page-object/testcase-8a468258-popup.po';

const E2E_TESTING_ACTIVITY_CONTEXT: string[] = ['e2e-testing-app', 'e2e-activity', 'e2e-testing-activity'];

describe('Activity', () => {

  const hostAppPO = new HostAppPO();

  beforeEach(async () => {
    await browser.get('/');
  });

  describe('Registration', () => {

    it('should be registered as specified in the manifest [testcase: d11be592-activity]', async () => {
      const activityItemPO = await hostAppPO.findActivityItem('e2e-activity-d11be592');

      await expect(activityItemPO.getTitle()).toEqual('d29b10b862ae');
      await expect(activityItemPO.getText()).toEqual('');
      await expect(activityItemPO.getCssClasses()).toContain('e2e-activity-d11be592');
      await expect(activityItemPO.getCssClasses()).toContain('fab');
      await expect(activityItemPO.getCssClasses()).toContain('fa-android');

      await activityItemPO.click();
      await expectActivityToShow({symbolicAppName: 'testing-app', activityCssClass: 'e2e-activity-d11be592', componentSelector: 'app-testing-activity'});

      const testingActivityPO = new TestingActivityPO(['e2e-testing-app', 'e2e-activity', 'e2e-activity-d11be592']);
      const activityPanelPO = await hostAppPO.findActivityPanel('e2e-activity-d11be592');
      await expect(testingActivityPO.getUrlParameters()).toEqual({manifestMatrixParam: 'manifestMatrixParamValue'});
      await expect(testingActivityPO.getUrlQueryParameters()).toEqual({manifestQueryParam: 'manifestQueryParamValue'});
      await expect(activityPanelPO.getTitle()).toEqual('d29b10b862ae');
      await expect(activityPanelPO.getCssClasses()).toContain('e2e-activity-d11be592');
    });
  });

  describe('Interaction', () => {

    it('should allow to change activity properties', async () => {
      const testingActivityPO = new TestingActivityPO(E2E_TESTING_ACTIVITY_CONTEXT);
      await testingActivityPO.navigateTo();
      await expectActivityToShow({symbolicAppName: 'testing-app', activityCssClass: 'e2e-testing-activity', componentSelector: 'app-testing-activity'});

      const activityInteractionPO = await testingActivityPO.openActivityInteractionPanel();
      const activityItemPO = await hostAppPO.findActivityItem('e2e-testing-activity');
      const activityPanelPO = await hostAppPO.findActivityPanel('e2e-testing-activity');

      await activityInteractionPO.enterTitle('e2e:title');
      await expect(activityItemPO.getTitle()).toEqual('e2e:title');
      await expect(activityPanelPO.getTitle()).toEqual('e2e:title');

      await activityInteractionPO.enterItemText('e2e:item-text');
      await expect(activityItemPO.getText()).toEqual('e2e:item-text');

      await activityInteractionPO.enterItemCssClass('e2e:item-css-class');
      await expect(activityItemPO.getCssClasses()).toContain('e2e:item-css-class');
      await expect(activityPanelPO.getCssClasses()).not.toContain('e2e:item-css-class');

      const sizeBefore = await activityPanelPO.getSize();
      await activityInteractionPO.enterDeltaPx(100);
      const sizeAfter = await activityPanelPO.getSize();
      await expect(sizeAfter.width).toEqual(sizeBefore.width + 100);
    });

    it('should allow to close the activity', async () => {
      const activityItemPO = await hostAppPO.findActivityItem('e2e-testing-activity');
      await activityItemPO.click();
      await expectActivityToShow({symbolicAppName: 'testing-app', activityCssClass: 'e2e-testing-activity', componentSelector: 'app-testing-activity'});

      // close the activity
      await activityItemPO.click();
      await expectActivityToExistButHidden({symbolicAppName: 'testing-app', activityCssClass: 'e2e-testing-activity'});
    });

    it('should attach previously detached activity component instance when activating it [testcase: 4a3a8984-activity]', async () => {
      const activityItemPO = await hostAppPO.findActivityItem('e2e-activity-4a3a8984');
      await activityItemPO.click();
      await expectActivityToShow({symbolicAppName: 'testing-app', activityCssClass: 'e2e-activity-4a3a8984', componentSelector: 'app-activity-4a3a8984'});

      const activityPO = new Testcase4a3a8984ActivityPO();
      const componentInstanceUuid = await activityPO.getComponentInstanceUuid();

      // close the activity
      await activityItemPO.click();
      await expectActivityToExistButHidden({symbolicAppName: 'testing-app', activityCssClass: 'e2e-activity-4a3a8984'});

      // open the activity
      await activityItemPO.click();
      await expectActivityToShow({symbolicAppName: 'testing-app', activityCssClass: 'e2e-activity-4a3a8984', componentSelector: 'app-activity-4a3a8984'});
      await expect(activityPO.getComponentInstanceUuid()).toEqual(componentInstanceUuid);

      // switch to other activity
      const testingActivityItemPO = await hostAppPO.findActivityItem('e2e-testing-activity');
      await testingActivityItemPO.click();
      await expectActivityToShow({symbolicAppName: 'testing-app', activityCssClass: 'e2e-testing-activity', componentSelector: 'app-testing-activity'});

      // switch back to the activity
      await activityItemPO.click();
      await expectActivityToShow({symbolicAppName: 'testing-app', activityCssClass: 'e2e-activity-4a3a8984', componentSelector: 'app-activity-4a3a8984'});
      await expect(activityPO.getComponentInstanceUuid()).toEqual(componentInstanceUuid);
    });

    it('should receive an activate event if activated, and receive a deactivate event if deactivated [testcase: 28f32b51-activity]', async () => {
      const activityItemPO = await hostAppPO.findActivityItem('e2e-activity-28f32b51');
      await activityItemPO.click();
      await expectActivityToShow({symbolicAppName: 'testing-app', activityCssClass: 'e2e-activity-28f32b51', componentSelector: 'app-activity-28f32b51'});

      const activityPO = new Testcase28f32b51ActivityPO();
      await expect(activityPO.readActiveLog()).toEqual([true]);

      // close the activity
      await activityItemPO.click();
      await expectActivityToExistButHidden({symbolicAppName: 'testing-app', activityCssClass: 'e2e-activity-28f32b51'});

      // open the activity
      await activityItemPO.click();
      await expectActivityToShow({symbolicAppName: 'testing-app', activityCssClass: 'e2e-activity-28f32b51', componentSelector: 'app-activity-28f32b51'});
      await expect(activityPO.readActiveLog()).toEqual([true, false, true]);

      // switch to other activity
      const testingActivityItemPO = await hostAppPO.findActivityItem('e2e-testing-activity');
      await testingActivityItemPO.click();
      await expectActivityToShow({symbolicAppName: 'testing-app', activityCssClass: 'e2e-testing-activity', componentSelector: 'app-testing-activity'});

      // switch back to the activity
      await activityItemPO.click();
      await expectActivityToShow({symbolicAppName: 'testing-app', activityCssClass: 'e2e-activity-28f32b51', componentSelector: 'app-activity-28f32b51'});
      await expect(activityPO.readActiveLog()).toEqual([true, false, true, false, true]);
    });

    it('should not show the iframe of inactive activities [testcase: 6d806bea-activity]', async () => {
      const activityItemPO = await hostAppPO.findActivityItem('e2e-activity-6d806bea');
      await activityItemPO.click();
      await expectActivityToShow({symbolicAppName: 'testing-app', activityCssClass: 'e2e-activity-6d806bea', componentSelector: 'app-activity-6d806bea'});

      // close the activity
      await activityItemPO.click();
      await expectActivityToExistButHidden({symbolicAppName: 'testing-app', activityCssClass: 'e2e-activity-6d806bea'});

      // open the activity
      await activityItemPO.click();
      await expectActivityToShow({symbolicAppName: 'testing-app', activityCssClass: 'e2e-activity-6d806bea', componentSelector: 'app-activity-6d806bea'});

      // switch to other activity
      const testingActivityItemPO = await hostAppPO.findActivityItem('e2e-testing-activity');
      await testingActivityItemPO.click();
      await expectActivityToShow({symbolicAppName: 'testing-app', activityCssClass: 'e2e-testing-activity', componentSelector: 'app-testing-activity'});
      await expectActivityToExistButHidden({symbolicAppName: 'testing-app', activityCssClass: 'e2e-activity-6d806bea'});

      // switch back to the activity
      await activityItemPO.click();
      await expectActivityToShow({symbolicAppName: 'testing-app', activityCssClass: 'e2e-activity-6d806bea', componentSelector: 'app-activity-6d806bea'});
      await expectActivityToExistButHidden({symbolicAppName: 'testing-app', activityCssClass: 'e2e-testing-activity'});
    });
  });

  describe('Focus', () => {

    it('should cycle the focus in the activity [testcase: 5782ab19-activity]', async () => {
      await hostAppPO.clickActivityItem('e2e-activity-5782ab19');
      await expectActivityToShow({symbolicAppName: 'testing-app', activityCssClass: 'e2e-activity-5782ab19', componentSelector: 'app-activity-5782ab19'});

      const activityPO = new Testcase5782ab19ActivityPO();
      await expect(activityPO.isActiveElement('field-1')).toBeTruthy('(1)');

      await activityPO.pressTab();
      await expect(activityPO.isActiveElement('field-2')).toBeTruthy('(2)');

      await activityPO.pressTab();
      await expect(activityPO.isActiveElement('field-3')).toBeTruthy('(3)');

      await activityPO.pressTab();
      await expect(activityPO.isActiveElement('field-1')).toBeTruthy('(4)');

      await activityPO.pressTab();
      await expect(activityPO.isActiveElement('field-2')).toBeTruthy('(5)');

      await activityPO.pressTab();
      await expect(activityPO.isActiveElement('field-3')).toBeTruthy('(6)');

      await activityPO.pressShiftTab();
      await expect(activityPO.isActiveElement('field-2')).toBeTruthy('(7)');

      await activityPO.pressShiftTab();
      await expect(activityPO.isActiveElement('field-1')).toBeTruthy('(8)');

      await activityPO.pressShiftTab();
      await expect(activityPO.isActiveElement('field-3')).toBeTruthy('(9)');

      await activityPO.pressShiftTab();
      await expect(activityPO.isActiveElement('field-2')).toBeTruthy('(10)');

      await activityPO.pressShiftTab();
      await expect(activityPO.isActiveElement('field-1')).toBeTruthy('(11)');
    });

    it('should restore the focus upon activity activation [testcase: 5782ab19-activity]', async () => {
      await hostAppPO.clickActivityItem('e2e-activity-5782ab19');
      await expectActivityToShow({symbolicAppName: 'testing-app', activityCssClass: 'e2e-activity-5782ab19', componentSelector: 'app-activity-5782ab19'});

      const activityPO = new Testcase5782ab19ActivityPO();
      await expect(activityPO.isActiveElement('field-1')).toBeTruthy('(1)');

      await activityPO.pressTab();
      await expect(activityPO.isActiveElement('field-2')).toBeTruthy('(2)');

      await hostAppPO.clickActivityItem('e2e-testing-activity');
      await expectActivityToShow({symbolicAppName: 'testing-app', activityCssClass: 'e2e-testing-activity', componentSelector: 'app-testing-activity'});

      await hostAppPO.clickActivityItem('e2e-activity-5782ab19');
      await expectActivityToShow({symbolicAppName: 'testing-app', activityCssClass: 'e2e-activity-5782ab19', componentSelector: 'app-activity-5782ab19'});
      await expect(activityPO.isActiveElement('field-2')).toBeTruthy('(3)');
    });

    it('should autofocus the first element [testcase: 5782ab19-activity]', async () => {
      await hostAppPO.clickActivityItem('e2e-activity-5782ab19');
      await expectActivityToShow({symbolicAppName: 'testing-app', activityCssClass: 'e2e-activity-5782ab19', componentSelector: 'app-activity-5782ab19'});

      const activityPO = new Testcase5782ab19ActivityPO();
      await expect(activityPO.isActiveElement('field-1')).toBeTruthy('Expected first field to be the active element');
    });
  });

  describe('Activity View Item', () => {

    it('should allow navigation to private views of the same application (implicit intent) [testcase: 354aa6da-activity]', async () => {
      await hostAppPO.clickActivityItem('e2e-activity-354aa6da');
      await expectViewToShow({symbolicAppName: 'testing-app', viewCssClass: 'e2e-view-354aa6da', componentSelector: 'app-view-354aa6da'});
    });

    it('should allow navigation to public views of the same application (implicit intent) [testcase: 85dde646-activity]', async () => {
      await hostAppPO.clickActivityItem('e2e-activity-85dde646');
      await expectViewToShow({symbolicAppName: 'testing-app', viewCssClass: 'e2e-view-85dde646', componentSelector: 'app-view-85dde646'});
    });
  });

  describe('Activity Action', () => {

    it('should allow to add and remove activity actions [testcase: 354aa6da-activity]', async () => {
      const testingActivityPO = new TestingActivityPO(E2E_TESTING_ACTIVITY_CONTEXT);
      await testingActivityPO.navigateTo();
      await expectActivityToShow({symbolicAppName: 'testing-app', activityCssClass: 'e2e-testing-activity', componentSelector: 'app-testing-activity'});
      const actionPanelPO = await testingActivityPO.openActivityActionsPanel();

      // hide action
      const action = await actionPanelPO.findCustomActivityAction();
      await actionPanelPO.checkCustomActivityAction(false);
      await expect(action.isPresent()).toBeFalsy('(1)');

      // show action
      await actionPanelPO.checkCustomActivityAction(true);
      await expect(action.isPresent()).toBeTruthy('(2)');

      // hide action
      await actionPanelPO.checkCustomActivityAction(false);
      await expect(action.isPresent()).toBeFalsy('(3)');
    });

    it('should allow to contribute custom activity actions', async () => {
      const testingActivityPO = new TestingActivityPO(E2E_TESTING_ACTIVITY_CONTEXT);
      await testingActivityPO.navigateTo();
      await expectActivityToShow({symbolicAppName: 'testing-app', activityCssClass: 'e2e-testing-activity', componentSelector: 'app-testing-activity'});
      const actionPanelPO = await testingActivityPO.openActivityActionsPanel();
      await actionPanelPO.checkCustomActivityAction(true);

      const customAction = await hostAppPO.findActivityAction('e2e-custom-activity-action');
      await customAction.click();

      await expect(await hostAppPO.findNotification('e2e-custom-activity-action')).toBeTruthy();
    });

    describe('ViewOpenActivityAction', () => {

      it('should allow navigation to private views of the same application (implicit intent) [testcase: 354aa6da-view]', async () => {
        const testingActivityPO = new TestingActivityPO(E2E_TESTING_ACTIVITY_CONTEXT);
        await testingActivityPO.navigateTo();

        const panelPO = await testingActivityPO.openViewOpenActivityActionPanel();
        await panelPO.enterCssClass('fab fa-android e2e-354aa6da-view-activity-action');
        await panelPO.enterTitle('testcase: 354aa6da-view');
        await panelPO.enterQualifier({
          entity: 'testing',
          testcase: '354aa6da-view',
        });
        await panelPO.addAction();

        // Execute the action
        const action = await hostAppPO.findActivityAction('e2e-354aa6da-view-activity-action');
        await action.click();
        await expectViewToShow({symbolicAppName: 'testing-app', viewCssClass: 'e2e-view-354aa6da', componentSelector: 'app-view-354aa6da'});
      });

      it('should allow navigation to public views of the same application (implicit intent) [testcase: 85dde646-view]', async () => {
        const testingActivityPO = new TestingActivityPO(E2E_TESTING_ACTIVITY_CONTEXT);
        await testingActivityPO.navigateTo();

        const panelPO = await testingActivityPO.openViewOpenActivityActionPanel();
        await panelPO.enterCssClass('fab fa-android e2e-85dde646-view-activity-action');
        await panelPO.enterTitle('testcase: 85dde646-view');
        await panelPO.enterQualifier({
          entity: 'testing',
          testcase: '85dde646-view',
        });
        await panelPO.addAction();

        // Execute the action
        const action = await hostAppPO.findActivityAction('e2e-85dde646-view-activity-action');
        await action.click();
        await expectViewToShow({symbolicAppName: 'testing-app', viewCssClass: 'e2e-view-85dde646', componentSelector: 'app-view-85dde646'});
      });

      it('should allow navigation to public views of other applications [testcase: d7da51f14c25]', async () => {
        const testingActivityPO = new TestingActivityPO(E2E_TESTING_ACTIVITY_CONTEXT);
        await testingActivityPO.navigateTo();

        const panelPO = await testingActivityPO.openViewOpenActivityActionPanel();
        await panelPO.enterCssClass('fab fa-android e2e-d7da51f14c25-activity-action');
        await panelPO.enterTitle('testcase: d7da51f14c25');
        await panelPO.enterQualifier({
          entity: 'communication',
          presentation: 'list',
          contactId: '5',
        });
        await panelPO.addAction();

        // Execute the action
        const action = await hostAppPO.findActivityAction('e2e-d7da51f14c25-activity-action');
        await action.click();
        await expectViewToShow({symbolicAppName: 'communication-app', viewCssClass: 'e2e-communication-list', componentSelector: 'app-communication-view'});
      });

      it('should not allow navigation to public views of other applications if missing the intent [testcase: 0901198a704b]', async () => {
        const testingActivityPO = new TestingActivityPO(E2E_TESTING_ACTIVITY_CONTEXT);
        await testingActivityPO.navigateTo();

        const panelPO = await testingActivityPO.openViewOpenActivityActionPanel();
        await panelPO.enterCssClass('fab fa-android e2e-0901198a704b-activity-action');
        await panelPO.enterTitle('testcase: 0901198a704b');
        await panelPO.enterQualifier({
          entity: 'communication',
          presentation: 'list',
          contactId: '999',
        });
        await panelPO.addAction();

        // Execute the action
        const action = await hostAppPO.findActivityAction('e2e-0901198a704b-activity-action');
        await action.click();

        const notificationPO = await hostAppPO.findNotification('e2e-not-qualified');
        await expect(notificationPO).not.toBeNull();
        await expect(notificationPO.getSeverity()).toEqual('error');
        await expectViewToNotExist({symbolicAppName: 'communication-app', viewCssClass: 'e2e-communication-list'});
      });

      it('should not allow navigation to private views of other application [testcase: 0427da7f4a49]', async () => {
        const testingActivityPO = new TestingActivityPO(E2E_TESTING_ACTIVITY_CONTEXT);
        await testingActivityPO.navigateTo();

        const panelPO = await testingActivityPO.openViewOpenActivityActionPanel();
        await panelPO.enterCssClass('fab fa-android e2e-0427da7f4a49-activity-action');
        await panelPO.enterTitle('testcase: 0427da7f4a49');
        await panelPO.enterQualifier({
          entity: 'contact',
          id: '5',
        });
        await panelPO.addAction();

        // Execute the action
        const action = await hostAppPO.findActivityAction('e2e-0427da7f4a49-activity-action');
        await action.click();

        const notificationPO = await hostAppPO.findNotification('e2e-not-handled');
        await expect(notificationPO).not.toBeNull();
        await expect(notificationPO.getSeverity()).toEqual('error');
        await expectViewToNotExist({symbolicAppName: 'contact-app', viewCssClass: 'e2e-contact'});
      });

      it('should allow to provide query and matrix parameters [testcase: 56657ad1-view]', async () => {
        const testingActivityPO = new TestingActivityPO(E2E_TESTING_ACTIVITY_CONTEXT);
        await testingActivityPO.navigateTo();

        const panelPO = await testingActivityPO.openViewOpenActivityActionPanel();
        await panelPO.enterCssClass('fab fa-android e2e-56657ad1-view-activity-action');
        await panelPO.enterTitle('testcase: 56657ad1-view');
        await panelPO.enterQualifier({
          entity: 'testing',
          testcase: '56657ad1-view',
        });
        await panelPO.enterMatrixParams({
          mp1: '41ecdefec0a3',
          mp2: 'da67bd554b36',
        });
        await panelPO.enterQueryParams({
          qp1: '6378a62700d3',
          qp2: 'c5a37d3660ba',
        });
        await panelPO.addAction();

        // Execute the action
        const action = await hostAppPO.findActivityAction('e2e-56657ad1-view-activity-action');
        await action.click();

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
        const testingActivityPO = new TestingActivityPO(E2E_TESTING_ACTIVITY_CONTEXT);
        await testingActivityPO.navigateTo();

        const panelPO = await testingActivityPO.openViewOpenActivityActionPanel();
        await panelPO.enterCssClass('fab fa-android e2e-c8e40918-view-activity-action');
        await panelPO.enterTitle('testcase: c8e40918-view');
        await panelPO.enterQualifier({
          entity: 'testing',
          testcase: 'c8e40918-view',
        });

        await panelPO.addAction();

        // Execute the action
        const action = await hostAppPO.findActivityAction('e2e-c8e40918-view-activity-action');
        await action.click();

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
        const testingActivityPO = new TestingActivityPO(E2E_TESTING_ACTIVITY_CONTEXT);
        await testingActivityPO.navigateTo();

        const panelPO = await testingActivityPO.openViewOpenActivityActionPanel();
        await panelPO.enterCssClass('fab fa-android e2e-a686d615-view-activity-action');
        await panelPO.enterTitle('testcase: a686d615-view');
        await panelPO.enterQualifier({
          entity: 'testing',
          testcase: 'a686d615-view',
        });
        await panelPO.enterMatrixParams({
          mp1: '557c7323a13c',
          mp2: '67dbebc8dd7c',
        });
        await panelPO.enterQueryParams({
          qp1: 'a3fa547519cf',
          qp2: 'db03e5494054',
        });

        await panelPO.addAction();

        // Execute the action
        const action = await hostAppPO.findActivityAction('e2e-a686d615-view-activity-action');
        await action.click();

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
        // Open testing view to open '4a4e6970-view'
        const testingViewPO = new TestingViewPO();
        await testingViewPO.navigateTo();
        const viewNavigationPO = await testingViewPO.openViewNavigationPanel();
        await viewNavigationPO.enterQualifier({
          entity: 'testing',
          testcase: '4a4e6970-view',
        });
        await viewNavigationPO.selectTarget('blank');
        await viewNavigationPO.execute();
        await expectViewToShow({symbolicAppName: 'testing-app', viewCssClass: 'e2e-view-4a4e6970', componentSelector: 'app-view-4a4e6970'});

        // Go back to the testing view
        await hostAppPO.clickViewTab('e2e-testing-view');
        await expectViewToShow({symbolicAppName: 'testing-app', viewCssClass: 'e2e-testing-view', componentSelector: 'app-testing-view'});
        await expect(hostAppPO.getViewTabCount()).toBe(2);

        // Add activity action to activate the testing view
        const testingActivityPO = new TestingActivityPO(E2E_TESTING_ACTIVITY_CONTEXT);
        await testingActivityPO.navigateTo();

        const panelPO = await testingActivityPO.openViewOpenActivityActionPanel();
        await panelPO.enterCssClass('fab fa-android e2e-4a4e6970-view-activity-action');
        await panelPO.enterTitle('testcase: 4a4e6970-view');
        await panelPO.enterQualifier({
          entity: 'testing',
          testcase: '4a4e6970-view',
        });
        await panelPO.checkActivateIfPresent(true);
        await panelPO.addAction();

        // Execute the action
        const action = await hostAppPO.findActivityAction('e2e-4a4e6970-view-activity-action');
        await action.click();

        await expectViewToShow({symbolicAppName: 'testing-app', viewCssClass: 'e2e-view-4a4e6970', componentSelector: 'app-view-4a4e6970'});
        await expect(hostAppPO.getViewTabCount()).toBe(2);
      });

      it('should allow to close an opened view (closeIfPresent=true) [testcase: 608aa47c-view]', async () => {
        // Open testing view to open '4a4e6970-view'
        const testingViewPO = new TestingViewPO();
        await testingViewPO.navigateTo();
        const viewNavigationPO = await testingViewPO.openViewNavigationPanel();
        await viewNavigationPO.enterQualifier({
          entity: 'testing',
          testcase: '608aa47c-view',
        });
        await viewNavigationPO.selectTarget('blank');
        await viewNavigationPO.execute();
        await expectViewToShow({symbolicAppName: 'testing-app', viewCssClass: 'e2e-view-608aa47c', componentSelector: 'app-view-608aa47c'});

        // Add activity action to close the testing view
        const testingActivityPO = new TestingActivityPO(E2E_TESTING_ACTIVITY_CONTEXT);
        await testingActivityPO.navigateTo();

        const panelPO = await testingActivityPO.openViewOpenActivityActionPanel();
        await panelPO.enterCssClass('fab fa-android e2e-608aa47c-view-activity-action');
        await panelPO.enterTitle('testcase: 608aa47c-view');
        await panelPO.enterQualifier({
          entity: 'testing',
          testcase: '608aa47c-view',
        });
        await panelPO.checkCloseIfPresent(true);
        await panelPO.addAction();

        // Execute the action
        const action = await hostAppPO.findActivityAction('e2e-608aa47c-view-activity-action');
        await action.click();

        await expectViewToShow({symbolicAppName: 'testing-app', viewCssClass: 'e2e-testing-view', componentSelector: 'app-testing-view'});
        await expect(hostAppPO.getViewTabCount()).toBe(1);
      });

      it('should substitute path parameters with values from the intent qualifier [testcase: cc977da9-view]', async () => {
        const testingActivityPO = new TestingActivityPO(E2E_TESTING_ACTIVITY_CONTEXT);
        await testingActivityPO.navigateTo();

        const panelPO = await testingActivityPO.openViewOpenActivityActionPanel();
        await panelPO.enterCssClass('fab fa-android e2e-cc977da9-view-activity-action');
        await panelPO.enterTitle('testcase: cc977da9-view');
        await panelPO.enterQualifier({
          entity: 'testing',
          testcase: 'cc977da9-view',
          qualifierParam1: 'e82bf49c4768',
          qualifierParam2: '1b84a4a926f7',
        });
        await panelPO.addAction();

        // Execute the action
        const action = await hostAppPO.findActivityAction('e2e-cc977da9-view-activity-action');
        await action.click();

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
        const testingActivityPO = new TestingActivityPO(E2E_TESTING_ACTIVITY_CONTEXT);
        await testingActivityPO.navigateTo();

        const panelPO = await testingActivityPO.openViewOpenActivityActionPanel();
        await panelPO.enterCssClass('fab fa-android e2e-b6a8fe23-view-activity-action');
        await panelPO.enterTitle('testcase: b6a8fe23-view');
        await panelPO.enterQualifier({
          entity: 'testing',
          testcase: 'b6a8fe23-view',
          qualifierParam1: 'd8b74df2c77d',
          qualifierParam2: 'e60c81360bee',
        });
        await panelPO.addAction();

        // Execute the action
        const action = await hostAppPO.findActivityAction('e2e-b6a8fe23-view-activity-action');
        await action.click();

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
    });

    describe('PopupOpenActivityAction', () => {

      it('should allow navigation to private popups of the same application (implicit intent) [testcase: 1a90c8d2-popup]', async () => {
        const testingActivityPO = new TestingActivityPO(E2E_TESTING_ACTIVITY_CONTEXT);
        await testingActivityPO.navigateTo();

        const panelPO = await testingActivityPO.openPopupOpenActivityActionPanel();
        await panelPO.enterCssClass('fab fa-android e2e-1a90c8d2-popup-activity-action');
        await panelPO.enterTitle('testcase: 1a90c8d2-popup');
        await panelPO.enterQualifier({
          entity: 'testing',
          testcase: '1a90c8d2-popup',
        });
        await panelPO.addAction();

        // Execute the action
        const action = await hostAppPO.findActivityAction('e2e-1a90c8d2-popup-activity-action');
        await action.click();

        await expectPopupToShow({symbolicAppName: 'testing-app', popupCssClass: 'e2e-popup-1a90c8d2', componentSelector: 'app-popup-1a90c8d2'});
      });

      it('should allow navigation to public popups of the same application (implicit intent) [testcase: 7330f506-popup]', async () => {
        const testingActivityPO = new TestingActivityPO(E2E_TESTING_ACTIVITY_CONTEXT);
        await testingActivityPO.navigateTo();

        const panelPO = await testingActivityPO.openPopupOpenActivityActionPanel();
        await panelPO.enterCssClass('fab fa-android e2e-7330f506-popup-activity-action');
        await panelPO.enterTitle('testcase: 7330f506-popup');
        await panelPO.enterQualifier({
          entity: 'testing',
          testcase: '7330f506-popup',
        });
        await panelPO.addAction();

        // Execute the action
        const action = await hostAppPO.findActivityAction('e2e-7330f506-popup-activity-action');
        await action.click();

        await expectPopupToShow({symbolicAppName: 'testing-app', popupCssClass: 'e2e-popup-7330f506', componentSelector: 'app-popup-7330f506'});
      });

      it('should allow navigation to public popups of other applications [testcase: 924e114f777c]', async () => {
        const testingActivityPO = new TestingActivityPO(E2E_TESTING_ACTIVITY_CONTEXT);
        await testingActivityPO.navigateTo();

        const panelPO = await testingActivityPO.openPopupOpenActivityActionPanel();
        await panelPO.enterCssClass('fab fa-android e2e-924e114f777c-popup-activity-action');
        await panelPO.enterTitle('testcase: 924e114f777c-popup');
        await panelPO.enterQualifier({
          entity: 'communication',
          action: 'create',
          contactId: '5',
        });
        await panelPO.addAction();

        // Execute the action
        const action = await hostAppPO.findActivityAction('e2e-924e114f777c-popup-activity-action');
        await action.click();

        await expectPopupToShow({symbolicAppName: 'communication-app', popupCssClass: 'e2e-communication-create', componentSelector: 'app-communication-new-popup'});
      });

      it('should not allow navigation to public popups of other applications if missing the intent [testcase: 13370b2aa222]', async () => {
        const testingActivityPO = new TestingActivityPO(E2E_TESTING_ACTIVITY_CONTEXT);
        await testingActivityPO.navigateTo();

        const panelPO = await testingActivityPO.openPopupOpenActivityActionPanel();
        await panelPO.enterCssClass('fab fa-android e2e-13370b2aa222-popup-activity-action');
        await panelPO.enterTitle('testcase: 13370b2aa222-popup');
        await panelPO.enterQualifier({
          entity: 'communication',
          action: 'create',
          contactId: '999',
        });
        await panelPO.addAction();

        // Execute the action
        const action = await hostAppPO.findActivityAction('e2e-13370b2aa222-popup-activity-action');
        await action.click();

        const notificationPO = await hostAppPO.findNotification('e2e-not-qualified');
        await expect(notificationPO).not.toBeNull();
        await expect(notificationPO.getSeverity()).toEqual('error');
        await expectPopupToNotExist({symbolicAppName: 'communication-app', popupCssClass: 'e2e-communication-create'});
      });

      it('should not allow navigation to private popups of other application [testcase: cf12d60debc8]', async () => {
        const testingActivityPO = new TestingActivityPO(E2E_TESTING_ACTIVITY_CONTEXT);
        await testingActivityPO.navigateTo();

        const panelPO = await testingActivityPO.openPopupOpenActivityActionPanel();
        await panelPO.enterCssClass('fab fa-android e2e-cf12d60debc8-popup-activity-action');
        await panelPO.enterTitle('testcase: cf12d60debc8-popup');
        await panelPO.enterQualifier({
          entity: 'contact',
          action: 'create',
        });
        await panelPO.addAction();

        // Execute the action
        const action = await hostAppPO.findActivityAction('e2e-cf12d60debc8-popup-activity-action');
        await action.click();

        const notificationPO = await hostAppPO.findNotification('e2e-not-handled');
        await expect(notificationPO).not.toBeNull();
        await expect(notificationPO.getSeverity()).toEqual('error');
        await expectPopupToNotExist({symbolicAppName: 'contact-app', popupCssClass: 'e2e-contact'});
      });

      it('should allow to provide query and matrix parameters [testcase: 9c5319f7-popup]', async () => {
        const testingActivityPO = new TestingActivityPO(E2E_TESTING_ACTIVITY_CONTEXT);
        await testingActivityPO.navigateTo();

        const panelPO = await testingActivityPO.openPopupOpenActivityActionPanel();
        await panelPO.enterCssClass('fab fa-android e2e-9c5319f7-popup-activity-action');
        await panelPO.enterTitle('testcase: 9c5319f7-popup');
        await panelPO.enterQualifier({
          entity: 'testing',
          testcase: '9c5319f7-popup',
        });
        await panelPO.enterMatrixParams({
          mp1: '41ecdefec0a3',
          mp2: 'da67bd554b36',
        });
        await panelPO.enterQueryParams({
          qp1: '6378a62700d3',
          qp2: 'c5a37d3660ba',
        });
        await panelPO.addAction();

        // Execute the action
        const action = await hostAppPO.findActivityAction('e2e-9c5319f7-popup-activity-action');
        await action.click();

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
        const testingActivityPO = new TestingActivityPO(E2E_TESTING_ACTIVITY_CONTEXT);
        await testingActivityPO.navigateTo();

        const panelPO = await testingActivityPO.openPopupOpenActivityActionPanel();
        await panelPO.enterCssClass('fab fa-android e2e-45dc693f-popup-activity-action');
        await panelPO.enterTitle('testcase: 45dc693f-popup');
        await panelPO.enterQualifier({
          entity: 'testing',
          testcase: '45dc693f-popup',
        });

        await panelPO.addAction();

        // Execute the action
        const action = await hostAppPO.findActivityAction('e2e-45dc693f-popup-activity-action');
        await action.click();

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
        const testingActivityPO = new TestingActivityPO(E2E_TESTING_ACTIVITY_CONTEXT);
        await testingActivityPO.navigateTo();

        const panelPO = await testingActivityPO.openPopupOpenActivityActionPanel();
        await panelPO.enterCssClass('fab fa-android e2e-f4286ac4-popup-activity-action');
        await panelPO.enterTitle('testcase: f4286ac4-popup');
        await panelPO.enterQualifier({
          entity: 'testing',
          testcase: 'f4286ac4-popup',
        });
        await panelPO.enterMatrixParams({
          mp1: '557c7323a13c',
          mp2: '67dbebc8dd7c',
        });
        await panelPO.enterQueryParams({
          qp1: 'a3fa547519cf',
          qp2: 'db03e5494054',
        });
        await panelPO.addAction();

        // Execute the action
        const action = await hostAppPO.findActivityAction('e2e-f4286ac4-popup-activity-action');
        await action.click();

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
        const testingActivityPO = new TestingActivityPO(E2E_TESTING_ACTIVITY_CONTEXT);
        await testingActivityPO.navigateTo();

        const panelPO = await testingActivityPO.openPopupOpenActivityActionPanel();
        await panelPO.enterCssClass('fab fa-android e2e-159913ad-popup-activity-action');
        await panelPO.enterTitle('testcase: 159913ad-popup');
        await panelPO.enterQualifier({
          entity: 'testing',
          testcase: '159913ad-popup',
          qualifierParam1: 'e82bf49c4768',
          qualifierParam2: '1b84a4a926f7',
        });
        await panelPO.addAction();

        // Execute the action
        const action = await hostAppPO.findActivityAction('e2e-159913ad-popup-activity-action');
        await action.click();

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
        const testingActivityPO = new TestingActivityPO(E2E_TESTING_ACTIVITY_CONTEXT);
        await testingActivityPO.navigateTo();

        const panelPO = await testingActivityPO.openPopupOpenActivityActionPanel();
        await panelPO.enterCssClass('fab fa-android e2e-8a468258-popup-activity-action');
        await panelPO.enterTitle('testcase: 8a468258-popup');
        await panelPO.enterQualifier({
          entity: 'testing',
          testcase: '8a468258-popup',
          qualifierParam1: 'd8b74df2c77d',
          qualifierParam2: 'e60c81360bee',
        });
        await panelPO.addAction();

        // Execute the action
        const action = await hostAppPO.findActivityAction('e2e-8a468258-popup-activity-action');
        await action.click();

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
          queryParam2: '1a3d3aaf937e',
        });
      });

      it('should close on focus lost [testcase: 9002887a395c]', async () => {
        const testingActivityPO = new TestingActivityPO(E2E_TESTING_ACTIVITY_CONTEXT);
        await testingActivityPO.navigateTo();

        const panelPO = await testingActivityPO.openPopupOpenActivityActionPanel();
        await panelPO.enterCssClass('fab fa-android e2e-9002887a395c-popup-activity-action');
        await panelPO.enterTitle('testcase: 9002887a395c-popup');
        await panelPO.enterQualifier({
          entity: 'testing',
        });
        await panelPO.checkCloseOnFocusLost(true);
        await panelPO.addAction();

        // Execute the action
        const action = await hostAppPO.findActivityAction('e2e-9002887a395c-popup-activity-action');
        await action.click();

        await expectPopupToShow({symbolicAppName: 'testing-app', popupCssClass: 'e2e-testing-popup', componentSelector: 'app-testing-popup'});

        // remove focus from the popup
        await testingActivityPO.closePopupOpenActivityActionPanel();
        await expectPopupToNotExist({symbolicAppName: 'testing-app', popupCssClass: 'e2e-testing-popup'});
      });

      it('should not close on focus lost [testcase: 2e220909241f]', async () => {
        const testingActivityPO = new TestingActivityPO(E2E_TESTING_ACTIVITY_CONTEXT);
        await testingActivityPO.navigateTo();

        const panelPO = await testingActivityPO.openPopupOpenActivityActionPanel();
        await panelPO.enterCssClass('fab fa-android e2e-2e220909241f-popup-activity-action');
        await panelPO.enterTitle('testcase: 2e220909241f-popup');
        await panelPO.enterQualifier({
          entity: 'testing',
        });
        await panelPO.checkCloseOnFocusLost(false);
        await panelPO.addAction();

        // Execute the action
        const action = await hostAppPO.findActivityAction('e2e-2e220909241f-popup-activity-action');
        await action.click();

        await expectPopupToShow({symbolicAppName: 'testing-app', popupCssClass: 'e2e-testing-popup', componentSelector: 'app-testing-popup'});

        // remove focus from the popup
        await testingActivityPO.closePopupOpenActivityActionPanel();
        await expectPopupToShow({symbolicAppName: 'testing-app', popupCssClass: 'e2e-testing-popup', componentSelector: 'app-testing-popup'});
      });

      it('should close on escape keystroke [testcase: e2a384f5294a]', async () => {
        const testingActivityPO = new TestingActivityPO(E2E_TESTING_ACTIVITY_CONTEXT);
        await testingActivityPO.navigateTo();

        const panelPO = await testingActivityPO.openPopupOpenActivityActionPanel();
        await panelPO.enterCssClass('fab fa-android e2e-e2a384f5294a-popup-activity-action');
        await panelPO.enterTitle('testcase: e2a384f5294a-popup');
        await panelPO.enterQualifier({
          entity: 'testing',
        });
        await panelPO.checkCloseOnEscape(true);
        await panelPO.addAction();

        // Execute the action
        const action = await hostAppPO.findActivityAction('e2e-e2a384f5294a-popup-activity-action');
        await action.click();

        await expectPopupToShow({symbolicAppName: 'testing-app', popupCssClass: 'e2e-testing-popup', componentSelector: 'app-testing-popup'});

        // send escape keystroke
        await browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
        await expectPopupToNotExist({symbolicAppName: 'testing-app', popupCssClass: 'e2e-testing-popup'});
      });

      it('should not close on escape keystroke [testcase: 5aaa5df79806]', async () => {
        const testingActivityPO = new TestingActivityPO(E2E_TESTING_ACTIVITY_CONTEXT);
        await testingActivityPO.navigateTo();

        const panelPO = await testingActivityPO.openPopupOpenActivityActionPanel();
        await panelPO.enterCssClass('fab fa-android e2e-5aaa5df79806-popup-activity-action');
        await panelPO.enterTitle('testcase: 5aaa5df79806-popup');
        await panelPO.enterQualifier({
          entity: 'testing',
        });
        await panelPO.checkCloseOnEscape(false);
        await panelPO.addAction();

        // Execute the action
        const action = await hostAppPO.findActivityAction('e2e-5aaa5df79806-popup-activity-action');
        await action.click();

        await expectPopupToShow({symbolicAppName: 'testing-app', popupCssClass: 'e2e-testing-popup', componentSelector: 'app-testing-popup'});

        // send escape keystroke
        await browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
        await expectPopupToShow({symbolicAppName: 'testing-app', popupCssClass: 'e2e-testing-popup', componentSelector: 'app-testing-popup'});
      });

      it('should close on grid layout change [testcase: c0ad45e6c742]', async () => {
        const testingActivityPO = new TestingActivityPO(E2E_TESTING_ACTIVITY_CONTEXT);
        await testingActivityPO.navigateTo();

        const panelPO = await testingActivityPO.openPopupOpenActivityActionPanel();
        await panelPO.enterCssClass('fab fa-android e2e-c0ad45e6c742-popup-activity-action');
        await panelPO.enterTitle('testcase: c0ad45e6c742-popup');
        await panelPO.enterQualifier({
          entity: 'testing',
        });
        await panelPO.checkCloseOnFocusLost(false);
        await panelPO.checkCloseOnGridLayoutChange(true);
        await panelPO.addAction();

        // Execute the action
        const action = await hostAppPO.findActivityAction('e2e-c0ad45e6c742-popup-activity-action');
        await action.click();

        await expectPopupToShow({symbolicAppName: 'testing-app', popupCssClass: 'e2e-testing-popup', componentSelector: 'app-testing-popup'});

        // Make a grid layout change
        await hostAppPO.moveActivitySash(100);
        await expectPopupToNotExist({symbolicAppName: 'testing-app', popupCssClass: 'e2e-testing-popup'});
      });

      it('should not close on grid layout change [testcase: a6919dfd2fb1]', async () => {
        const testingActivityPO = new TestingActivityPO(E2E_TESTING_ACTIVITY_CONTEXT);
        await testingActivityPO.navigateTo();

        const panelPO = await testingActivityPO.openPopupOpenActivityActionPanel();
        await panelPO.enterCssClass('fab fa-android e2e-a6919dfd2fb1-popup-activity-action');
        await panelPO.enterTitle('testcase: a6919dfd2fb1-popup');
        await panelPO.enterQualifier({
          entity: 'testing',
        });
        await panelPO.checkCloseOnFocusLost(false);
        await panelPO.checkCloseOnGridLayoutChange(false);
        await panelPO.addAction();

        // Execute the action
        const action = await hostAppPO.findActivityAction('e2e-a6919dfd2fb1-popup-activity-action');
        await action.click();

        await expectPopupToShow({symbolicAppName: 'testing-app', popupCssClass: 'e2e-testing-popup', componentSelector: 'app-testing-popup'});

        // Make a grid layout change
        await hostAppPO.moveActivitySash(100);
        await expectPopupToShow({symbolicAppName: 'testing-app', popupCssClass: 'e2e-testing-popup', componentSelector: 'app-testing-popup'});
      });
    });
  });
});

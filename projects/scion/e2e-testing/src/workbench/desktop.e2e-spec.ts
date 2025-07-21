/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {expect} from '@playwright/test';
import {test} from '../fixtures';
import {MAIN_AREA} from '../workbench.model';
import {expectDesktop} from '../matcher/desktop-matcher';
import {DesktopPagePO} from './page-object/desktop-page.po';

test.describe('Desktop', () => {

  test.describe('Layout with main area', () => {

    test('should detach desktop on layout change', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false, desktop: 'desktop-page'});

      // Create layout with a main area.
      await workbenchNavigator.createPerspective(factory => factory.addPart(MAIN_AREA));

      // Expect desktop to display.
      const desktopPage = new DesktopPagePO(appPO);
      await expectDesktop(appPO.desktop).toDisplayComponent(DesktopPagePO.selector);

      // Capture component instance id.
      const componentInstanceId = await desktopPage.getComponentInstanceId();

      // Add part to the left, forcing detaching the desktop during re-layout.
      await workbenchNavigator.modifyLayout(layout => layout
        .addPart('part.left', {align: 'left'})
        .navigatePart('part.left', ['test-part']),
      );

      // Expect desktop to display.
      await expectDesktop(appPO.desktop).toDisplayComponent(DesktopPagePO.selector);

      // Expect the component not to be constructed anew.
      await expect.poll(() => desktopPage.getComponentInstanceId()).toEqual(componentInstanceId);
    });

    test('should detach desktop if not displayed', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false, mainAreaInitialPartId: 'part.initial', desktop: 'desktop-page'});

      // Create layout with a main area.
      await workbenchNavigator.createPerspective(factory => factory.addPart(MAIN_AREA));

      // Expect desktop to display.
      const desktopPage = new DesktopPagePO(appPO);
      await expectDesktop(appPO.desktop).toDisplayComponent(DesktopPagePO.selector);

      // Capture component instance id.
      const componentInstanceId = await desktopPage.getComponentInstanceId();

      // Open view in main area.
      await workbenchNavigator.modifyLayout(layout => layout
        .addView('view.1', {partId: 'part.initial'})
        .navigateView('view.1', ['path/to/view']),
      );

      // Expect desktop not to be attached.
      await expectDesktop(appPO.desktop).not.toBeAttached();

      // Close the view.
      await appPO.view({viewId: 'view.1'}).tab.close();

      // Expect desktop to display.
      await expectDesktop(appPO.desktop).toDisplayComponent(DesktopPagePO.selector);

      // Expect the component not to be constructed anew.
      await expect.poll(() => desktopPage.getComponentInstanceId()).toEqual(componentInstanceId);
    });
  });

  test.describe('Layout without main area', () => {

    test('should detach desktop if not displayed', async ({appPO, workbenchNavigator}) => {
      await appPO.navigateTo({microfrontendSupport: false, desktop: 'desktop-page'});

      // Create layout with a part.
      await workbenchNavigator.createPerspective(factory => factory.addPart('part.main'));

      // Expect desktop to display.
      const desktopPage = new DesktopPagePO(appPO);
      await expectDesktop(appPO.desktop).toDisplayComponent(DesktopPagePO.selector);

      // Capture component instance id.
      const componentInstanceId = await desktopPage.getComponentInstanceId();

      // Open view in 'part.main'.
      await workbenchNavigator.modifyLayout(layout => layout
        .addView('view.1', {partId: 'part.main'})
        .navigateView('view.1', ['path/to/view']),
      );

      // Expect desktop not to be attached.
      await expectDesktop(appPO.desktop).not.toBeAttached();

      // Close the view.
      await appPO.view({viewId: 'view.1'}).tab.close();

      // Expect desktop to display.
      await expectDesktop(appPO.desktop).toDisplayComponent(DesktopPagePO.selector);

      // Expect the component not to be constructed anew.
      await expect.poll(() => desktopPage.getComponentInstanceId()).toEqual(componentInstanceId);
    });
  });
});

/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import {AppPO} from '../app.po';
import {PopupOpenerPagePO} from './page-object/popup-opener-page.po';
import {PopupPagePO} from './page-object/popup-page.po';
import {consumeBrowserLog} from '../helper/testing.util';

describe('Workbench Popup', () => {

  const appPO = new AppPO();

  beforeEach(async () => consumeBrowserLog());

  it('should pass the preferred overlay size to the popup component', async () => {
    await appPO.navigateTo({microfrontendSupport: false});

    const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab();
    await popupOpenerPagePO.enterCssClass('testee');
    await popupOpenerPagePO.enterPreferredOverlaySize({
      width: '300px',
      height: '301px',
      minWidth: '302px',
      maxWidth: '303px',
      minHeight: '304px',
      maxHeight: '305px',
    });
    await popupOpenerPagePO.clickOpen();

    const popupPagePO = new PopupPagePO('testee');
    await expect(await popupPagePO.getPreferredOverlaySize()).toEqual({
      width: '300px',
      height: '301px',
      minWidth: '302px',
      maxWidth: '303px',
      minHeight: '304px',
      maxHeight: '305px',
    });
  });

  it('should size the overlay according to the passed preferred size', async () => {
    await appPO.navigateTo({microfrontendSupport: false});

    const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab();
    await popupOpenerPagePO.enterCssClass('testee');
    await popupOpenerPagePO.enterPreferredOverlaySize({
      width: '300px',
      height: '400px',
    });
    await popupOpenerPagePO.clickOpen();

    const popupPagePO = new PopupPagePO('testee');
    await expect(await popupPagePO.popupPO.getClientRect()).toEqual(jasmine.objectContaining({
      width: 300,
      height: 400,
    }));
  });

  describe('overlay size constraint', () => {
    it('should not grow beyond the preferred overlay height', async () => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab();
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.enterPreferredOverlaySize({
        height: '400px',
      });
      await popupOpenerPagePO.clickOpen();

      const popupPagePO = new PopupPagePO('testee');
      await popupPagePO.enterComponentSize({
        width: '600px',
        height: '800px',
      });

      await expect(await popupPagePO.popupPO.getClientRect()).toEqual(jasmine.objectContaining({
        width: 600,
        height: 400,
      }));
      await expect(await popupPagePO.getSize()).toEqual({
        width: 600,
        height: 800,
      });
      await expect(await popupPagePO.popupPO.hasVerticalOverflow()).toBe(true);
      await expect(await popupPagePO.popupPO.hasHorizontalOverflow()).toBe(false);
    });

    it('should not grow beyond the preferred overlay width', async () => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab();
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.enterPreferredOverlaySize({
        width: '400px',
      });
      await popupOpenerPagePO.clickOpen();

      const popupPagePO = new PopupPagePO('testee');
      await popupPagePO.enterComponentSize({
        width: '600px',
        height: '800px',
      });

      await expect(await popupPagePO.popupPO.getClientRect()).toEqual(jasmine.objectContaining({
        width: 400,
        height: 800,
      }));
      await expect(await popupPagePO.getSize()).toEqual({
        width: 600,
        height: 800,
      });
      await expect(await popupPagePO.popupPO.hasVerticalOverflow()).toBe(false);
      await expect(await popupPagePO.popupPO.hasHorizontalOverflow()).toBe(true);
    });

    it('should not shrink below the preferred overlay height', async () => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab();
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.enterPreferredOverlaySize({
        height: '400px',
      });
      await popupOpenerPagePO.clickOpen();

      const popupPagePO = new PopupPagePO('testee');
      await popupPagePO.enterComponentSize({
        width: '200px',
        height: '250px',
      });

      await expect(await popupPagePO.popupPO.getClientRect()).toEqual(jasmine.objectContaining({
        width: 200,
        height: 400,
      }));
      await expect(await popupPagePO.getSize()).toEqual({
        width: 200,
        height: 250,
      });

      await expect(await popupPagePO.popupPO.hasVerticalOverflow()).toBe(false);
      await expect(await popupPagePO.popupPO.hasHorizontalOverflow()).toBe(false);
    });

    it('should not shrink below the preferred overlay width', async () => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab();
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.enterPreferredOverlaySize({
        width: '400px',
      });
      await popupOpenerPagePO.clickOpen();

      const popupPagePO = new PopupPagePO('testee');
      await popupPagePO.enterComponentSize({
        width: '200px',
        height: '250px',
      });

      await expect(await popupPagePO.popupPO.getClientRect()).toEqual(jasmine.objectContaining({
        width: 400,
        height: 250,
      }));
      await expect(await popupPagePO.getSize()).toEqual({
        width: 200,
        height: 250,
      });
      await expect(await popupPagePO.popupPO.hasVerticalOverflow()).toBe(false);
      await expect(await popupPagePO.popupPO.hasHorizontalOverflow()).toBe(false);
    });
  });

  describe('overlay maximal size constraint', () => {
    it('should grow to the maximum height of the overlay', async () => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab();
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.enterPreferredOverlaySize({
        maxHeight: '400px',
      });
      await popupOpenerPagePO.clickOpen();

      const popupPagePO = new PopupPagePO('testee');

      // Set the component height to 300px (max overlay height is 400px)
      await popupPagePO.enterComponentSize({
        height: '300px',
      });
      await expect(await popupPagePO.popupPO.getClientRect()).toEqual(jasmine.objectContaining({
        height: 300,
        width: jasmine.any(Number),
      }));
      await expect(await popupPagePO.getSize()).toEqual({
        height: 300,
        width: jasmine.any(Number),
      });
      await expect(await popupPagePO.popupPO.hasVerticalOverflow()).toBe(false);
      await expect(await popupPagePO.popupPO.hasHorizontalOverflow()).toBe(false);

      // Set the component height to 500px (max overlay height is 400px)
      await popupPagePO.enterComponentSize({
        height: '500px',
      });
      await expect(await popupPagePO.popupPO.getClientRect()).toEqual(jasmine.objectContaining({
        height: 400,
        width: jasmine.any(Number),
      }));
      await expect(await popupPagePO.getSize()).toEqual({
        height: 500,
        width: jasmine.any(Number),
      });
      await expect(await popupPagePO.popupPO.hasVerticalOverflow()).toBe(true);
      await expect(await popupPagePO.popupPO.hasHorizontalOverflow()).toBe(false);
    });

    it('should grow to the maximum width of the overlay', async () => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab();
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.enterPreferredOverlaySize({
        maxWidth: '400px',
      });
      await popupOpenerPagePO.clickOpen();

      const popupPagePO = new PopupPagePO('testee');

      // Set the component width to 300px (max overlay width is 400px)
      await popupPagePO.enterComponentSize({
        width: '300px',
      });
      await expect(await popupPagePO.popupPO.getClientRect()).toEqual(jasmine.objectContaining({
        width: 300,
        height: jasmine.any(Number),
      }));
      await expect(await popupPagePO.getSize()).toEqual({
        width: 300,
        height: jasmine.any(Number),
      });
      await expect(await popupPagePO.popupPO.hasVerticalOverflow()).toBe(false);
      await expect(await popupPagePO.popupPO.hasHorizontalOverflow()).toBe(false);

      // Set the component width to 500px (max overlay width is 400px)
      await popupPagePO.enterComponentSize({
        width: '500px',
      });
      await expect(await popupPagePO.popupPO.getClientRect()).toEqual(jasmine.objectContaining({
        width: 400,
        height: jasmine.any(Number),
      }));
      await expect(await popupPagePO.getSize()).toEqual({
        width: 500,
        height: jasmine.any(Number),
      });
      await expect(await popupPagePO.popupPO.hasVerticalOverflow()).toBe(false);
      await expect(await popupPagePO.popupPO.hasHorizontalOverflow()).toBe(true);
    });
  });

  describe('overlay minimal size constraint', () => {
    it('should not shrink below the minimum height of the overlay', async () => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab();
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.enterPreferredOverlaySize({
        minHeight: '400px',
      });
      await popupOpenerPagePO.clickOpen();

      const popupPagePO = new PopupPagePO('testee');

      // Set the component height to 300px (min overlay height is 400px)
      await popupPagePO.enterComponentSize({
        height: '300px',
      });
      await expect(await popupPagePO.popupPO.getClientRect()).toEqual(jasmine.objectContaining({
        height: 400,
        width: jasmine.any(Number),
      }));
      await expect(await popupPagePO.getSize()).toEqual({
        height: 300,
        width: jasmine.any(Number),
      });
      await expect(await popupPagePO.popupPO.hasVerticalOverflow()).toBe(false);
      await expect(await popupPagePO.popupPO.hasHorizontalOverflow()).toBe(false);

      // Set the component height to 500px (min overlay height is 400px)
      await popupPagePO.enterComponentSize({
        height: '500px',
      });
      await expect(await popupPagePO.popupPO.getClientRect()).toEqual(jasmine.objectContaining({
        height: 500,
        width: jasmine.any(Number),
      }));
      await expect(await popupPagePO.getSize()).toEqual({
        height: 500,
        width: jasmine.any(Number),
      });
      await expect(await popupPagePO.popupPO.hasVerticalOverflow()).toBe(false);
      await expect(await popupPagePO.popupPO.hasHorizontalOverflow()).toBe(false);
    });

    it('should not shrink below the minimum width of the overlay', async () => {
      await appPO.navigateTo({microfrontendSupport: false});

      const popupOpenerPagePO = await PopupOpenerPagePO.openInNewTab();
      await popupOpenerPagePO.enterCssClass('testee');
      await popupOpenerPagePO.enterPreferredOverlaySize({
        minWidth: '400px',
      });
      await popupOpenerPagePO.clickOpen();

      const popupPagePO = new PopupPagePO('testee');

      // Set the component width to 300px (min overlay width is 400px)
      await popupPagePO.enterComponentSize({
        width: '300px',
      });
      await expect(await popupPagePO.popupPO.getClientRect()).toEqual(jasmine.objectContaining({
        width: 400,
        height: jasmine.any(Number),
      }));
      await expect(await popupPagePO.getSize()).toEqual({
        width: 300,
        height: jasmine.any(Number),
      });
      await expect(await popupPagePO.popupPO.hasVerticalOverflow()).toBe(false);
      await expect(await popupPagePO.popupPO.hasHorizontalOverflow()).toBe(false);

      // Set the component width to 500px (min overlay width is 400px)
      await popupPagePO.enterComponentSize({
        width: '500px',
      });
      await expect(await popupPagePO.popupPO.getClientRect()).toEqual(jasmine.objectContaining({
        width: 500,
        height: jasmine.any(Number),
      }));
      await expect(await popupPagePO.getSize()).toEqual({
        width: 500,
        height: jasmine.any(Number),
      });
      await expect(await popupPagePO.popupPO.hasVerticalOverflow()).toBe(false);
      await expect(await popupPagePO.popupPO.hasHorizontalOverflow()).toBe(false);
    });
  });
});


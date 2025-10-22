/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {test} from '../../fixtures';
import {expect} from '@playwright/test';
import {DialogOpenerPagePO} from '../page-object/dialog-opener-page.po';
import {DialogPagePO} from '../page-object/dialog-page.po';

test.describe('Workbench Dialog Capability', () => {

  test(`should provide the dialog's capability`, async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability('app1', {
      type: 'dialog',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-dialog',
        size: {height: '475px', width: '300px'},
      },
    });

    // Open the dialog.
    const dialogOpenerPage = await microfrontendNavigator.openInNewTab(DialogOpenerPagePO, 'app1');
    await dialogOpenerPage.open({component: 'testee'}, {cssClass: 'testee'});

    const dialog = appPO.dialog({cssClass: 'testee'});
    const dialogPage = new DialogPagePO(dialog);

    // Expect capability to resolve to the microfrontend dialog and to be set in the handle.
    await expect.poll(() => dialogPage.getDialogCapability()).toMatchObject({
      type: 'dialog',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-dialog',
        size: {height: '475px', width: '300px'},
      },
    });
  });

  test('should error if not having a qualifier', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const registeredCapability = microfrontendNavigator.registerCapability('app1', {
      type: 'dialog',
      qualifier: {},
      properties: {
        path: 'test-pages/microfrontend-test-page',
        size: {height: '475px', width: '300px'},
      },
    });
    await expect(registeredCapability).rejects.toThrow(/\[DialogDefinitionError] Dialog capability requires a qualifier/);
  });

  test('should error if path is `undefined`', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const registeredCapability = microfrontendNavigator.registerCapability('app1', {
      type: 'dialog',
      qualifier: {component: 'testee'},
      properties: {
        path: '<undefined>',
        size: {height: '475px', width: '300px'},
      },
    });
    await expect(registeredCapability).rejects.toThrow(/\[DialogDefinitionError] Dialog capability requires the 'path' property/);
  });

  test('should error if path is `null`', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const registeredCapability = microfrontendNavigator.registerCapability('app1', {
      type: 'dialog',
      qualifier: {component: 'testee-1'},
      properties: {
        path: '<null>',
        size: {height: '475px', width: '300px'},
      },
    });
    await expect(registeredCapability).rejects.toThrow(/\[DialogDefinitionError] Dialog capability requires the 'path' property/);
  });

  test('should not error if path is empty', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const registeredCapability = await microfrontendNavigator.registerCapability('app1', {
      type: 'dialog',
      qualifier: {component: 'testee-1'},
      properties: {
        path: '<string></string>',
        size: {height: '475px', width: '300px'},
      },
    });

    expect(registeredCapability.properties.path).toEqual('');
  });

  test('should error if size is `undefined`', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const registeredCapability = microfrontendNavigator.registerCapability('app1', {
      type: 'dialog',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-pages/microfrontend-test-page',
        size: undefined!,
      },
    });
    await expect(registeredCapability).rejects.toThrow(/\[DialogDefinitionError] Dialog capability requires the 'size' property with a width and a height/);
  });

  test('should error if height is `undefined`', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const registeredCapability = microfrontendNavigator.registerCapability('app1', {
      type: 'dialog',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-pages/microfrontend-test-page',
        size: {
          height: '<undefined>',
          width: '1px',
        },
      },
    });
    await expect(registeredCapability).rejects.toThrow(/\[DialogDefinitionError] Dialog capability requires the 'size' property with a width and a height/);
  });

  test('should error if width is `undefined`', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const registeredCapability = microfrontendNavigator.registerCapability('app1', {
      type: 'dialog',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-pages/microfrontend-test-page',
        size: {
          height: '1px',
          width: '<undefined>',
        },
      },
    });
    await expect(registeredCapability).rejects.toThrow(/\[DialogDefinitionError] Dialog capability requires the 'size' property with a width and a height/);
  });

  test('should error if height is `null`', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const registeredCapability = microfrontendNavigator.registerCapability('app1', {
      type: 'dialog',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-pages/microfrontend-test-page',
        size: {
          height: '<null>',
          width: '1px',
        },
      },
    });
    await expect(registeredCapability).rejects.toThrow(/\[DialogDefinitionError] Dialog capability requires the 'size' property with a width and a height/);
  });

  test('should error if width is `null`', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const registeredCapability = microfrontendNavigator.registerCapability('app1', {
      type: 'dialog',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-pages/microfrontend-test-page',
        size: {
          height: '1px',
          width: '<null>',
        },
      },
    });
    await expect(registeredCapability).rejects.toThrow(/\[DialogDefinitionError] Dialog capability requires the 'size' property with a width and a height/);
  });

  test('should error if height is empty', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const registeredCapability = microfrontendNavigator.registerCapability('app1', {
      type: 'dialog',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-pages/microfrontend-test-page',
        size: {
          height: '',
          width: '1px',
        },
      },
    });
    await expect(registeredCapability).rejects.toThrow(/\[DialogDefinitionError] Dialog capability requires the 'size' property with a width and a height/);
  });

  test('should error if width is empty', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const registeredCapability = microfrontendNavigator.registerCapability('app1', {
      type: 'dialog',
      qualifier: {component: 'testee'},
      properties: {
        path: 'test-pages/microfrontend-test-page',
        size: {
          height: '1px',
          width: '',
        },
      },
    });
    await expect(registeredCapability).rejects.toThrow(/\[DialogDefinitionError] Dialog capability requires the 'size' property with a width and a height/);
  });
});

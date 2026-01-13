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
import {WorkbenchDialogCapability} from '../page-object/register-workbench-capability-page.po';

test.describe('Workbench Dialog Capability', () => {

  test(`should provide the dialog's capability`, async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await microfrontendNavigator.registerCapability<WorkbenchDialogCapability>('app1', {
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

    const registeredCapability = microfrontendNavigator.registerCapability<WorkbenchDialogCapability>('app1', {
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

    const registeredCapability = microfrontendNavigator.registerCapability<WorkbenchDialogCapability>('app1', {
      type: 'dialog',
      qualifier: {component: 'testee'},
      properties: {
        path: '<undefined>',
        size: {height: '475px', width: '300px'},
      },
    });
    await expect(registeredCapability).rejects.toThrow(/\[DialogDefinitionError] Dialog capabilities require a path/);
  });

  test('should error if path is `null`', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const registeredCapability = microfrontendNavigator.registerCapability<WorkbenchDialogCapability>('app1', {
      type: 'dialog',
      qualifier: {component: 'testee'},
      properties: {
        path: '<null>',
        size: {height: '475px', width: '300px'},
      },
    });
    await expect(registeredCapability).rejects.toThrow(/\[DialogDefinitionError] Dialog capabilities require a path/);
  });

  test('should not error if path is empty', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const registeredCapability = await microfrontendNavigator.registerCapability<WorkbenchDialogCapability>('app1', {
      type: 'dialog',
      qualifier: {component: 'testee'},
      properties: {
        path: '',
        size: {height: '475px', width: '300px'},
      },
    });

    expect(registeredCapability.properties.path).toEqual('');
  });

  test('should require empty path if host dialog capability', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    await test.step('non-empty path', async () => {
      const registeredCapability = microfrontendNavigator.registerCapability<WorkbenchDialogCapability>('host', {
        type: 'dialog',
        qualifier: {component: 'testee'},
        properties: {
          path: 'path/to/dialog',
        },
      });

      await expect(registeredCapability).rejects.toThrow(/\[DialogDefinitionError] Dialog capabilities of the host application require an empty path/);
    });

    await test.step('null path', async () => {
      const registeredCapability = microfrontendNavigator.registerCapability<WorkbenchDialogCapability>('host', {
        type: 'dialog',
        qualifier: {component: 'testee'},
        properties: {
          path: '<null>',
        },
      });

      await expect(registeredCapability).rejects.toThrow(/\[DialogDefinitionError] Dialog capabilities of the host application require an empty path/);
    });

    await test.step('undefined path', async () => {
      const registeredCapability = microfrontendNavigator.registerCapability<WorkbenchDialogCapability>('host', {
        type: 'dialog',
        qualifier: {component: 'testee'},
        properties: {
          path: '<undefined>',
        },
      });

      await expect(registeredCapability).rejects.toThrow(/\[DialogDefinitionError] Dialog capabilities of the host application require an empty path/);
    });

    await test.step('empty path', async () => {
      const registeredCapability = await microfrontendNavigator.registerCapability<WorkbenchDialogCapability>('host', {
        type: 'dialog',
        qualifier: {component: 'testee'},
        properties: {
          path: '',
        },
      });
      expect(registeredCapability.properties.path).toEqual('');
    });
  });

  test('should error if size is `undefined`', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const registeredCapability = microfrontendNavigator.registerCapability<WorkbenchDialogCapability>('app1', {
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

    const registeredCapability = microfrontendNavigator.registerCapability<WorkbenchDialogCapability>('app1', {
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

    const registeredCapability = microfrontendNavigator.registerCapability<WorkbenchDialogCapability>('app1', {
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

    const registeredCapability = microfrontendNavigator.registerCapability<WorkbenchDialogCapability>('app1', {
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

    const registeredCapability = microfrontendNavigator.registerCapability<WorkbenchDialogCapability>('app1', {
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

    const registeredCapability = microfrontendNavigator.registerCapability<WorkbenchDialogCapability>('app1', {
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

    const registeredCapability = microfrontendNavigator.registerCapability<WorkbenchDialogCapability>('app1', {
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

  test('should error if host capability defines "showSplash" property (unsupported)', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const registeredCapability = microfrontendNavigator.registerCapability<WorkbenchDialogCapability>('host', {
      type: 'dialog',
      qualifier: {component: 'testee'},
      properties: {
        path: '',
        showSplash: true,
      },
    });
    await expect(registeredCapability).rejects.toThrow(/\[DialogDefinitionError] Property "showSplash" not supported for dialog capabilities of the host application/);
  });

  test('should not error if capability defines "showSplash" property', async ({appPO, microfrontendNavigator}) => {
    await appPO.navigateTo({microfrontendSupport: true});

    const registeredCapability = await microfrontendNavigator.registerCapability<WorkbenchDialogCapability>('app1', {
      type: 'dialog',
      qualifier: {component: 'testee'},
      properties: {
        path: 'path/to/dialog',
        showSplash: true,
        size: {height: '400px', width: '300px'},
      },
    });

    expect(registeredCapability.properties.showSplash).toBe(true);
  });
});

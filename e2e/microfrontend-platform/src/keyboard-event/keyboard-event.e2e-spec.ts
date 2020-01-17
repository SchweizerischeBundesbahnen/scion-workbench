/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { seleniumWebDriverClickFix, SeleniumWebDriverClickFix, sendKeys } from '../spec.util';
import { TestingAppPO } from '../testing-app.po';
import { BrowserOutletPO } from '../browser-outlet.po';
import { Microfrontend1PagePO } from '../microfrontend-1-page.po';
import { ConsoleLog } from '../console/console-panel.po';
import { Key } from 'protractor';

describe('KeyboardEvent', () => {

  let fix: SeleniumWebDriverClickFix;
  beforeAll(() => fix = seleniumWebDriverClickFix().install());
  afterAll(() => fix.uninstall());

  it('should receive keyboard events for the \'m\' keystroke', async () => {
    await testKeystrokePropagation({
      keystroke: 'keydown.m',
      sendKeys: ['m'],
      expectedParentLog: {type: 'keydown', message: '[key=\'m\', control=false, shift=false, alt=false, meta=false]'},
    });
    await testKeystrokePropagation({
      keystroke: 'keyup.m',
      sendKeys: ['m'],
      expectedParentLog: {type: 'keyup', message: '[key=\'m\', control=false, shift=false, alt=false, meta=false]'},
    });
  });

  it('should receive keyboard events for the \'control.m\' keystroke', async () => {
    await testKeystrokePropagation({
      keystroke: 'keydown.control.m',
      sendKeys: [Key.CONTROL, 'm'],
      expectedParentLog: {type: 'keydown', message: '[key=\'m\', control=true, shift=false, alt=false, meta=false]'},
    });
    await testKeystrokePropagation({
      keystroke: 'keyup.control.m',
      sendKeys: [Key.CONTROL, 'm'],
      expectedParentLog: {type: 'keyup', message: '[key=\'m\', control=true, shift=false, alt=false, meta=false]'},
    });
  });

  it('should receive keyboard events for the \'control.shift.m\' keystroke', async () => {
    await testKeystrokePropagation({
      keystroke: 'keydown.control.shift.m',
      sendKeys: [Key.CONTROL, Key.SHIFT, 'm'],
      expectedParentLog: {type: 'keydown', message: '[key=\'M\', control=true, shift=true, alt=false, meta=false]'},
    });
    await testKeystrokePropagation({
      keystroke: 'keyup.control.shift.m',
      sendKeys: [Key.CONTROL, Key.SHIFT, 'm'],
      expectedParentLog: {type: 'keyup', message: '[key=\'M\', control=true, shift=true, alt=false, meta=false]'},
    });
  });

  it('should receive keyboard events for the \'control.shift.alt.m\' keystroke', async () => {
    await testKeystrokePropagation({
      keystroke: 'keydown.control.shift.alt.m',
      sendKeys: [Key.CONTROL, Key.SHIFT, Key.ALT, 'm'],
      expectedParentLog: {type: 'keydown', message: '[key=\'M\', control=true, shift=true, alt=true, meta=false]'},
    });
    await testKeystrokePropagation({
      keystroke: 'keyup.control.shift.alt.m',
      sendKeys: [Key.CONTROL, Key.SHIFT, Key.ALT, 'm'],
      expectedParentLog: {type: 'keyup', message: '[key=\'M\', control=true, shift=true, alt=true, meta=false]'},
    });
  });

  it('should receive keyboard events for the \'control.shift.alt.meta.m\' keystroke', async () => {
    await testKeystrokePropagation({
      keystroke: 'keydown.control.shift.alt.meta.m',
      sendKeys: [Key.CONTROL, Key.SHIFT, Key.ALT, Key.META, 'm'],
      expectedParentLog: {type: 'keydown', message: '[key=\'M\', control=true, shift=true, alt=true, meta=true]'},
    });
    await testKeystrokePropagation({
      keystroke: 'keyup.control.shift.alt.meta.m',
      sendKeys: [Key.CONTROL, Key.SHIFT, Key.ALT, Key.META, 'm'],
      expectedParentLog: {type: 'keyup', message: '[key=\'M\', control=true, shift=true, alt=true, meta=true]'},
    });
  });

  it('should receive keyboard events for the \'dot\' keystroke', async () => {
    await testKeystrokePropagation({
      keystroke: 'keydown.dot',
      sendKeys: ['.'],
      expectedParentLog: {type: 'keydown', message: '[key=\'.\', control=false, shift=false, alt=false, meta=false]'},
    });
    await testKeystrokePropagation({
      keystroke: 'keyup.dot',
      sendKeys: ['.'],
      expectedParentLog: {type: 'keyup', message: '[key=\'.\', control=false, shift=false, alt=false, meta=false]'},
    });
  });

  it('should receive keyboard events for the \'space\' keystroke', async () => {
    await testKeystrokePropagation({
      keystroke: 'keydown.space',
      sendKeys: [' '],
      expectedParentLog: {type: 'keydown', message: '[key=\' \', control=false, shift=false, alt=false, meta=false]'},
    });
    await testKeystrokePropagation({
      keystroke: 'keyup.space',
      sendKeys: [' '],
      expectedParentLog: {type: 'keyup', message: '[key=\' \', control=false, shift=false, alt=false, meta=false]'},
    });
  });

  it('should receive keyboard events for the \'escape\' keystroke', async () => {
    await testKeystrokePropagation({
      keystroke: 'keydown.escape',
      sendKeys: [Key.ESCAPE],
      expectedParentLog: {type: 'keydown', message: '[key=\'Escape\', control=false, shift=false, alt=false, meta=false]'},
    });
    await testKeystrokePropagation({
      keystroke: 'keyup.escape',
      sendKeys: [Key.ESCAPE],
      expectedParentLog: {type: 'keyup', message: '[key=\'Escape\', control=false, shift=false, alt=false, meta=false]'},
    });
  });

  it('should receive keyboard events for the \'enter\' keystroke', async () => {
    await testKeystrokePropagation({
      keystroke: 'keydown.enter',
      sendKeys: [Key.ENTER],
      expectedParentLog: {type: 'keydown', message: '[key=\'Enter\', control=false, shift=false, alt=false, meta=false]'},
    });
    await testKeystrokePropagation({
      keystroke: 'keyup.enter',
      sendKeys: [Key.ENTER],
      expectedParentLog: {type: 'keyup', message: '[key=\'Enter\', control=false, shift=false, alt=false, meta=false]'},
    });
  });

  it('should receive keyboard events for the \'f7\' keystroke', async () => {
    await testKeystrokePropagation({
      keystroke: 'keydown.f7',
      sendKeys: [Key.F7],
      expectedParentLog: {type: 'keydown', message: '[key=\'F7\', control=false, shift=false, alt=false, meta=false]'},
    });
    await testKeystrokePropagation({
      keystroke: 'keyup.f7',
      sendKeys: [Key.F7],
      expectedParentLog: {type: 'keyup', message: '[key=\'F7\', control=false, shift=false, alt=false, meta=false]'},
    });
  });

  it('should receive keyboard events for the \'backspace\' keystroke', async () => {
    await testKeystrokePropagation({
      keystroke: 'keydown.backspace',
      sendKeys: [Key.BACK_SPACE],
      expectedParentLog: {type: 'keydown', message: '[key=\'Backspace\', control=false, shift=false, alt=false, meta=false]'},
    });
    await testKeystrokePropagation({
      keystroke: 'keyup.backspace',
      sendKeys: [Key.BACK_SPACE],
      expectedParentLog: {type: 'keyup', message: '[key=\'Backspace\', control=false, shift=false, alt=false, meta=false]'},
    });
  });

  it('should receive keyboard events from nested microfrontends', async () => {
    const testingAppPO = new TestingAppPO();
    const pagePOs = await testingAppPO.navigateTo({
      outlet1: {
        outlet2: {
          outlet3: {
            microfrontend: Microfrontend1PagePO,
          },
        },
      },
    });
    // Register the keystroke in the top-level outlet
    await pagePOs.get<BrowserOutletPO>('outlet1').setKeystrokesViaAttr('keydown.control.m');

    // Clear all consoles
    const consoleOutlet1PanelPO = testingAppPO.consolePanelPO((): Promise<void> => pagePOs.get<BrowserOutletPO>('outlet1').switchToOutlet());
    await consoleOutlet1PanelPO.open();
    await consoleOutlet1PanelPO.clearLog();

    const consoleOutlet2PanelPO = testingAppPO.consolePanelPO((): Promise<void> => pagePOs.get<BrowserOutletPO>('outlet2').switchToOutlet());
    await consoleOutlet2PanelPO.open();
    await consoleOutlet2PanelPO.clearLog();

    const consoleOutlet3PanelPO = testingAppPO.consolePanelPO((): Promise<void> => pagePOs.get<BrowserOutletPO>('outlet3').switchToOutlet());
    await consoleOutlet3PanelPO.open();
    await consoleOutlet3PanelPO.clearLog();

    // Enter the keystroke in the lowermost microfrontend
    const microfrontendPagePO = pagePOs.get<Microfrontend1PagePO>('microfrontend');
    await microfrontendPagePO.clickInputField();
    await sendKeys(Key.chord(Key.CONTROL, 'm'));

    await expect(consoleOutlet3PanelPO.getLog()).toEqual([jasmine.objectContaining({type: 'keydown', message: '[key=\'m\', control=true, shift=false, alt=false, meta=false]'})]);
    await expect(consoleOutlet2PanelPO.getLog()).toEqual([jasmine.objectContaining({type: 'keydown', message: '[key=\'m\', control=true, shift=false, alt=false, meta=false]'})]);
    await expect(consoleOutlet1PanelPO.getLog()).toEqual([jasmine.objectContaining({type: 'keydown', message: '[key=\'m\', control=true, shift=false, alt=false, meta=false]'})]);
  });

  it('should not receive the keyboard events for a keystroke registered in a nested microfrontend', async () => {
    const testingAppPO = new TestingAppPO();
    const pagePOs = await testingAppPO.navigateTo({
      outlet1: {
        outlet2: {
          outlet3: {
            microfrontend: Microfrontend1PagePO,
          },
        },
      },
    });
    // Register the keystroke in the middle outlet, but not in the parent
    await pagePOs.get<BrowserOutletPO>('outlet2').setKeystrokesViaAttr('keydown.control.m');

    // Clear all consoles
    const consoleOutlet1PanelPO = testingAppPO.consolePanelPO((): Promise<void> => pagePOs.get<BrowserOutletPO>('outlet1').switchToOutlet());
    await consoleOutlet1PanelPO.open();
    await consoleOutlet1PanelPO.clearLog();

    const consoleOutlet2PanelPO = testingAppPO.consolePanelPO((): Promise<void> => pagePOs.get<BrowserOutletPO>('outlet2').switchToOutlet());
    await consoleOutlet2PanelPO.open();
    await consoleOutlet2PanelPO.clearLog();

    const consoleOutlet3PanelPO = testingAppPO.consolePanelPO((): Promise<void> => pagePOs.get<BrowserOutletPO>('outlet3').switchToOutlet());
    await consoleOutlet3PanelPO.open();
    await consoleOutlet3PanelPO.clearLog();

    // Enter the keystroke in the lowermost microfrontend
    const microfrontendPagePO = pagePOs.get<Microfrontend1PagePO>('microfrontend');
    await microfrontendPagePO.clickInputField();
    await sendKeys(Key.chord(Key.CONTROL, 'm'));

    await expect(consoleOutlet3PanelPO.getLog()).toEqual([jasmine.objectContaining({type: 'keydown', message: '[key=\'m\', control=true, shift=false, alt=false, meta=false]'})]);
    await expect(consoleOutlet2PanelPO.getLog()).toEqual([jasmine.objectContaining({type: 'keydown', message: '[key=\'m\', control=true, shift=false, alt=false, meta=false]'})]);
    await expect(consoleOutlet1PanelPO.getLog()).toEqual([]);
  });

  it('should not receive keyboard events for not registered keystrokes', async () => {
    const testingAppPO = new TestingAppPO();
    const pagePOs = await testingAppPO.navigateTo({
      microfrontend: Microfrontend1PagePO,
    });

    const outletPO = pagePOs.get<BrowserOutletPO>('microfrontend:outlet');
    const consolePanelPO = testingAppPO.consolePanelPO();
    await outletPO.setKeystrokesViaAttr('keydown.alt.x');
    await consolePanelPO.open();
    await consolePanelPO.clearLog();

    const microfrontendPagePO = pagePOs.get<Microfrontend1PagePO>('microfrontend');
    await microfrontendPagePO.clickInputField();
    await sendKeys(Key.chord(Key.ALT, 'x'));
    await sendKeys(Key.chord(Key.ALT, 'v'));

    await expect(consolePanelPO.getLog()).toEqual([jasmine.objectContaining({type: 'keydown', message: '[key=\'x\', control=false, shift=false, alt=true, meta=false]'})]);
  });

  it('should allow registering multiple keystrokes via <sci-router-outlet> attribute', async () => {
    const testingAppPO = new TestingAppPO();
    const pagePOs = await testingAppPO.navigateTo({
      microfrontend: Microfrontend1PagePO,
    });

    const outletPO = pagePOs.get<BrowserOutletPO>('microfrontend:outlet');
    const consolePanelPO = testingAppPO.consolePanelPO();
    await outletPO.setKeystrokesViaAttr('keydown.alt.x,keydown.alt.y,keydown.m');
    await consolePanelPO.open();
    await consolePanelPO.clearLog();

    const microfrontendPagePO = pagePOs.get<Microfrontend1PagePO>('microfrontend');
    await microfrontendPagePO.clickInputField();
    await sendKeys(Key.chord(Key.ALT, 'x'));
    await sendKeys(Key.chord(Key.ALT, 'y'));
    await sendKeys(Key.chord('m'));

    await expect(consolePanelPO.getLog()).toEqual(jasmine.arrayWithExactContents([
      jasmine.objectContaining({type: 'keydown', message: '[key=\'x\', control=false, shift=false, alt=true, meta=false]'}),
      jasmine.objectContaining({type: 'keydown', message: '[key=\'y\', control=false, shift=false, alt=true, meta=false]'}),
      jasmine.objectContaining({type: 'keydown', message: '[key=\'m\', control=false, shift=false, alt=false, meta=false]'}),
    ]));
  });

  it('should allow registering multiple keystrokes via <sci-router-outlet> DOM element', async () => {
    const testingAppPO = new TestingAppPO();
    const pagePOs = await testingAppPO.navigateTo({
      microfrontend: Microfrontend1PagePO,
    });

    const outletPO = pagePOs.get<BrowserOutletPO>('microfrontend:outlet');
    const consolePanelPO = testingAppPO.consolePanelPO();
    await outletPO.setKeystrokesViaDom(['keydown.alt.x', 'keydown.alt.y', 'keydown.m']);
    await consolePanelPO.open();
    await consolePanelPO.clearLog();

    const microfrontendPagePO = pagePOs.get<Microfrontend1PagePO>('microfrontend');
    await microfrontendPagePO.clickInputField();
    await sendKeys(Key.chord(Key.ALT, 'x'));
    await sendKeys(Key.chord(Key.ALT, 'y'));
    await sendKeys(Key.chord('m'));

    await expect(consolePanelPO.getLog()).toEqual(jasmine.arrayWithExactContents([
      jasmine.objectContaining({type: 'keydown', message: '[key=\'x\', control=false, shift=false, alt=true, meta=false]'}),
      jasmine.objectContaining({type: 'keydown', message: '[key=\'y\', control=false, shift=false, alt=true, meta=false]'}),
      jasmine.objectContaining({type: 'keydown', message: '[key=\'m\', control=false, shift=false, alt=false, meta=false]'}),
    ]));
  });
});

/**
 * Registers the keystroke in the top-level router outlet and presses the keystroke in the embedded content of the router outlet.
 */
async function testKeystrokePropagation(testdata: { keystroke: string, sendKeys: string[], expectedParentLog: Partial<ConsoleLog> }): Promise<void> {
  const testingAppPO = new TestingAppPO();
  const pagePOs = await testingAppPO.navigateTo({
    microfrontend: Microfrontend1PagePO,
  });

  const outletPO = pagePOs.get<BrowserOutletPO>('microfrontend:outlet');
  const consolePanelPO = testingAppPO.consolePanelPO();
  await outletPO.setKeystrokesViaAttr(testdata.keystroke);
  await consolePanelPO.open();
  await consolePanelPO.clearLog();

  const microfrontendPagePO = pagePOs.get<Microfrontend1PagePO>('microfrontend');
  await microfrontendPagePO.clickInputField();
  await sendKeys(Key.chord(...testdata.sendKeys));
  await expect(consolePanelPO.getLog()).toEqual([jasmine.objectContaining(testdata.expectedParentLog)]);
}

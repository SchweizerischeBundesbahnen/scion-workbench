import { $, browser, ElementFinder, protractor } from 'protractor';

/**
 * Switches browser testing context to the main document.
 */
export async function switchToMainContext(): Promise<void> {
  await browser.switchTo().defaultContent();
  console.log(`Browser testing context switched: commands are sent to the main document.`);
}

/**
 * Switches browser testing context to given <iframe>.
 */
export async function switchToIFrameContext(iframeCssClasses: string[]): Promise<void> {
  const selector = ['iframe', ...iframeCssClasses].join('.');
  await browser.switchTo().defaultContent();
  await browser.switchTo().frame($(selector).getWebElement());
  console.log(`Browser testing context switched: commands are sent to the following iframe: '${selector}'`);
}

/**
 * Allows to check or uncheck a checkbox.
 */
export async function checkCheckbox(check: boolean, checkboxField: ElementFinder): Promise<void> {
  const isChecked = await checkboxField.isSelected();

  if (check && !isChecked) {
    await checkboxField.click();
  }
  else if (!check && isChecked) {
    await checkboxField.click();
  }
}

/**
 * Allows to select an option from a select dropdown.
 */
export async function selectOption(value: string, selectField: ElementFinder): Promise<void> {
  return selectField.$$(`option[value="${value}"`).click();
}

/**
 * Expects the view tab and view for given identity to show.
 */
export async function expectViewToShow(expected: { symbolicAppName: string; viewCssClass: string; componentSelector: string; }): Promise<any> {
  const ctx = `app=${expected.symbolicAppName}, viewCssClass=${expected.viewCssClass}, component=${expected.componentSelector}`;

  await switchToMainContext();
  await expect($(`wb-view-tab.${expected.viewCssClass}`).isDisplayed()).toBeTruthy(`Expected <wb-view-tab> to show [${ctx}]`);
  await expect($(`wb-view.${expected.viewCssClass}`).isDisplayed()).toBeTruthy(`Expected <wb-view> to show [${ctx}]`);
  await expect($(`iframe.e2e-view.e2e-${expected.symbolicAppName}.${expected.viewCssClass}`).isDisplayed()).toBeTruthy(`Expected <iframe> to be displayed in the DOM [${ctx}]`);

  await switchToIFrameContext([`e2e-${expected.symbolicAppName}`, 'e2e-view', expected.viewCssClass]);
  await expect($(expected.componentSelector).isDisplayed()).toBeTruthy(`Expected component <${expected.componentSelector}> to show [${ctx}]`);
}

/**
 * Expects the view tab and view for given identity to not be present in the DOM.
 */
export async function expectViewToNotExist(expected: { symbolicAppName: string; viewCssClass: string; }): Promise<void> {
  const ctx = `app=${expected.symbolicAppName}, viewCssClass=${expected.viewCssClass}`;

  await switchToMainContext();
  await expect($(`wb-view-tab.${expected.viewCssClass}`).isPresent()).toBeFalsy(`Expected <wb-view-tab> not to be present in the DOM [${ctx}]`);
  await expect($(`iframe.e2e-view.e2e-${expected.symbolicAppName}.${expected.viewCssClass}`).isPresent()).toBeFalsy(`Expected <iframe> not to be present in the DOM [${ctx}]`);
  await expect($(`wb-view.${expected.viewCssClass}`).isPresent()).toBeFalsy(`Expected <wb-view> not to be present in the DOM [${ctx}]`);
}

/**
 * Expects the view of given identity to be present in the DOM, but not to show.
 *
 * The iframe is not removed from the DOM to not destroy the view. Instead, its display is set to 'none'.
 */
export async function expectViewToExistButHidden(expected: { symbolicAppName: string; viewCssClass: string; }): Promise<void> {
  const ctx = `app=${expected.symbolicAppName}, viewCssClass=${expected.viewCssClass}`;

  await switchToMainContext();
  const iframeFinder = $(`iframe.e2e-view.e2e-${expected.symbolicAppName}.${expected.viewCssClass}`);
  await expect(iframeFinder.isPresent()).toBeTruthy(`Expected <iframe> to be present in the DOM [${ctx}]`);
  await expect(iframeFinder.isDisplayed()).toBeFalsy(`Expected <iframe> not to be displayed [${ctx}]`);

  const viewFinder = $(`wb-view.${expected.viewCssClass}`);
  await expect(viewFinder.isPresent()).toBeFalsy(`Expected <wb-view> to be present in the DOM [${ctx}]`);
}

/**
 * Expects the popup for given identity to show.
 */
export async function expectPopupToShow(expected: { symbolicAppName: string; popupCssClass: string; componentSelector: string; }): Promise<any> {
  const ctx = `app=${expected.symbolicAppName}, popupCssClass=${expected.popupCssClass}, component=${expected.componentSelector}`;

  await switchToMainContext();
  await expect($(`.wb-popup.${expected.popupCssClass}`).isDisplayed()).toBeTruthy(`Expected 'wb-popup' to show [${ctx}]`);
  await expect($(`iframe.e2e-popup.e2e-${expected.symbolicAppName}.${expected.popupCssClass}`).isDisplayed()).toBeTruthy(`Expected <iframe> to be displayed in the DOM [${ctx}]`);

  await switchToIFrameContext([`e2e-${expected.symbolicAppName}`, 'e2e-popup', expected.popupCssClass]);
  await expect($(expected.componentSelector).isDisplayed()).toBeTruthy(`Expected component <${expected.componentSelector}> to show [${ctx}]`);
}

/**
 * Expects the popup for given identity to not be present in the DOM.
 */
export async function expectPopupToNotExist(expected: { symbolicAppName: string; popupCssClass: string; }): Promise<void> {
  const ctx = `app=${expected.symbolicAppName}, popupCssClass=${expected.popupCssClass}`;

  await switchToMainContext();
  await expect($(`.wb-popup.${expected.popupCssClass}`).isPresent()).toBeFalsy(`Expected 'wb-popup' not to be present in the DOM [${ctx}]`);
  await expect($(`iframe.e2e-popup.e2e-${expected.symbolicAppName}.${expected.popupCssClass}`).isPresent()).toBeFalsy(`Expected <iframe> not to be present in the DOM [${ctx}]`);
}

/**
 * Expects the activity for given identity to show.
 */
export async function expectActivityToShow(expected: { symbolicAppName: string; activityCssClass: string; componentSelector: string; }): Promise<any> {
  const ctx = `app=${expected.symbolicAppName}, activityCssClass=${expected.activityCssClass}, component=${expected.componentSelector}`;

  await switchToMainContext();

  // wait until activity panel animation completed
  const panelFinder = $(`wb-activity-part .e2e-activity-panel.${expected.activityCssClass}`);
  await browser.wait(protractor.ExpectedConditions.presenceOf(panelFinder), 5000);
  const iframeFinder = $(`iframe.e2e-activity.e2e-${expected.symbolicAppName}.${expected.activityCssClass}`);
  await browser.wait(protractor.ExpectedConditions.presenceOf(iframeFinder), 5000);

  await expect(panelFinder.isDisplayed()).toBeTruthy(`Expected 'e2e-activity-panel' to show [${ctx}]`);
  await expect(iframeFinder.isDisplayed()).toBeTruthy(`Expected <iframe> to be displayed [${ctx}]`);

  await switchToIFrameContext([`e2e-${expected.symbolicAppName}`, 'e2e-activity', expected.activityCssClass]);

  await expect($(expected.componentSelector).isDisplayed()).toBeTruthy(`Expected component <${expected.componentSelector}> to show [${ctx}]`);
}

/**
 * Expects the activity of given identity to be present in the DOM, but not to show.
 *
 * The iframe is not removed from the DOM to not destroy the view. Instead, its display is set to 'none'.
 */
export async function expectActivityToExistButHidden(expected: { symbolicAppName: string; activityCssClass: string; }): Promise<void> {
  const ctx = `app=${expected.symbolicAppName}, activityCssClass=${expected.activityCssClass}`;

  await switchToMainContext();
  await expect($(`wb-activity-part .e2e-activity-panel.${expected.activityCssClass}`).isPresent()).toBeFalsy(`Expected 'e2e-activity-panel' not to be present in the DOM [${ctx}]`);

  const iframeFinder = $(`iframe.e2e-activity.e2e-${expected.symbolicAppName}.${expected.activityCssClass}`);
  await expect(iframeFinder.isPresent()).toBeTruthy(`Expected <iframe> to be present in the DOM [${ctx}]`);
  await expect(iframeFinder.isDisplayed()).toBeFalsy(`Expected <iframe> not to be displayed [${ctx}]`);
}

/**
 * Returns css classes on given element.
 */
export async function getCssClasses(elementFinder: ElementFinder): Promise<string[]> {
  const classAttr: string = await elementFinder.getAttribute('class');
  return classAttr.split(/\s+/);
}

/**
 * Clicks the given element while pressing the specified key.
 */
export async function clickElement(elementFinder: ElementFinder, pressKey: string): Promise<void> {
  await browser.actions().mouseMove(elementFinder).perform();

  // It is important to release the pressed key by {@link #keyUp} in order to avoid side effects in other tests.
  await browser.actions().keyDown(pressKey).click().keyUp(pressKey).perform();
}

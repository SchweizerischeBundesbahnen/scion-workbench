import { $, ElementFinder } from 'protractor';

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
export async function expectViewToShow(expected: { viewCssClass?: string; componentSelector: string; }): Promise<any> {
  const ctx = `viewCssClass=${expected.viewCssClass}, component=${expected.componentSelector}`;

  if (expected.viewCssClass) {
    await expect($(`wb-view-tab.${expected.viewCssClass}`).isDisplayed()).toBeTruthy(`Expected <wb-view-tab> to show [${ctx}]`);
    await expect($(`wb-view.${expected.viewCssClass}`).isDisplayed()).toBeTruthy(`Expected <wb-view> to show [${ctx}]`);
  }
  await expect($(`wb-view ${expected.componentSelector}`).isDisplayed()).toBeTruthy(`Expected component <${expected.componentSelector}> to show [${ctx}]`);
}

/**
 * Expects the view tab and view for given identity to not be present in the DOM.
 */
export async function expectViewToNotExist(expected: { viewCssClass: string; }): Promise<void> {
  await expect($(`wb-view-tab.${expected.viewCssClass}`).isPresent()).toBeFalsy('Expected <wb-view-tab> not to be present in the DOM');
  await expect($(`wb-view.${expected.viewCssClass}`).isPresent()).toBeFalsy('Expected <wb-view> not to be present in the DOM');
}

/**
 * Expects the popup for given identity to show.
 */
export async function expectPopupToShow(expected: { popupCssClass: string; componentSelector: string; }): Promise<any> {
  const ctx = `popupCssClass=${expected.popupCssClass}, component=${expected.componentSelector}`;

  await expect($(`.wb-popup.${expected.popupCssClass}`).isDisplayed()).toBeTruthy(`Expected 'wb-popup' to show [${ctx}]`);
  await expect($(expected.componentSelector).isDisplayed()).toBeTruthy(`Expected component <${expected.componentSelector}> to show [${ctx}]`);
}

/**
 * Expects the popup for given identity to not be present in the DOM.
 */
export async function expectPopupToNotExist(expected: { popupCssClass: string; }): Promise<void> {
  const ctx = `popupCssClass=${expected.popupCssClass}`;

  await expect($(`.wb-popup.${expected.popupCssClass}`).isPresent()).toBeFalsy(`Expected 'wb-popup' not to be present in the DOM [${ctx}]`);
}

/**
 * Expects the activity for given identity to show.
 */
export async function expectActivityToShow(expected: { activityCssClass: string; componentSelector: string; }): Promise<any> {
  const ctx = `activityCssClass=${expected.activityCssClass}, component=${expected.componentSelector}`;

  await expect($(`wb-activity-part .e2e-activity-panel.${expected.activityCssClass}`).isDisplayed()).toBeTruthy(`Expected 'e2e-activity-panel' to show [${ctx}]`);
  await expect($(expected.componentSelector).isDisplayed()).toBeTruthy(`Expected component <${expected.componentSelector}> to show [${ctx}]`);
}

/**
 * Returns css classes on given element.
 */
export async function getCssClasses(elementFinder: ElementFinder): Promise<string[]> {
  const classAttr: string = await elementFinder.getAttribute('class');
  return classAttr.split(/\s+/);
}

import { browser, ElementFinder } from 'protractor';

/**
 * Returns if given CSS class is present on given element.
 */
export async function hasCssClass(elementFinder: ElementFinder, cssClass: string): Promise<boolean> {
  const classes: string[] = await getCssClasses(elementFinder);
  return classes.includes(cssClass);
}

/**
 * Returns css classes on given element.
 */
export async function getCssClasses(elementFinder: ElementFinder): Promise<string[]> {
  const classAttr: string = await elementFinder.getAttribute('class');
  return classAttr.split(/\s+/);
}

/**
 * Sends the given keys to the currently focused element.
 */
export async function sendKeys(...keys: string[]): Promise<void> {
  return browser.actions().sendKeys(...keys).perform();
}

/**
 * Enters the given text into the given input field.
 *
 * By default, the text is set directly as input to the field, because 'sendKeys' is very slow.
 */
export async function enterText(text: string, elementFinder: ElementFinder, inputStrategy: 'sendKeys' | 'setValue' = 'setValue'): Promise<void> {
  switch (inputStrategy) {
    case 'sendKeys': { // send keys is slow for long texts
      await elementFinder.clear();
      await elementFinder.click();
      await sendKeys(text);
      break;
    }
    case 'setValue': {
      // fire the 'input' event manually because not fired when setting the value with javascript
      await browser.driver.executeScript('arguments[0].value=arguments[1]; arguments[0].dispatchEvent(new Event(\'input\'));', elementFinder.getWebElement(), text);
      break;
    }
    default: {
      throw Error('[UnsupportedStrategyError] Input strategy not supported.');
    }
  }
}

/**
 * Selects an option of a select dropdown.
 */
export async function selectOption(value: string, selectField: ElementFinder): Promise<void> {
  return selectField.$(`option[value="${value}"`).click();
}

/**
 * Finds an element in the given list supporting returning a promise in the predicate.
 */
export async function findAsync<T>(items: T[], predicate: (item: T) => Promise<boolean>): Promise<T | undefined> {
  for (const item of items) {
    if (await predicate(item)) {
      return item;
    }
  }
  return undefined;
}

/**
 * Expects the given function to be rejected.
 *
 * Jasmine 3.5 provides 'expectAsync' expectation with the 'toBeRejectedWithError' matcher.
 * But, it does not support to test against a regular expression.
 * @see https://jasmine.github.io/api/3.5/async-matchers.html
 */
export function expectToBeRejectedWithError(fn: () => Promise<any>, expected?: RegExp): Promise<void> {
  const reasonExtractorFn = (reason: any): string => {
    if (typeof reason === 'string') {
      return reason;
    }
    if (reason instanceof Error) {
      return reason.message;
    }
    return reason.toString();
  };

  return fn()
    .then(() => fail('Promise expected to be rejected but was resolved.'))
    .catch(reason => {
      if (expected && !reasonExtractorFn(reason).match(expected)) {
        fail(`Expected promise to be rejected with a reason matching '${expected.source}', but was '${reason}'.`);
      }
      else {
        expect(true).toBeTruthy();
      }
    });
}

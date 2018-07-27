import { ComponentFixture, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement, Type } from '@angular/core';
import { expect } from '../spec/jasmine-custom-matchers.spec';

/**
 * Simulates the asynchronous passage of time for the timers and detects the fixture for changes.
 */
export function advance(fixture: ComponentFixture<any>): void {
  tick();
  fixture.detectChanges();
  tick();
}

/**
 * Asserts that the specified component is showing.
 */
export function expectComponentShowing(appFixture: ComponentFixture<any>, expected: Type<any>, failureMessage?: string): DebugElement {
  const componentDebugElement = appFixture.debugElement.query(By.directive(expected));
  if (!(componentDebugElement)) {
    const failSuffix = failureMessage ? ` [${failureMessage}]` : '';
    throw Error(`Expected component not showing [${expected.name}]${failSuffix}`);
  }
  expect(true).toBe(true);
  return componentDebugElement;
}

/**
 * Clicks the element (button, link) matching the given selector.
 */
export function clickElement(appFixture: ComponentFixture<any>, viewType: Type<any>, elementSelector: string, failureMessage?: string): void {
  const failSuffix = failureMessage ? ` [${failureMessage}]` : '';

  const viewDebugElement = appFixture.debugElement.query(By.directive(viewType));
  if (!viewDebugElement) {
    throw Error(`View not showing [${viewType.name}]${failSuffix}`);
  }

  const linkDebugElement = viewDebugElement.query(By.css(elementSelector));
  if (!linkDebugElement) {
    throw Error(`Element not showing [${elementSelector}]${failSuffix}`);
  }

  linkDebugElement.nativeElement.click();
  advance(appFixture);
}

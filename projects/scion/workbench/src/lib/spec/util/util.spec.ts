import {ComponentFixture, tick} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {Type} from '@angular/core';

/**
 * Simulates the asynchronous passage of time for the timers and detects the fixture for changes.
 */
export function advance(fixture: ComponentFixture<any>): void {
  tick();
  fixture.detectChanges();
  tick();
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

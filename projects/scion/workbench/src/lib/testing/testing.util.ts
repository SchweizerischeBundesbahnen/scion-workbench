/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ComponentFixture, TestBed, tick} from '@angular/core/testing';
import {DebugElement, NgZone, Type} from '@angular/core';
import {By} from '@angular/platform-browser';
import {animationFrameScheduler, exhaustMap, firstValueFrom, timer} from 'rxjs';
import {WorkbenchStartup} from '../startup/workbench-startup.service';
import {filter} from 'rxjs/operators';
import {Commands} from '../routing/routing.model';
import {UrlSegment} from '@angular/router';
import {Routing} from '../routing/routing.util';

/**
 * Simulates the asynchronous passage of time for the timers and detects the fixture for changes.
 */
export function advance(fixture: ComponentFixture<any>): void {
  tick();
  fixture.detectChanges();
  tick();
}

/**
 * Waits until the workbench has completed startup and applied the initial layout.
 */
export async function waitUntilWorkbenchStarted(): Promise<void> {
  await TestBed.inject(WorkbenchStartup).whenDone;
  // Wait for Angular to update the DOM.
  await waitUntilStable();
}

/**
 * Waits until Angular zone has stabilized and all elapsed macrotasks (setTimeout) have been executed.
 */
export async function waitUntilStable(): Promise<void> {
  return waitForCondition(async () => {
    await new Promise<void>(resolve => animationFrameScheduler.schedule(() => setTimeout(resolve)));
    return TestBed.inject(NgZone).isStable;
  });
}

/**
 * Waits for a condition to be fulfilled.
 */
export async function waitForCondition(predicate: () => Promise<boolean>): Promise<void> {
  const value$ = timer(0, 100)
    .pipe(
      exhaustMap(async () => await predicate()),
      filter(Boolean),
    );
  await firstValueFrom(value$);
}

/**
 * Gives the fixture a height of 500px and a background color.
 */
export function styleFixture<T>(fixture: ComponentFixture<T>): ComponentFixture<T> {
  const element = fixture.debugElement.nativeElement as HTMLElement;
  element.style.height = '500px';
  element.style.background = 'lightgray';
  return fixture;
}

/**
 * Clicks the element (button, link) matching the given selector.
 */
export function clickElement(appFixture: ComponentFixture<any>, viewType: Type<any>, elementSelector: string, failureMessage?: string): void {
  const failSuffix = failureMessage ? ` [${failureMessage}]` : '';

  const viewDebugElement = appFixture.debugElement.query(By.directive(viewType)) as DebugElement | null;
  if (!viewDebugElement) {
    throw Error(`View not showing [${viewType.name}]${failSuffix}`);
  }

  const linkDebugElement = viewDebugElement.query(By.css(elementSelector)) as DebugElement | null;
  if (!linkDebugElement) {
    throw Error(`Element not showing [${elementSelector}]${failSuffix}`);
  }

  (linkDebugElement.nativeElement as HTMLElement).click();
  advance(appFixture);
}

/**
 * Creates URL segments from given commands.
 */
export function segments(commands: Commands): UrlSegment[] {
  return TestBed.runInInjectionContext(() => Routing.commandsToSegments(commands));
}

/**
 * Alias for {@link jasmine.anything}, but casts to the expected type.
 */
export function anything<T>(): T {
  return jasmine.anything() as unknown as T;
}

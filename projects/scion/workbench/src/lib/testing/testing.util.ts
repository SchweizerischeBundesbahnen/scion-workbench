/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ApplicationRef, DebugElement, Type} from '@angular/core';
import {By} from '@angular/platform-browser';
import {animationFrameScheduler, firstValueFrom} from 'rxjs';
import {WorkbenchStartup} from '../startup/workbench-startup.service';
import {filter} from 'rxjs/operators';
import {Commands} from '../routing/routing.model';
import {UrlSegment} from '@angular/router';
import {Routing} from '../routing/routing.util';

/**
 * Waits until the workbench has completed startup and applied the initial layout.
 */
export async function waitUntilWorkbenchStarted(): Promise<void> {
  await TestBed.inject(WorkbenchStartup).whenDone;
  // Wait for Angular to update the DOM.
  await waitUntilStable();
}

/**
 * Waits until all previously scheduled microtasks, for example those from promises, are executed.
 */
export async function waitUntilIdle(): Promise<void> {
  await new Promise<void>(resolve => requestIdleCallback(() => resolve()));
}

/**
 * Waits until Angular has stabilized, i.e., has no pending tasks and all elapsed macrotasks (setTimeout) have been executed.
 */
export async function waitUntilStable(): Promise<void> {
  await new Promise<void>(resolve => animationFrameScheduler.schedule(() => setTimeout(resolve)));
  await firstValueFrom(TestBed.inject(ApplicationRef).isStable.pipe(filter(Boolean))).then();
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
 * Clicks the element (button, link) matching the given selector, then waits until Angular has stabilized.
 */
export async function clickElement(appFixture: ComponentFixture<any>, viewType: Type<any>, elementSelector: string, failureMessage?: string): Promise<void> {
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
  await waitUntilStable();
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

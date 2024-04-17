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
import {ApplicationRef, Type} from '@angular/core';
import {By} from '@angular/platform-browser';
import {firstValueFrom} from 'rxjs';
import {WorkbenchLayoutService} from '../layout/workbench-layout.service';
import {WorkbenchStartup} from '../startup/workbench-launcher.service';
import {filter} from 'rxjs/operators';
import {Commands} from '../routing/routing.model';
import {UrlSegment} from '@angular/router';
import {RouterUtils} from '../routing/router.util';

/**
 * Simulates the asynchronous passage of time for the timers and detects the fixture for changes.
 */
export function advance(fixture: ComponentFixture<any>): void {
  tick();
  fixture.detectChanges();
  tick();
}

/**
 * Waits for the workbench to be started and the initial layout to be applied.
 */
export async function waitForInitialWorkbenchLayout(): Promise<void> {
  await TestBed.inject(WorkbenchStartup).whenStarted;
  // Wait for the first layout emission.
  await firstValueFrom(TestBed.inject(WorkbenchLayoutService).layout$);
  // Wait for Angular to update the DOM.
  await waitUntilStable();
}

/**
 * Waits for the application to become stable.
 */
export async function waitUntilStable(): Promise<void> {
  await firstValueFrom(TestBed.inject(ApplicationRef).isStable.pipe(filter(Boolean)));
}

/**
 * Gives the fixture a height of 500px and a background color.
 */
export function styleFixture<T>(fixture: ComponentFixture<T>): ComponentFixture<T> {
  fixture.debugElement.nativeElement.style.height = '500px';
  fixture.debugElement.nativeElement.style.background = 'lightgray';
  return fixture;
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

/**
 * Creates URL segments from given commands.
 */
export function segments(commands: Commands): UrlSegment[] {
  return TestBed.runInInjectionContext(() => RouterUtils.commandsToSegments(commands));
}

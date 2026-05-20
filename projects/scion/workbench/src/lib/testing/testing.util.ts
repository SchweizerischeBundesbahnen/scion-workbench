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
import {afterEveryRender} from '@angular/core';
import {animationFrames, animationFrameScheduler, debounce, firstValueFrom, Observable} from 'rxjs';
import {WorkbenchStartup} from '../startup/workbench-startup.service';
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
 * Waits until Angular has stabilized, i.e., after next render cycles have stabilized, has no pending tasks and all elapsed macrotasks (setTimeout) have been executed.
 */
export async function waitUntilStable(): Promise<void> {
  // TODO [menu]: Check if this additional wait is still needed when the icon component is moved to sci-toolkit.
  await new Promise<void>(resolve => animationFrameScheduler.schedule(() => setTimeout(resolve)));
  await firstValueFrom(afterEveryRender$().pipe(debounce(() => animationFrames())));
}

function afterEveryRender$(): Observable<void> {
  return new Observable<void>(observer => {
    TestBed.runInInjectionContext(() => afterEveryRender(() => observer.next()));
  });
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

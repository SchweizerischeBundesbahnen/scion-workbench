/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Locator, Page} from '@playwright/test';
import {exhaustMap, filter, firstValueFrom, map, pairwise, timer} from 'rxjs';
import {Commands} from '@scion/workbench';

/**
 * Returns if given CSS class is present on given element.
 */
export async function hasCssClass(element: Locator, cssClass: string): Promise<boolean> {
  const classes: string[] = await getCssClasses(element);
  return classes.includes(cssClass);
}

/**
 * Returns CSS classes on given element.
 */
export async function getCssClasses(element: Locator): Promise<string[]> {
  return (await element.getAttribute('class'))?.split(/\s+/) || [];
}

/**
 * Waits for an element's bounding box to become stable.
 * When an element is moved or resized, this may take some time, e.g. due to animations.
 * This function returns the bounding box if it hasn't changed for 100ms.
 */
export async function waitUntilBoundingBoxStable(element: Locator): Promise<DomRect> {
  const isStable = (first: DomRect, second: DomRect): boolean => first.x === second.x && first.y === second.y && first.width === second.width && first.height === second.height;
  return waitUntilStable(async () => fromRect(await element.boundingBox()), {isStable});
}

/**
 * Waits for a value to become stable.
 * This function returns the value if it hasn't changed during `probeInterval` (defaults to 100ms).
 */
export async function waitUntilStable<A>(value: () => Promise<A> | A, options?: {isStable?: (previous: A, current: A) => boolean; probeInterval?: number}): Promise<A> {
  if (options?.probeInterval === 0) {
    return value();
  }

  const value$ = timer(0, options?.probeInterval ?? 100)
    .pipe(
      exhaustMap(async () => await value()),
      pairwise(),
      filter(([previous, current]) => options?.isStable ? options.isStable(previous, current) : previous === current),
      map(([previous]) => previous),
    );
  return firstValueFrom(value$);
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
 * Waits until given locators are attached to the DOM.
 */
export async function waitUntilAttached(...locators: Locator[]): Promise<void> {
  await Promise.all(locators.map(locator => locator.waitFor({state: 'attached'})));
}

/**
 * Executes the given function, retrying execution if it throws an error. If the maximum timeout is exceeded, the error is re-thrown.
 *
 * @returns Promise that resolves to the result of the function.
 */
export async function retryOnError<T>(fn: () => Promise<T>, options?: {timeout?: number; interval?: number}): Promise<T> {
  const timeout = options?.timeout ?? 5000;
  const interval = options?.interval ?? 100;
  const t0 = Date.now();

  while (true) { // eslint-disable-line no-constant-condition
    try {
      return await fn();
    }
    catch (error: unknown) {
      if (Date.now() - t0 > timeout) {
        throw error;
      }
    }
    await firstValueFrom(timer(interval));
  }
}

/**
 * Rejects with the content of the specified element when attached to the DOM,
 * or rejects with a TimeoutError if not attached within the global timeout.
 */
export function rejectWhenAttached(locator: Locator): Promise<never> {
  return locator.waitFor({state: 'attached'}).then(() => locator.innerText()).then(error => Promise.reject(Error(error)));
}

/**
 * Creates a {@link DomRect} from given rectangle.
 *
 * Similar to {@link DOMRect#fromRect} but can be used in e2e-tests executed in NodeJS.
 */
export function fromRect(rect: DOMRectInit | null): DomRect {
  const width = rect?.width ?? 0;
  const height = rect?.height ?? 0;
  const x = rect?.x ?? 0;
  const y = rect?.y ?? 0;
  return {
    x,
    y,
    width,
    height,
    top: y,
    bottom: y + height,
    left: x,
    right: x + width,
    hcenter: x + width / 2,
    vcenter: y + height / 2,
  };
}

export function coerceArray<T>(value: T | T[] | undefined | null): T[] {
  if (value === null || value === undefined) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

export function coerceMap<V>(value: Record<string, V> | Map<string, V>): Map<string, V> {
  if (value instanceof Map) {
    return value;
  }
  return new Map(Object.entries(value ?? {}));
}

/**
 * Stringifies given object to matrix notation: a=b;c=d;e=f
 */
export function toMatrixNotation(object: Record<string, unknown> | null | undefined): string {
  return Object.entries(object ?? {}).map(([key, value]) => `${key}=${value}`).join(';');
}

/**
 * Returns a new {@link Record} with `undefined` and `<undefined>` values removed.
 */
export function withoutUndefinedEntries<T>(object: Record<string, T>): Record<string, T> {
  return Object.entries(object).reduce((acc, [key, value]) => {
    if (value !== undefined && (value as unknown) !== '<undefined>') {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, T>);
}

/**
 * Resolves to the identity of the perspective active in the given {@link Page}, or rejects if no perspective is active.
 */
export async function getPerspectiveId(page: Page): Promise<string> {
  const windowName = await page.evaluate((): string => window.name);
  const match = windowName.match(/^scion\.workbench\.perspective\.(?<perspective>.+)$/);
  if (!match) {
    throw Error('[IllegalStateError] No perspective active in page.');
  }
  return match?.groups!['perspective'];
}

/**
 * Position and size of an element.
 */
export interface DomRect {
  x: number;
  y: number;
  width: number;
  height: number;
  top: number;
  bottom: number;
  left: number;
  right: number;
  hcenter: number;
  vcenter: number;
}

/**
 * Converts given segments to a path.
 */
export function commandsToPath(commands: Commands): string {
  return commands
    .reduce((path, command) => {
      if (typeof command === 'string') {
        return path.concat(command);
      }
      else if (!path.length) {
        return path.concat(`.;${toMatrixNotation(command)}`); // Note that matrix parameters in the first segment are only supported in combination with a `relativeTo`.
      }
      else {
        return path.concat(`${path.pop()};${toMatrixNotation(command)}`);
      }
    }, [])
    .join('/');
}

/**
 * Throws the specified error, useful in arrow functions that do not support throwing without a body.
 */
export function throwError(error: string): never {
  throw Error(error);
}

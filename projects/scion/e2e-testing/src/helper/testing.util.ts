/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Locator} from '@playwright/test';
import {filter, firstValueFrom, map, noop, pairwise, switchMap, timer} from 'rxjs';

/**
 * Returns if given CSS class is present on given element.
 */
export async function isCssClassPresent(element: Locator, cssClass: string): Promise<boolean> {
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
 * Returns if given element is the active element.
 */
export async function isActiveElement(element: Locator): Promise<boolean> {
  return await element.evaluate(el => el === document.activeElement);
}

/**
 * Returns true if the element is attached to the DOM.
 */
export async function isPresent(element: Locator): Promise<boolean> {
  return await element.count() > 0;
}

/**
 * Waits for an element's bounding box to become stable.
 * When an element is moved or resized, this may take some time, e.g. due to animations.
 * This function returns the bounding box if it hasn't changed for 100ms.
 */
export async function waitUntilBoundingBoxStable(element: Locator): Promise<DOMRect> {
  const isStable = (first: DOMRect, second: DOMRect): boolean => first.x === second.x && first.y === second.y && first.width === second.width && first.height === second.height;
  return waitUntilStable(async () => fromRect(await element.boundingBox()), {isStable});
}

/**
 * Waits for a value to become stable.
 * This function returns the value if it hasn't changed during `probeInterval` (defaults to 100ms).
 */
export async function waitUntilStable<A>(value: () => Promise<A>, options?: {isStable?: (previous: A, current: A) => boolean; probeInterval?: number}): Promise<A> {
  const value$ = timer(0, options?.probeInterval ?? 100)
    .pipe(
      switchMap(() => value()),
      pairwise(),
      filter(([previous, current]) => options?.isStable ? options.isStable(previous, current) : previous === current),
      map(([previous]) => previous),
    );
  return firstValueFrom(value$);
}

/**
 * Waits until given locators are attached to the DOM.
 */
export async function waitUntilAttached(...locators: Locator[]): Promise<void> {
  await Promise.all(locators.map(locator => locator.waitFor({state: 'attached'})));
}

/**
 * Creates a {@link DOMRect} from given rectangle.
 *
 * Similar to {@link DOMRect#fromRect} but can be used in e2e-tests executed in NodeJS.
 */
export function fromRect(other: DOMRectInit | null): DOMRect & {hcenter: number; vcenter: number} {
  const width = other?.width ?? 0;
  const height = other?.height ?? 0;
  const x = other?.x ?? 0;
  const y = other?.y ?? 0;
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
    toJSON: noop,
  };
}

export function coerceArray<T>(value: T | T[] | undefined | null): T[] {
  if (value === null || value === undefined) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
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

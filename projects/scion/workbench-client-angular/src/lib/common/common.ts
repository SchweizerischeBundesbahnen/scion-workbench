import {assertInInjectionContext, isSignal, signal, Signal} from '@angular/core';
import {MaybeSignal} from './utility-types';

export function coerceSignal<T>(value: MaybeSignal<NonNullable<T>>): Signal<NonNullable<T>>;
export function coerceSignal<T>(value: MaybeSignal<T> | undefined): Signal<NonNullable<T>> | undefined;
export function coerceSignal<T>(value: MaybeSignal<T> | undefined, options: {defaultValue: T}): Signal<T>;
export function coerceSignal<T>(value: MaybeSignal<T> | undefined, options?: {defaultValue?: T}): Signal<T> | undefined {
  if (value === undefined) {
    return options?.defaultValue !== undefined ? signal(options.defaultValue) : undefined;
  }
  return isSignal(value) ? value : signal(value);
}

export function ɵassertInInjectionContext(debugFn: Function, notFound: string): void {
  try {
    assertInInjectionContext(debugFn);
  }
  catch (error) {
    throw Error(notFound ?? 'Must be called within an injection context, or an explicit injector passed.');
  }
}

/**
 * Mutates the passed object by recursively deleting `undefined` properties, optionally also pruning empty objects.
 *
 * By default, empty objects are retained.
 *
 * @returns Pruned object or `undefined` depending on options.
 */
export function prune<T>(object: T): T;
export function prune<T>(object: T, options: {pruneIfEmpty: true}): T | undefined;
export function prune<T>(object: T, options?: {pruneIfEmpty: boolean}): T | undefined;
export function prune<T>(object: T, options?: {pruneIfEmpty: boolean}): T | undefined {
  const pruneIfEmpty = options?.pruneIfEmpty ?? false;

  if (object === null || object instanceof Map || object instanceof Set || Array.isArray(object)) {
    return object;
  }

  if (typeof object === 'object') {
    Object.entries(object).forEach(([key, value]) => {
      if (prune(value, {pruneIfEmpty}) === undefined) {
        delete (object as Record<string, unknown>)[key]; // eslint-disable-line @typescript-eslint/no-dynamic-delete
      }
    });
    if (!Object.keys(object).length && pruneIfEmpty) {
      return undefined;
    }
  }
  return object;
}

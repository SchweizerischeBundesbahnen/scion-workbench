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

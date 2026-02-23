import {isSignal, signal, Signal} from '@angular/core';

export function coerceSignal<T>(value: Signal<T> | T | undefined): Signal<T> | undefined;
export function coerceSignal<T>(value: Signal<T> | T | undefined, options: {defaultValue: T}): Signal<T>;
export function coerceSignal<T>(value: Signal<T> | T | undefined, options?: {defaultValue?: T}): Signal<T> | undefined {
  if (value === undefined) {
    return options?.defaultValue !== undefined ? signal(options.defaultValue) : undefined;
  }
  return isSignal(value) ? value : signal(value);
}

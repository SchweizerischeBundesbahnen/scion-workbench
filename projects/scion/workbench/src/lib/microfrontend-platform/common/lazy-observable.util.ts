import {effect, inject, Injector, isSignal, untracked} from '@angular/core';
import {Observable, of} from 'rxjs';
import {MaybeSignal} from '../../common/utility-types';

/**
 * Like {@link toSignal}, but lazily creates the effect upon subscription, binding it to the subscription lifecycle instead of the injection context, plus, emits the signal's initial value synchronously.
 */
export function toLazyObservable<T>(signal: MaybeSignal<NonNullable<T>>, options?: {injector?: Injector}): Observable<NonNullable<T>>;
export function toLazyObservable<T>(signal: MaybeSignal<NonNullable<T>> | undefined, options?: {injector?: Injector}): Observable<NonNullable<T>> | undefined;
export function toLazyObservable<T>(signal: MaybeSignal<NonNullable<T>> | undefined, options?: {injector?: Injector}): Observable<NonNullable<T>> | undefined {
  if (signal === undefined) {
    return undefined;
  }
  if (!isSignal(signal)) {
    return of(signal);
  }

  const injector = options?.injector ?? inject(Injector);
  return new Observable(observer => {
    const initialValue = signal();
    let isFirstEffectRun = true;

    // Emit initial value synchronously.
    observer.next(initialValue);

    const effectRef = effect(() => {
      const value = signal();

      untracked(() => {
        if (!isFirstEffectRun || initialValue !== value) {
          observer.next(value);
        }
        isFirstEffectRun = false;
      });
    }, {injector, manualCleanup: true});

    return () => effectRef.destroy();
  });
}

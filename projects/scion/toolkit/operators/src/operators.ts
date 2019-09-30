import { map } from 'rxjs/operators';
import { MonoTypeOperatorFunction, OperatorFunction, SchedulerLike } from 'rxjs';

/**
 * Maps each element in the source array to its extracted property.
 *
 * Like rxjs 'pluck' but based on an array with a function to extract the property.
 */
export function pluckArray<I, P>(extractor: (item: I) => P): OperatorFunction<I[], P[]> {
  return map((items: I[]): P[] => items.map(item => extractor(item)));
}

/**
 * Filters items in the source array and emits an array with items satisfying given predicate.
 *
 * An undefined predicate matches any value.
 */
export function filterArray<T>(predicate?: (item: T) => boolean): MonoTypeOperatorFunction<T[]> {
  return map((items: T[]): T[] => items.filter(item => !predicate || predicate(item)));
}

/**
 * Sorts items in the source array and emits an array with those items sorted.
 */
export function sortArray<T>(comparator: (item1: T, item2: T) => number): MonoTypeOperatorFunction<T[]> {
  return map((items: T[]): T[] => [...items].sort(comparator));
}

/**
 * Execute a tap-function for the first perculating value.
 */
export function tapFirst<T>(tapFn: (value: T) => void, scheduler?: SchedulerLike): MonoTypeOperatorFunction<T> {
  return map(((value: T, index: number): T => {
    if (index === 0) {
      scheduler ? scheduler.schedule(tapFn) : tapFn(value);
    }
    return value;
  }));
}

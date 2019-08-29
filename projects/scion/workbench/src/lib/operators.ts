import { map } from 'rxjs/operators';
import { MonoTypeOperatorFunction, OperatorFunction } from 'rxjs';

/**
 * Filters items in the source array and emits an array with items satisfying the given predicate.
 */
export function filterArray<T>(predicate?: (item: T) => boolean): MonoTypeOperatorFunction<T[]> {
  return map((items: T[]): T[] => items.filter(item => !predicate || predicate(item)));
}

/**
 * Maps each element in the source array to its mapped value.
 */
export function mapArray<I, P>(fn: (item: I) => P): OperatorFunction<I[], P[]> {
  return map((items: I[]): P[] => items.map(item => fn(item)));
}

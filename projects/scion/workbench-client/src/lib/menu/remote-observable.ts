import {combineLatest, Observable, pairwise, startWith} from 'rxjs';
import {Beans} from '@scion/toolkit/bean-manager';
import {mapToBody, MessageClient} from '@scion/microfrontend-platform';

/**
 * Creates an observable that emits the initial resolved data and then acts as a **relay**,
 * relaying any subsequent emission in resolved data to remote subscribers.
 *
 * Emissions are relayed to remote subscribers associated with the same `relayId`.
 *
 *  @see remoteSubscriber$
 */
export function createRemoteObservable$<T, R extends {[key: string]: Observable<unknown>}>(config: {relayId: string; resolve: R; mapTo: (data: ResolvedData<R>) => T}): Observable<T> {
  return new Observable(observer => {
    const subscription = combineLatest(config.resolve)
      .pipe(
        startWith(undefined), // initialize pairwise operator
        pairwise(),
      )
      .subscribe(([prev, curr]) => {
        const previousResolvedData = prev as ResolvedData<R> | undefined;
        const currentResolvedData = curr as ResolvedData<R>;

        // 1. Emit initially resolved data.
        if (!previousResolvedData) {
          observer.next(config.mapTo(currentResolvedData));
          return;
        }

        // 2. Relay emissions.
        for (const property in config.resolve) {
          if (previousResolvedData[property] !== currentResolvedData[property]) {
            void Beans.get(MessageClient).publish(`workbench/menu/relay/${config.relayId}/${property}`, currentResolvedData[property]);
          }
        }
      });

    return () => subscription.unsubscribe();
  });
}

/**
 * Emits the provided initial value, then mirrors data relayed by {@link createRemoteObservable$} associated with the same `relayId`.
 *
 * @see createRemoteObservable$
 */
export function remoteSubscriber$<T>(config: {relayId: string; property: string; initialValue: NonNullable<T>}): Observable<NonNullable<T>>;
export function remoteSubscriber$<T>(config: {relayId: string; property: string; initialValue: NonNullable<T> | undefined}): Observable<NonNullable<T>> | undefined;
export function remoteSubscriber$<T>(config: {relayId: string; property: string; initialValue: NonNullable<T> | undefined}): Observable<NonNullable<T>> | undefined {
  const {relayId, property, initialValue} = config;

  if (initialValue === undefined) {
    return undefined;
  }

  return new Observable(observer => {
    observer.next(initialValue);
    const subscription = Beans.get(MessageClient).observe$<NonNullable<T>>(`workbench/menu/relay/${relayId}/${property}`).pipe(mapToBody()).subscribe(observer);
    return () => subscription.unsubscribe();
  });
}

export type ResolvedData<T> = {
  [K in keyof T]: T[K] extends Observable<infer V> ? V : never;
};

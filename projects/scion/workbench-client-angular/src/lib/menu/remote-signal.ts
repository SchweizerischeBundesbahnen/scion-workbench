import {DestroyRef, effect, inject, Injector, signal, Signal, untracked} from '@angular/core';
import {MessageClient} from '@scion/microfrontend-platform';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

export function fromRemoteSignal<T>(name: string, remoteSignal: Signal<T>, options?: {injector?: Injector}): T;
export function fromRemoteSignal<T>(name: string, remoteSignal: Signal<T> | undefined, options?: {injector?: Injector}): T | undefined;
export function fromRemoteSignal<T>(name: string, remoteSignal: Signal<T> | undefined, options?: {injector?: Injector}): T | undefined {
  if (remoteSignal === undefined) {
    return undefined;
  }

  const injector = options?.injector ?? inject(Injector);
  const messageClient = injector.get(MessageClient);

  const initialValue = remoteSignal();
  let isFirstEffectRun = true;

  effect(() => {
    const value = remoteSignal();

    untracked(() => {
      if (!isFirstEffectRun || initialValue !== value) {
        void messageClient.publish(`workbench/menu/property/${name}`, value);
      }
      isFirstEffectRun = false;
    });
  }, {injector});

  return initialValue;
}

export function toRemoteSignal<T>(name: string, value: T, options?: {injector?: Injector}): Signal<NonNullable<T>>;
export function toRemoteSignal<T>(name: string, value: T | undefined, options?: {injector?: Injector}): Signal<T> | undefined;
export function toRemoteSignal<T>(name: string, value: T | undefined, options?: {injector?: Injector}): Signal<T> | undefined {
  if (value === undefined) {
    return undefined;
  }

  const injector = options?.injector ?? inject(Injector);
  const messageClient = injector.get(MessageClient);
  const remoteSignal = signal(value);

  messageClient.observe$<T>(`workbench/menu/property/${name}`)
    .pipe(takeUntilDestroyed(injector.get(DestroyRef)))
    .subscribe(message => {
      remoteSignal.set(message.body!);
    });

  return remoteSignal;
}

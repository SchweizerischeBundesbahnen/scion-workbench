import {DestroyRef, effect, inject, Injector, signal, Signal, WritableSignal} from '@angular/core';
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

  effect(() => {
    const value = remoteSignal();
    void messageClient.publish(`workbench/menu/property/${name}`, value);
  }, {injector});

  return remoteSignal();
}

export function toRemoteSignal<T>(name: string, value: T, options?: {injector?: Injector}): WritableSignal<NonNullable<T>>;
export function toRemoteSignal<T>(name: string, value: T | undefined, options?: {injector?: Injector}): WritableSignal<T> | undefined;
export function toRemoteSignal<T>(name: string, value: T | undefined, options?: {injector?: Injector}): WritableSignal<T> | undefined {
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

  effect(() => {
    const value = remoteSignal();
    void messageClient.publish(`workbench/menu/property/${name}`, value);
  }, {injector});

  return remoteSignal;
}

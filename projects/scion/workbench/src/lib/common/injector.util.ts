import {DestroyableInjector, DestroyRef, inject, Injector} from '@angular/core';

/**
 * `parent`: (optional) A parent injector.
 * `name`: (optional) A developer-defined identifying name for the new injector.
 */
export function createDestroyableInjector(options?: {parent?: Injector; name?: string}): DestroyableInjector {
  const parentInjector = options?.parent ?? inject(Injector);
  const injector = Injector.create({parent: parentInjector, providers: [], name: options?.name});
  // Destroy injector manually as not destroyed when the parent injector is destroyed, unless used in the injection context of a component.
  parentInjector.get(DestroyRef).onDestroy(() => injector.destroy());
  return injector;
}

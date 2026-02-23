import {Translatable} from '@scion/workbench-client';
import {MaybeSignal} from '@scion/sci-components/common';
import {Signal, untracked} from '@angular/core';
import {text} from '@scion/sci-components/text';

/**
 * Translates the given {@link Translatable}, passed as string or Signal.
 */
export function translate(translatable: MaybeSignal<Translatable>): Signal<Translatable>;
export function translate(translatable: MaybeSignal<Translatable> | undefined): Signal<Translatable> | undefined;
export function translate(translatable: MaybeSignal<Translatable> | undefined): Signal<Translatable> | undefined {
  return translatable !== undefined ? untracked(() => text(translatable)) : undefined
}

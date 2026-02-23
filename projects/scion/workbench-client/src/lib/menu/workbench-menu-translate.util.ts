import {MaybeObservable} from '@scion/toolkit/types';
import {MonoTypeOperatorFunction, Observable} from 'rxjs';
import {Beans} from '@scion/toolkit/bean-manager';
import {APP_IDENTITY} from '@scion/microfrontend-platform';
import {Observables} from '@scion/toolkit/util';
import {map, switchMap} from 'rxjs/operators';
import {Translatable} from '../text/workbench-text-provider.model';
import {WorkbenchTextService} from '../text/workbench-text.service';

/**
 * Translates the given {@link Translatable}, passed as string or observable.
 */
export function translate(translatable: MaybeObservable<Translatable>): Observable<string>;
export function translate(translatable: MaybeObservable<Translatable> | undefined): Observable<string> | undefined;
export function translate(translatable: MaybeObservable<Translatable> | undefined): Observable<string> | undefined {
  if (translatable === undefined) {
    return undefined;
  }

  return Observables.coerce(translatable)
    .pipe(
      switchMap(translatable => Beans.get(WorkbenchTextService).text$(translatable, {provider: Beans.get<string>(APP_IDENTITY)}).pipe(map(text => text ?? translatable))),
      escapeTranslatable(),
    );
}

/**
 * Escapes a leading percent symbol (`%`) in text to not match the format of a {@link Translatable} by prefixing it with the ZERO WIDTH SPACE (U+200B) character.
 *
 * Otherwise, the translatable would be interpreted by the workbench host app.
 */
function escapeTranslatable(): MonoTypeOperatorFunction<string> {
  return map(text => text.startsWith('%') ? `\u{200B}${text}` : text);
}

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { PartsLayout } from '../layout/parts-layout';

/**
 * Provides the layout with the visual arrangement of the parts.
 */
@Injectable({providedIn: 'root'})
export class PartsLayoutProvider {

  private readonly _layout$ = new BehaviorSubject<PartsLayout>(null);

  /**
   * Sets the given {@link PartsLayout}.
   */
  public setLayout(layout: PartsLayout): void {
    this._layout$.next(layout);
  }

  /**
   * Returns a reference to current {@link PartsLayout}, if any. Is `null` until the initial navigation is performed.
   */
  public get layout(): PartsLayout {
    return this._layout$.value;
  }

  /**
   * Emits the current {@link PartsLayout}.
   *
   * Upon subscription, the current layout is emitted, if any, and then emits continuously when the layout changes. It never completes.
   */
  public get layout$(): Observable<PartsLayout> {
    return this._layout$.pipe(filter(Boolean));
  }
}

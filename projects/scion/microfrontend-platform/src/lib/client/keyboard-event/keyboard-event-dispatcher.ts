/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { fromEvent, merge, noop, Subject } from 'rxjs';
import { Beans, PreDestroy } from '../../bean-manager';
import { filter, take, takeUntil } from 'rxjs/operators';
import { MessageClient } from '../message-client';
import { ContextService } from '../context/context-service';
import { KEYSTROKE_CONTEXT_NAME_PREFIX, OutletContext, RouterOutlets } from '../router-outlet/router-outlet.element';
import { Keystroke } from '../router-outlet/keystroke';
import { Maps } from '@scion/toolkit/util';
import { runSafe } from '../../safe-runner';

/**
 * Propagates keyboard events for keystrokes registered in the current context or any parent contexts.
 *
 * This dispatcher listens to keyboard events for keystrokes registered in parent contexts and publishes
 * them as {@link KeyboardEventInit} events to the topic {@link RouterOutlets.keyboardEventTopic}.
 */
export class KeyboardEventDispatcher implements PreDestroy {

  private _destroy$ = new Subject<void>();
  private _keystrokesChange$ = new Subject<void>();
  private _whenOutletIdentity: Promise<string>;

  constructor() {
    this._whenOutletIdentity = this.lookupOutletIdentity();
    this.installKeystrokeListener();
  }

  private installKeystrokeListener(): void {
    Beans.get(ContextService).names$()
      .pipe(takeUntil(this._destroy$))
      .subscribe((contextNames: Set<string>) => runSafe(() => {
        this._keystrokesChange$.next();

        Array.from(contextNames)
          .filter(contextName => contextName.startsWith(KEYSTROKE_CONTEXT_NAME_PREFIX))
          .map(keystrokeContextName => keystrokeContextName.substring(KEYSTROKE_CONTEXT_NAME_PREFIX.length))
          .reduce((keystrokes, keystroke) => { // group keystrokes by event type (keydown, keyup)
            const {eventType, parts} = Keystroke.fromString(keystroke);
            return Maps.addMultiValue(keystrokes, eventType, parts);
          }, new Map<string, Set<string>>())
          .forEach((keystrokes, eventType) => {
            this.installKeyboardEventDispatcher(eventType, keystrokes);
          });
      }));
  }

  /**
   * Listens to keyboard events matching the given keystrokes and publishes them as {@link KeyboardEventInit} events
   * to the topic {@link RouterOutlets.keyboardEventTopic}.
   */
  private installKeyboardEventDispatcher(eventType: string, keystrokes: Set<string>): void {
    fromEvent<KeyboardEvent>(document, eventType)
      .pipe(
        filter(event => event.bubbles && !!event.key),
        filter(event => keystrokes.has(Keystroke.fromEvent(event).parts)),
        takeUntil(merge(this._keystrokesChange$, this._destroy$)),
      )
      .subscribe((event: KeyboardEvent) => runSafe(() => {
        const eventInit: KeyboardEventInit = {
          key: event.key,
          ctrlKey: event.ctrlKey,
          shiftKey: event.shiftKey,
          altKey: event.altKey,
          metaKey: event.metaKey,
          bubbles: event.bubbles,
        };
        this._whenOutletIdentity.then(outletIdentity => {
          const publishTo = RouterOutlets.keyboardEventTopic(outletIdentity, event.type);
          Beans.get(MessageClient).publish$<KeyboardEventInit>(publishTo, eventInit).subscribe();
        });
      }));
  }

  /**
   * Looks up the identity of the outlet containing this microfrontend. If not running in the context of an outlet, the Promise returned never resolves.
   */
  private lookupOutletIdentity(): Promise<string> {
    return Beans.get(ContextService).observe$<OutletContext>(RouterOutlets.OUTLET_CONTEXT)
      .pipe(take(1), takeUntil(this._destroy$))
      .toPromise()
      .then(outletContext => outletContext ? Promise.resolve(outletContext.uid) : new Promise<never>(noop));
  }

  public preDestroy(): void {
    this._destroy$.next();
  }
}

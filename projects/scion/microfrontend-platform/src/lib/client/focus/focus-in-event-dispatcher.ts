/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { fromEvent, Subject } from 'rxjs';
import { Beans, PreDestroy } from '../../bean-manager';
import { takeUntil } from 'rxjs/operators';
import { MessageClient } from '../messaging/message-client';
import { PlatformTopics } from '../../ɵmessaging.model';

/**
 * Sends a 'focusin' event to the topic {@link PlatformTopics.FocusIn} when this document gains focus.
 *
 * @see FocusTracker
 * @ignore
 */
export class FocusInEventDispatcher implements PreDestroy {

  private _destroy$ = new Subject<void>();

  constructor() {
    this.makeWindowFocusable();
    this.dispatchDocumentFocusInEvent();
  }

  private dispatchDocumentFocusInEvent(): void {
    fromEvent<FocusEvent>(window, 'focusin')
      .pipe(takeUntil(this._destroy$))
      .subscribe(event => {
        // Do not dispatch the event if the focusing occurs within this document.
        // In this case, the related target is set, unless the focus owner is disposed.
        if (!event.relatedTarget) {
          Beans.get(MessageClient).publish$(PlatformTopics.FocusIn, null, {retain: true}).subscribe(); // do not set `undefined` as payload as this would delete the retained message
        }
      });
  }

  /**
   * Makes this Window focusable in order to receive 'focusin' events.
   */
  private makeWindowFocusable(): void {
    const body = window.document.body;
    body.setAttribute('tabindex', '0');
    body.style.outline = 'none';
  }

  public preDestroy(): void {
    this._destroy$.next();
  }
}


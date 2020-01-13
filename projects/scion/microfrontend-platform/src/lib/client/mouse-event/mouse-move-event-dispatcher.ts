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
import { auditTime, filter, takeUntil } from 'rxjs/operators';
import { mapToBody, MessageClient } from '../message-client';
import { UUID } from '@scion/toolkit/util';

/**
 * Dispatches 'mousemove' events originating from other documents as synthetic 'sci-mousemove' events on the document event bus.
 * The events are only propagated when the primary mouse button is pressed down.
 *
 * Mouse event dispatching is important when using custom scrollbars which are positioned at the iframe border. It allows the user
 * to scroll seamlessly even when the mouse cursor leaves the iframe, which is because by default, mouse events are only received
 * by the currently hovering document.
 */
export class MouseMoveEventDispatcher implements PreDestroy {

  private _destroy$ = new Subject<void>();
  private _dispatcherId = UUID.randomUUID();

  constructor() {
    this.produceSynthEvents();
    this.consumeSynthEvents();
  }

  /**
   * Produces synth events from native 'mousemove' events and publishes them on the message bus.
   * It allows event dispatchers in other documents to consume these events and publish them on the document's event bus.
   */
  private produceSynthEvents(): void {
    fromEvent<MouseEvent>(document, 'mousemove')
      .pipe(
        filter(event => event.buttons === PRIMARY_MOUSE_BUTTON),
        auditTime(20),
        takeUntil(this._destroy$),
      )
      .subscribe((event: MouseEvent) => {
        const options = {headers: new Map().set(DISPATCHER_ID_HEADER, this._dispatcherId)};
        Beans.get(MessageClient).publish$(MOUSEMOVE_EVENT_TOPIC, [event.screenX, event.screenY], options).subscribe();
      });
  }

  /**
   * Consumes synth events produced by dispatchers from other documents and dispatches them on the event bus of the current document.
   */
  private consumeSynthEvents(): void {
    Beans.get(MessageClient).observe$<[number, number]>(MOUSEMOVE_EVENT_TOPIC)
      .pipe(
        filter(msg => msg.headers.get(DISPATCHER_ID_HEADER) !== this._dispatcherId),
        mapToBody(),
        takeUntil(this._destroy$),
      )
      .subscribe(([screenX, screenY]: [number, number]) => {
        const sciMouseEvent: any = new Event('sci-mousemove');
        sciMouseEvent.screenX = screenX;
        sciMouseEvent.screenY = screenY;
        document.dispatchEvent(sciMouseEvent);
      });
  }

  public preDestroy(): void {
    this._destroy$.next();
  }
}

/**
 * Indicates that the primary mouse button is pressed (usually left).
 */
const PRIMARY_MOUSE_BUTTON = 1;
/**
 * Message header to pass the dispatcher's identity.
 */
const DISPATCHER_ID_HEADER = 'ɵDISPATCHER_ID';
/**
 * Topic to publish 'mousemove' events so that they can be consumed by dispatchers of other documents.
 */
const MOUSEMOVE_EVENT_TOPIC = 'ɵMOUSEMOVE';

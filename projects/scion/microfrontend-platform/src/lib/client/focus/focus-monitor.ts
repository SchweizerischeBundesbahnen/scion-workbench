/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { Observable } from 'rxjs';
import { Beans } from '../../bean-manager';
import { PlatformTopics } from '../../ɵmessaging.model';
import { mapToBody, MessageClient } from '../messaging/message-client';

/**
 * Allows observing if the current `Document` has received focus or contains embedded web content that has received focus.
 *
 * @category Focus
 */
export class FocusMonitor {

  /**
   * Observable that emits when the current `Document` or any of its child microfrontends has gained or lost focus.
   * The Observable does not emit while the focus remains within this `Document` or any of its child microfrontends.
   * It never completes.
   *
   * This Observable is like the `:focus-within` CSS pseudo-class but operates across iframe boundaries.
   * For example, it can be useful when implementing overlays that close upon focus loss.
   */
  public readonly focusWithin$: Observable<boolean> = Beans.get(MessageClient).request$<boolean>(PlatformTopics.IsFocusWithin).pipe(mapToBody());
}

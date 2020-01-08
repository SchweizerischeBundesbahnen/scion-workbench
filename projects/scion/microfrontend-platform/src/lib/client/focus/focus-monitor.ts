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
import { mapToBody, MessageClient } from '../message-client';

/**
 * Allows observing if the current document has received focus or contains embedded web content that has received focus.
 */
export class FocusMonitor {

  /**
   * Allows observing if the current document has received focus or contains embedded web content that has received focus.
   * The Observable never completes.
   */
  public readonly focusWithin$: Observable<boolean> = Beans.get(MessageClient).request$<boolean>(PlatformTopics.IsFocusWithin).pipe(mapToBody());
}

/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { MessageBus } from './message-bus.service';
import { Service } from './metadata';
import { Platform } from './platform';
import { IntentMessage, Qualifier } from '@scion/workbench-application-platform.api';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Allows issuing an intent to interact with the platform.
 */
export class IntentService implements Service {

  /**
   * Issues an intent to the application platform and receives a series of replies.
   *
   * The returned Observable never completes. It is up to the caller to unsubscribe from the stream.
   * E.g., use the pipeable operator `first` if expecting a single response.
   *
   * @returns a stream of replies.
   */
  public issueIntent$<T>(type: string, qualifier?: Qualifier, payload?: any): Observable<T> {
    const intentMessage: IntentMessage = {type, qualifier, payload};

    return Platform.getService(MessageBus).requestReceive$({channel: 'intent', message: intentMessage})
      .pipe(map(replyEnvelope => replyEnvelope && replyEnvelope.message));
  }

  /**
   * Issues an intent to the application platform.
   */
  public issueIntent(type: string, qualifier?: Qualifier, payload?: any): void {
    const intentMessage: IntentMessage = {type, qualifier, payload};

    return Platform.getService(MessageBus).postMessage({channel: 'intent', message: intentMessage});
  }

  public onDestroy(): void {
    // noop
  }
}

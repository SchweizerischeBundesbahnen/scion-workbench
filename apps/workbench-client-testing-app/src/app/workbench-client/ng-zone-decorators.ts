/*
 * Copyright (c) 2018-2020 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import {BeanDecorator} from '@scion/toolkit/bean-manager';
import {Intent, IntentClient, IntentMessage, IntentOptions, IntentSelector, MessageClient, PublishOptions, RequestOptions, TopicMessage} from '@scion/microfrontend-platform';
import {Injectable, NgZone} from '@angular/core';
import {MonoTypeOperatorFunction, Observable, pipe, Subscription} from 'rxjs';
import {observeInside, subscribeInside} from '@scion/toolkit/operators';

/**
 * Synchronizes Observable emissions of the {@link MessageClient} with the Angular zone.
 */
@Injectable()
export class NgZoneMessageClientDecorator implements BeanDecorator<MessageClient> {

  constructor(private _zone: NgZone) {
  }

  public decorate(messageClient: MessageClient): MessageClient {
    const zone = this._zone;
    return new class implements MessageClient {

      public publish<T = any>(topic: string, message?: T, options?: PublishOptions): Promise<void> {
        return messageClient.publish(topic, message, options);
      }

      public request$<T>(topic: string, request?: any, options?: RequestOptions): Observable<TopicMessage<T>> {
        return messageClient.request$<T>(topic, request, options).pipe(synchronizeWithAngular(zone));
      }

      public observe$<T>(topic: string): Observable<TopicMessage<T>> {
        return messageClient.observe$<T>(topic).pipe(synchronizeWithAngular(zone));
      }

      public onMessage<IN = any, OUT = any>(topic: string, callback: (message: TopicMessage<IN>) => Observable<OUT> | Promise<OUT> | OUT | void): Subscription {
        return messageClient.onMessage(topic, callback);
      }

      public subscriberCount$(topic: string): Observable<number> {
        return messageClient.subscriberCount$(topic).pipe(synchronizeWithAngular(zone));
      }
    };
  }
}

/**
 * Synchronizes Observable emissions of the {@link IntentClient} with the Angular zone.
 */
@Injectable()
export class NgZoneIntentClientDecorator implements BeanDecorator<IntentClient> {

  constructor(private _zone: NgZone) {
  }

  public decorate(intentClient: IntentClient): IntentClient {
    const zone = this._zone;
    return new class implements IntentClient {

      public publish<T = any>(intent: Intent, body?: T, options?: IntentOptions): Promise<void> {
        return intentClient.publish(intent, body, options);
      }

      public request$<T>(intent: Intent, body?: any, options?: IntentOptions): Observable<TopicMessage<T>> {
        return intentClient.request$<T>(intent, body, options).pipe(synchronizeWithAngular(zone));
      }

      public observe$<T>(selector?: Intent): Observable<IntentMessage<T>> {
        return intentClient.observe$<T>(selector).pipe(synchronizeWithAngular(zone));
      }

      public onIntent<IN = any, OUT = any>(selector: IntentSelector, callback: (intentMessage: IntentMessage<IN>) => Observable<OUT> | Promise<OUT> | OUT | void): Subscription {
        return intentClient.onIntent(selector, callback);
      }
    };
  }
}

function synchronizeWithAngular<T>(zone: NgZone): MonoTypeOperatorFunction<T> {
  return pipe(
    subscribeInside(continueFn => zone.runOutsideAngular(continueFn)),
    observeInside(continueFn => zone.run(continueFn)),
  );
}

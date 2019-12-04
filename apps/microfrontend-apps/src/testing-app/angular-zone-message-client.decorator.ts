/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { BeanDecorator, Beans, MessageClient, TopicMessage } from '@scion/microfrontend-platform';
import { MonoTypeOperatorFunction, Observable, Observer, TeardownLogic } from 'rxjs';
import { NgZone } from '@angular/core';

/**
 * Proxies invocations to the {@link MessageClient}, making Observables to emit inside the Angular zone.
 *
 * Because Angular does not control the Window of the broker gateway, Angular does not notice when messages
 * are received from the gateway, causing the application not being detected for changes.
 */
export class AngularZoneMessageClientDecorator implements BeanDecorator<MessageClient> {

  public decorate(messageClient: MessageClient): MessageClient {
    const zone = Beans.get(NgZone);
    return new class implements MessageClient {

      public publish$(destination: any, payload?: any): Observable<never> {
        return messageClient.publish$(destination, payload).pipe(runInsideAngular(zone));
      }

      public requestReply$<T>(destination: any, payload?: any): Observable<TopicMessage<T>> {
        return messageClient.requestReply$<T>(destination, payload).pipe(runInsideAngular(zone));
      }

      public observe$<T>(destination: any): Observable<any> {
        return messageClient.observe$<T>(destination).pipe(runInsideAngular(zone));
      }

      public subscriberCount$(topic: string): Observable<number> {
        return messageClient.subscriberCount$(topic).pipe(runInsideAngular(zone));
      }
    };
  }
}

function runInsideAngular<T>(zone: NgZone): MonoTypeOperatorFunction<T> {
  return (source: Observable<T>): Observable<T> => {
    return new Observable((observer: Observer<T>): TeardownLogic => {
        const subscription = source.subscribe(
          next => zone.run(() => observer.next(next)),
          error => zone.run(() => observer.error(error)),
          () => zone.run(() => observer.complete()),
        );
        return (): void => subscription.unsubscribe();
      },
    );
  };
}

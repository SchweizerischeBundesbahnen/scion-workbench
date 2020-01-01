/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { concat, EMPTY, from, MonoTypeOperatorFunction, Observable, of, OperatorFunction, pipe } from 'rxjs';
import { filter, map, mergeMap, mergeMapTo, publishLast, refCount, take } from 'rxjs/operators';
import { MessageEnvelope, MessagingChannel, MessagingTransport } from './ɵmessaging.model';
import { Message, TopicMessage } from './messaging.model';
import { TopicMatcher } from './topic-matcher.util';

export function filterByChannel<T>(channel: MessagingChannel): MonoTypeOperatorFunction<MessageEnvelope<T>> {
  return filter((envelope: MessageEnvelope<any>): boolean => {
    return envelope.channel === channel;
  });
}

export function filterByTransport(transport: MessagingTransport): MonoTypeOperatorFunction<MessageEvent> {
  return filter((event: MessageEvent): boolean => {
    const envelope: MessageEnvelope = event.data;
    return envelope && envelope.transport === transport;
  });
}

export function filterByTopic<T>(topic: string): OperatorFunction<MessageEnvelope, TopicMessage<T>> {
  return pipe(
    filterByChannel<TopicMessage>(MessagingChannel.Topic),
    filter(envelope => new TopicMatcher(topic).matcher(envelope.message.topic).matches),
    pluckMessage(),
  );
}

export function pluckMessage<T>(): OperatorFunction<MessageEnvelope<T>, T> {
  return map((envelope: MessageEnvelope<T>): T => {
    return envelope.message;
  });
}

export function pluckEnvelope<T = any>(): OperatorFunction<MessageEvent, MessageEnvelope<T>> {
  return map((messageEvent: MessageEvent): MessageEnvelope<T> => {
    return messageEvent.data;
  });
}

export function filterByOrigin(origin: string): MonoTypeOperatorFunction<MessageEvent> {
  return filter((event: MessageEvent): boolean => {
    return event.origin === origin;
  });
}

export function filterByHeader<T extends Message>(header: { key: string, value: any }): MonoTypeOperatorFunction<T> {
  return filter((message: T): boolean => {
    return message.headers.has(header.key) && message.headers.get(header.key) === header.value;
  });
}

/**
 * Buffers the source Observable values until `closingNotifier$` emits.
 * Once closed, items of the source Observable are emitted as they arrive.
 */
export function bufferUntil<T>(closingNotifier$: Observable<any> | Promise<any>): OperatorFunction<T, T> {
  const guard$ = from(closingNotifier$).pipe(take(1), publishLast(), refCount(), mergeMapTo(EMPTY));
  return mergeMap((item: T) => concat(guard$, of(item)));
}

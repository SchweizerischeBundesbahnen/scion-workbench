/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { MonoTypeOperatorFunction, OperatorFunction, pipe } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { MessageEnvelope, MessagingChannel, MessagingTransport } from '../ɵmessaging.model';
import { Message, TopicMessage } from '../messaging.model';

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
    filter(envelope => envelope.message.topic === topic),
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

export function filterByHeader<T extends Message>(header: { key: string, value: any }): MonoTypeOperatorFunction<MessageEnvelope<T>> {
  return filter((envelope: MessageEnvelope<T>): boolean => {
    const headers = envelope.message.headers;
    return headers.has(header.key) && headers.get(header.key) === header.value;
  });
}

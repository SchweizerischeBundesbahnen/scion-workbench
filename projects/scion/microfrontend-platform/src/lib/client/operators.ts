import { MonoTypeOperatorFunction, OperatorFunction } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { MessageEnvelope, MessagingChannel, MessagingTransport } from '../ɵmessaging.model';
import { TopicMessage } from '../messaging.model';

export function filterByChannel(channel: MessagingChannel): MonoTypeOperatorFunction<MessageEnvelope> {
  return filter((envelope: MessageEnvelope): boolean => {
    return envelope.channel === channel;
  });
}

export function filterByTransport(transport: MessagingTransport): MonoTypeOperatorFunction<MessageEvent> {
  return filter((event: MessageEvent): boolean => {
    const envelope: MessageEnvelope = event.data;
    return envelope && envelope.transport === transport;
  });
}

export function filterByTopic(topic: string): MonoTypeOperatorFunction<MessageEnvelope<TopicMessage>> {
  return filter((envelope: MessageEnvelope<TopicMessage>): boolean => {
    return envelope.message.topic === topic;
  });
}

export function filterEnvelope<T>(filterFn?: (envelope: MessageEnvelope<T>) => boolean): MonoTypeOperatorFunction<MessageEvent> {
  return filter((messageEvent: MessageEvent): boolean => {
    const envelope: MessageEnvelope<T> = messageEvent.data;
    return filterFn(envelope);
  });
}

export function pluckMessage<T>(): OperatorFunction<MessageEnvelope<T>, T> {
  return map((envelope: MessageEnvelope<T>): T => {
    return envelope.message;
  });
}

export function pluckEnvelope(): OperatorFunction<MessageEvent, MessageEnvelope> {
  return map((messageEvent: MessageEvent): MessageEnvelope => {
    return messageEvent.data;
  });
}

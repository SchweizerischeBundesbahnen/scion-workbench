/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { MessageEnvelope, MessagingChannel, MessagingTransport } from '../../ɵmessaging.model';
import { UUID } from '@scion/toolkit/util';
import { MessageHeaders, TopicMessage } from '../../messaging.model';

/**
 * Provides the API to lookup context related information.
 */
export namespace Contexts {

  /**
   * Returns the request-reply topic to lookup the names of associated context values in the context tree.
   */
  export function contextTreeNamesLookupTopic(): string {
    return 'contexttree/names';
  }

  /**
   * Returns the request-reply topic to get notified when some context changes at any level in the context tree.
   */
  export function contextTreeChangeTopic(): string {
    return 'contexttree/change';
  }

  /**
   * Computes the request-reply topic to lookup a context value from embedded router outlet web content.
   */
  export function contextValueLookupTopic(name: string): string {
    return `context/${name}`;
  }

  /**
   * Creates a message envelope to request the context value associated with the given name.
   *
   * @param name
   *        The name of the value to lookup.
   * @param replyTo
   *        The 'replyTo' topic where to send the reply.
   */
  export function newContextValueLookupRequest(name: string, replyTo: string): MessageEnvelope<TopicMessage<void>> {
    return {
      transport: MessagingTransport.EmbeddedOutletContentToOutlet,
      channel: MessagingChannel.Topic,
      message: {
        topic: contextValueLookupTopic(name),
        headers: new Map()
          .set(MessageHeaders.MessageId, UUID.randomUUID())
          .set(MessageHeaders.ReplyTo, replyTo),
      },
    };
  }

  /**
   * Creates a message envelope to lookup the names of associated context values in the context tree.
   *
   * @param replyTo
   *        The 'replyTo' topic where to send the reply.
   * @param names
   *        The names of the current context to be combined with the names of the parent contexts.
   */
  export function newContextTreeNamesLookupRequest(replyTo: string, names?: Set<string>): MessageEnvelope<TopicMessage<Set<string>>> {
    return {
      transport: MessagingTransport.EmbeddedOutletContentToOutlet,
      channel: MessagingChannel.Topic,
      message: {
        topic: Contexts.contextTreeNamesLookupTopic(),
        body: names || new Set<string>(),
        headers: new Map()
          .set(MessageHeaders.MessageId, UUID.randomUUID())
          .set(MessageHeaders.ReplyTo, replyTo),
      },
    };
  }

  /**
   * Creates a message envelope to get notified when some context changes at any level in the context tree.
   *
   * @param replyTo
   *        The 'replyTo' topic where to send the reply.
   */
  export function newContextTreeObserveRequest(replyTo: string): MessageEnvelope<TopicMessage<void>> {
    return {
      transport: MessagingTransport.EmbeddedOutletContentToOutlet,
      channel: MessagingChannel.Topic,
      message: {
        topic: Contexts.contextTreeChangeTopic(),
        headers: new Map()
          .set(MessageHeaders.MessageId, UUID.randomUUID())
          .set(MessageHeaders.ReplyTo, replyTo),
      },
    };
  }

  /**
   * Event emitted when a context value changed.
   */
  export interface ContextTreeChangeEvent {
    type: 'set' | 'remove';
    name: string;
    value?: any;
  }
}

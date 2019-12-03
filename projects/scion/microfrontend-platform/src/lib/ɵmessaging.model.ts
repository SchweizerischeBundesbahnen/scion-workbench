/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { IntentMessage, TopicMessage } from './messaging.model';

/**
 * Declares the message transports.
 */
export enum MessagingTransport {
  /**
   * Transport used by clients to communicate with the broker.
   */
  ClientToBroker = 'sci://microfrontend-platform/client-to-broker',
  /**
   * Transport used by the broker to communicate with its clients.
   */
  BrokerToClient = 'sci://microfrontend-platform/broker-to-client',
  /**
   * Transport to send messages from the client to the gateway.
   */
  ClientToGateway = 'sci://microfrontend-platform/client-to-gateway',
  /**
   * Transport to send messages from the gateway to the client.
   */
  GatewayToClient = 'sci://microfrontend-platform/gateway-to-client',
  /**
   * Transport to send messages from the gateway to the broker.
   */
  GatewayToBroker = 'sci://microfrontend-platform/gateway-to-broker',
  /**
   * Transport to send messages from the broker to the gateway.
   */
  BrokerToGateway = 'sci://microfrontend-platform/broker-to-gateway',
}

/**
 * Defines the channels to which messages can be sent.
 */
export enum MessagingChannel {
  TopicSubscribe = 'topic-subscribe',
  TopicUnsubscribe = 'topic-unsubscribe',
  Intent = 'intent',
  Topic = 'topic',
}

/**
 * Envelope for all messages sent over the message bus.
 */
export interface MessageEnvelope<Message = IntentMessage | TopicMessage | TopicSubscribeCommand | TopicUnsubscribeCommand | BrokerDiscoverCommand> {
  messageId: string;
  transport: MessagingTransport;
  channel: MessagingChannel;
  message?: Message;
}

/**
 * Declares internal platform topics.
 */
export enum PlatformTopics {
  /**
   * Send a request-reply request to this topic to observe the number of subscribers subscribed to the topic in the message payload.
   */
  SubscriberCount = 'ɵSubscriber-count',
  /**
   * A broker gateway broadcasts a broker discovery request on this topic.
   */
  BrokerDiscovery = 'ɵBroker-discovery',
  /**
   * A broker gateway sends a message to this topic before being disposed.
   */
  ClientDispose = 'ɵClient-dispose',
  /**
   * A message client sends a request to this topic to request information about the gateway and the broker.
   */
  GatewayInfoRequest = 'ɵGateway-info-request',
}

export interface BrokerDiscoverCommand {
  symbolicAppName: string;
}

export interface TopicSubscribeCommand {
  topic: string;
}

export interface TopicUnsubscribeCommand {
  topic: string;
}

export interface MessageDeliveryStatus {
  ok: boolean;
  details?: string;
}

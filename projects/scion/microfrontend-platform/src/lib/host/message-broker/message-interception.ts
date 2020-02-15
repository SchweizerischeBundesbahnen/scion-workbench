/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { IntentMessage, TopicMessage } from '../../messaging.model';

/**
 * Allows intercepting messages before their publication.
 *
 * The platform in the host app allows the registration of interceptors to intercept messages before their publication.
 * Multiple interceptors are supported, forming a chain in which each interceptor is called one by one in registration order.
 *
 * When a message is about to be published, it travels along the chain of interceptors. If all interceptors let the message pass, it is finally published.
 * An interceptor can let a message pass, reject it, or swallow it.
 *
 * To register a message interceptor, create a class implementing {@link MessageInterceptor} and register it under the symbol {@link MessageInterceptor}
 * as a `multi` bean in the {@link Beans bean manager}.
 *
 * ```ts
 * class YourMessageInterceptor implements MessageInterceptor {
 *
 *   public intercept(message: TopicMessage, next: Handler<TopicMessage>): void {
 *     if (message.topic === 'a/b/c') {
 *       next.handle(message); // let the message pass by calling the next handler
 *     }
 *     else {
 *       throw Error('reason'); // or throw an error to reject publishing
 *     }
 *   }
 * }
 *
 * // Register the interceptor as `multi` bean in the bean manager.
 * Beans.register(MessageInterceptor, {useClass: YourMessageInterceptor, multi: true});
 * ```
 * @see {@link IntentInterceptor}
 * @category Messaging
 */
export abstract class MessageInterceptor implements Interceptor<TopicMessage, Handler<TopicMessage>> {

  /**
   * Intercepts a message before being published to its topic.
   *
   * Decide if to continue publishing by passing the message to the next handler, or to reject publishing by throwing an error,
   * or to swallow the message by not calling the next handler at all. If rejecting publishing, the error is transported to the
   * message publisher.
   *
   * @param  message - the message to be published to its topic
   * @param  next - the next handler in the chain; invoke its {@link Handler.handle} method to continue publishing.
   * @throws throw an error to reject publishing; the error is transported to the message publisher.
   */
  abstract intercept(message: TopicMessage, next: Handler<TopicMessage>): void;
}

/**
 * Allows intercepting intents before their publication.
 *
 * The platform in the host app allows the registration of interceptors to intercept intents before their publication.
 * Multiple interceptors are supported, forming a chain in which each interceptor is called one by one in registration order.
 *
 * When an intent is about to be published, it travels along the chain of interceptors. If all interceptors let the intent pass, it is finally published.
 * An interceptor can let an intent pass, reject it, or swallow it.
 *
 * To register an intent interceptor, create a class implementing {@link IntentInterceptor} and register it under the symbol {@link IntentInterceptor}
 * as a `multi` bean in the {@link Beans bean manager}.
 *
 * ```ts
 * class YourIntentInterceptor implements IntentInterceptor {
 *
 *   public intercept(intent: IntentMessage, next: Handler<IntentMessage>): void {
 *     if (intent.type === 'abc') {
 *       next.handle(intent); // let the intent pass by calling the next handler
 *     }
 *     else {
 *       throw Error('reason'); // or throw an error to reject publishing
 *     }
 *   }
 * }
 *
 * // Register the interceptor as `multi` bean in the bean manager.
 * Beans.register(IntentInterceptor, {useClass: YourIntentInterceptor, multi: true});
 * ```
 *
 * @see {@link MessageInterceptor}
 * @category Messaging
 */
export abstract class IntentInterceptor implements Interceptor<IntentMessage, Handler<IntentMessage>> {

  /**
   * Intercepts an intent before being published.
   *
   * Decide if to continue publishing by passing the intent to the next handler, or to reject publishing by throwing an error,
   * or to swallow the intent by not calling the next handler at all. If rejecting publishing, the error is transported to
   * the intent issuer.
   *
   * @param  intent - the intent to be published
   * @param  next - the next handler in the chain; invoke its {@link Handler.handle} method to continue publishing.
   * @throws throw an error to reject publishing; the error is transported to the intent issuer.
   */
  abstract intercept(intent: IntentMessage, next: Handler<IntentMessage>): void;
}

/**
 * Chain to intercept messages before they are published. The chain is implemented according to the 'Chain of Responsibility' design pattern.
 *
 * A message travels along the chain of interceptors. If all interceptors let the message pass, it is published.
 *
 * @internal
 */
export interface PublishInterceptorChain<T> {

  /**
   * Passes a message along the chain of interceptors, if any, and publishes it.
   *
   * Each interceptor in the chain can reject publishing by throwing an error, ignore the message by not calling the next handler,
   * or continue the chain by calling the next handler.
   *
   * @throws throws an error if an interceptor rejected publishing.
   */
  publish(message: T): void;
}

/**
 * Assembles the given interceptors to a chain of handlers which are called one after another. The publisher is added as terminal handler.
 *
 * @param interceptors - interceptors to be assembled to a chain
 * @param publisher - terminal handler to publish messages
 * @internal
 */
export function chainInterceptors<T>(interceptors: Interceptor<T, Handler<T>>[], publisher: (message: T) => void): PublishInterceptorChain<T> {
  const terminalHandler = new class extends Handler<T> {
    public handle(message: T): void {
      publisher(message);
    }
  };

  const handlerChain = interceptors.reduceRight((next, interceptor) => new class extends Handler<T> {
    public handle(element: T): void {
      interceptor.intercept(element, next);
    }
  }, terminalHandler);

  return new class implements PublishInterceptorChain<T> {
    public publish(element: T): void {
      handlerChain.handle(element);
    }
  };
}

/**
 * Allows the interception of messages or intents before their publication.
 *
 * @see {@link MessageInterceptor}
 * @see {@link IntentInterceptor}
 *
 * @ignore
 */
export interface Interceptor<T, H extends Handler<T>> {

  intercept(message: T, next: H): void;
}

/**
 * Represents a handler in the chain of interceptors.
 *
 * @category Messaging
 */
export abstract class Handler<T> {
  /**
   * Invoke to continue the chain with the given message.
   */
  abstract handle(message: T): void;
}


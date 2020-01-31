/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { BehaviorSubject, fromEvent, Observable, Subject } from 'rxjs';
import { filter, share, takeUntil } from 'rxjs/operators';
import { filterByChannel, filterByTopic, filterByTransport, pluckEnvelope } from '../../operators';
import { MessageEnvelope, MessagingChannel, MessagingTransport } from '../../ɵmessaging.model';
import { TopicMatcher } from '../../topic-matcher.util';
import { MessageHeaders, ResponseStatusCodes, TopicMessage } from '../../messaging.model';
import { MessageClient, takeUntilUnsubscribe } from '../message-client';
import { Beans } from '../../bean-manager';
import { Contexts } from './context.model';
import { runSafe } from '../../safe-runner';
import { IS_PLATFORM_HOST } from '../../platform.model';

/**
 * Provides a context to the {@link SciRouterOutletElement} allowing the outlet to associate values with that context.
 * For embedded outlet web content, it allows looking up context names and values.
 *
 * A context is a hierarchical key-value map which are linked together to form a tree structure. When a key is not found
 * in a context, the lookup is retried on the parent, repeating until either a value is found or the root of the tree has
 * been reached.
 */
export class RouterOutletContextProvider {

  private _embeddedOutletContentRequest$: Observable<MessageEnvelope<TopicMessage>>;

  private _entries$ = new BehaviorSubject<Map<string, any>>(new Map());
  private _entryChange$ = new Subject<Contexts.ContextTreeChangeEvent>();
  private _outletDisconnect$ = new Subject<void>();

  constructor(iframe: HTMLIFrameElement) {
    // Listen for requests from embedded web content of the outlet.
    this._embeddedOutletContentRequest$ = fromEvent<MessageEvent>(window, 'message')
      .pipe(
        filter(event => event.source === iframe.contentWindow),
        filterByTransport(MessagingTransport.EmbeddedOutletContentToOutlet),
        pluckEnvelope(),
        filterByChannel<TopicMessage>(MessagingChannel.Topic),
        share(),
      );
  }

  /**
   * Sets a value to be associated with a given name in this context.
   *
   * @param name
   *        Specifies the name to store a value for.
   * @param value
   *        Specifies the value to be stored. It can be any object which
   *        is serializable with the structured clone algorithm.
   */
  public set(name: string, value: any): void {
    this._entries$.next(new Map(this._entries$.getValue()).set(name, value));
    this._entryChange$.next({name, value, type: 'set'});
  }

  /**
   * Removes the given name and any corresponding value from this context.
   *
   * Removal does not affect parent contexts, so it is possible that a subsequent call to {@link ContextService#observe$} with the same name
   * will return a non-null result, due to a value being stored in a parent context.
   *
   * @param  name
   *         Specifies the name to remove.
   * @return `true` if the value in the outlet context has been removed successfully; otherwise `false`.
   */
  public remove(name: string): boolean {
    const entries = new Map(this._entries$.getValue());
    if (entries.delete(name)) {
      this._entries$.next(entries);
      this._entryChange$.next({name, type: 'remove'});
      return true;
    }
    return false;
  }

  /**
   * Returns an Observable that emits the values registered in this outlet. Values inherited from parent contexts are not returned.
   * The Observable never completes, and emits when a context value is added or removed.
   */
  public get entries$(): Observable<Map<string, any>> {
    return this._entries$;
  }

  /**
   * Method invoked when the outlet is mounted to the DOM.
   */
  public onOutletMount(): void {
    this.installContextValueLookupListener();
    this.installContextTreeNamesLookupListener();
    this.installContextTreeObserveListener();
  }

  /**
   * Method invoked when the outlet is removed from the DOM.
   */
  public onOutletUnmount(): void {
    this._outletDisconnect$.next();
  }

  /**
   * Installs a listener to reply to context value lookup requests from embedded content.
   * When a key is not found in this context, the lookup is passed on to the parent context.
   */
  private installContextValueLookupListener(): void {
    this._embeddedOutletContentRequest$
      .pipe(
        filterByTopic<void>(Contexts.contextValueLookupTopic(':name')),
        takeUntil(this._outletDisconnect$),
      )
      .subscribe((lookupRequest: TopicMessage<void>) => runSafe(() => {
        const name = new TopicMatcher(Contexts.contextValueLookupTopic(':name')).matcher(lookupRequest.topic).params.get('name');
        const replyTo = lookupRequest.headers.get(MessageHeaders.ReplyTo);
        const entries = this._entries$.getValue();
        if (entries.has(name)) {
          Beans.get(MessageClient).publish$(replyTo, entries.get(name), {headers: new Map().set(MessageHeaders.Status, ResponseStatusCodes.OK)}).subscribe();
        }
        else if (Beans.get(IS_PLATFORM_HOST)) {
          // No context value found; the root of the context tree has been reached; reply with `NOT_FOUND` status code.
          Beans.get(MessageClient).publish$(replyTo, undefined, {headers: new Map().set(MessageHeaders.Status, ResponseStatusCodes.NOT_FOUND)}).subscribe();
        }
        else {
          // Pass on the lookup request to the parent context.
          window.parent.postMessage(Contexts.newContextValueLookupRequest(name, replyTo), '*');
        }
      }));
  }

  /**
   * Installs a listener to reply to context names lookup requests from embedded content.
   *
   * The context names are accumulated in the lookup request and passed on to the parent context.
   * When the root context is reached, the request is finally answered with all collected context names.
   */
  private installContextTreeNamesLookupListener(): void {
    this._embeddedOutletContentRequest$
      .pipe(
        filterByTopic<Set<string>>(Contexts.contextTreeNamesLookupTopic()),
        takeUntil(this._outletDisconnect$),
      )
      .subscribe((lookupRequest: TopicMessage<Set<string>>) => runSafe(() => {
        const replyTo = lookupRequest.headers.get(MessageHeaders.ReplyTo);
        const entries = this._entries$.getValue();
        const collectedNames = new Set<string>([...entries.keys(), ...lookupRequest.body]);
        if (Beans.get(IS_PLATFORM_HOST)) {
          // Answer the request when reaching the root of the context tree.
          Beans.get(MessageClient).publish$(replyTo, collectedNames, {headers: new Map().set(MessageHeaders.Status, ResponseStatusCodes.OK)}).subscribe();
        }
        else {
          // Pass on the lookup request to the parent context.
          window.parent.postMessage(Contexts.newContextTreeNamesLookupRequest(replyTo, collectedNames), '*');
        }
      }));
  }

  /**
   * Installs a listener to publish a context change event when this context changes.
   *
   * For every request a replier is installed which emits when this context changes. It stops replying
   * when the requestor unsubscribes. The request is also passed on to the parent context.
   */
  private installContextTreeObserveListener(): void {
    this._embeddedOutletContentRequest$
      .pipe(
        filterByTopic<void>(Contexts.contextTreeChangeTopic()),
        takeUntil(this._outletDisconnect$),
      )
      .subscribe((observeRequest: TopicMessage<void>) => runSafe(() => {
        const replyTo = observeRequest.headers.get(MessageHeaders.ReplyTo);

        this._entryChange$
          .pipe(
            takeUntil(this._outletDisconnect$),
            takeUntilUnsubscribe(replyTo),
          )
          .subscribe((event: Contexts.ContextTreeChangeEvent) => {
            Beans.get(MessageClient).publish$(replyTo, event).subscribe();
          });

        // Pass on the registration request to the parent context.
        if (!Beans.get(IS_PLATFORM_HOST)) {
          window.parent.postMessage(Contexts.newContextTreeObserveRequest(replyTo), '*');
        }
      }));
  }
}
